import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { PrismaClient } from '@prisma/client'
import { createAuditLog, getClientInfo } from '@/lib/audit'
import { sendLowStockAlert } from '@/lib/email'

const prisma = new PrismaClient()

// GET - Fetch inventory transactions and stock levels
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Only admins and operations can view inventory
    if (!['SUPER_ADMIN', 'ACCOUNT_ADMIN', 'OPERATION'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const productId = searchParams.get('productId')
    const type = searchParams.get('type') // 'in', 'out', 'adjustment'
    const dateFrom = searchParams.get('dateFrom')
    const dateTo = searchParams.get('dateTo')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const stockReport = searchParams.get('stockReport') === 'true'
    const lowStock = searchParams.get('lowStock') === 'true'

    // Stock report - get current stock levels
    if (stockReport) {
      const products = await prisma.product.findMany({
        select: {
          id: true,
          name: true,
          sku: true,
          stock: true,
          minStock: true,
          status: true,
          category: {
            select: {
              name: true
            }
          }
        },
        where: lowStock ? {
          stock: {
            lte: prisma.raw('min_stock')
          },
          status: 'ACTIVE'
        } : {
          status: 'ACTIVE'
        },
        orderBy: { name: 'asc' }
      })

      return NextResponse.json({
        products: products.map(product => ({
          ...product,
          stockStatus: product.stock <= product.minStock ? 'low' : 
                      product.stock <= (product.minStock * 2) ? 'medium' : 'good',
          categoryName: product.category.name
        }))
      })
    }

    // Inventory transactions
    const where: Record<string, unknown> = {}

    if (productId) {
      where.productId = productId
    }

    if (type && type !== 'all') {
      where.type = type
    }

    if (dateFrom) {
      where.createdAt = { gte: new Date(dateFrom) }
    }

    if (dateTo) {
      where.createdAt = where.createdAt 
        ? { ...where.createdAt, lte: new Date(dateTo) }
        : { lte: new Date(dateTo) }
    }

    const skip = (page - 1) * limit

    const [transactions, total] = await Promise.all([
      prisma.inventoryTransaction.findMany({
        where,
        include: {
          product: {
            select: {
              name: true,
              sku: true
            }
          },
          user: {
            select: {
              name: true,
              email: true
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit
      }),
      prisma.inventoryTransaction.count({ where })
    ])

    return NextResponse.json({
      transactions,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    })

  } catch (error) {
    console.error('Error fetching inventory data:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  } finally {
    await prisma.$disconnect()
  }
}

// POST - Create inventory transaction (stock adjustment, purchase, etc.)
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Only admins and operations can modify inventory
    if (!['SUPER_ADMIN', 'ACCOUNT_ADMIN', 'OPERATION'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json()
    const {
      productId,
      type, // 'in', 'out', 'adjustment'
      quantity,
      reason,
      reference,
      updateProductStock = true
    } = body

    if (!productId || !type || quantity === undefined) {
      return NextResponse.json({ error: 'Product ID, type, and quantity are required' }, { status: 400 })
    }

    if (!['in', 'out', 'adjustment'].includes(type)) {
      return NextResponse.json({ error: 'Invalid transaction type' }, { status: 400 })
    }

    // Get current product
    const product = await prisma.product.findUnique({
      where: { id: productId }
    })

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    }

    let newStock = product.stock

    // Calculate new stock based on transaction type
    switch (type) {
      case 'in':
        newStock += Math.abs(quantity)
        break
      case 'out':
        newStock -= Math.abs(quantity)
        break
      case 'adjustment':
        newStock = Math.abs(quantity) // Set to exact quantity
        break
    }

    // Prevent negative stock
    if (newStock < 0) {
      return NextResponse.json({ error: 'Insufficient stock for this transaction' }, { status: 400 })
    }

    // Create transaction and update product stock in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create inventory transaction
      const transaction = await tx.inventoryTransaction.create({
        data: {
          productId,
          type,
          quantity: type === 'adjustment' ? (newStock - product.stock) : 
                   type === 'out' ? -Math.abs(quantity) : Math.abs(quantity),
          reason,
          reference,
          userId: session.user.id
        },
        include: {
          product: {
            select: {
              name: true,
              sku: true
            }
          }
        }
      })

      // Update product stock if requested
      let updatedProduct = product
      if (updateProductStock) {
        updatedProduct = await tx.product.update({
          where: { id: productId },
          data: { stock: newStock }
        })
      }

      return { transaction, product: updatedProduct }
    })

    // Check for low stock and send alerts
    if (result.product.stock <= result.product.minStock) {
      try {
        // Get admin emails
        const admins = await prisma.user.findMany({
          where: {
            role: { in: ['SUPER_ADMIN', 'OPERATION'] },
            isActive: true
          },
          select: { email: true }
        })

        const adminEmails = admins.map(admin => admin.email)

        if (adminEmails.length > 0) {
          await sendLowStockAlert(adminEmails, {
            name: result.product.name,
            sku: result.product.sku,
            stock: result.product.stock,
            minStock: result.product.minStock,
            slug: result.product.slug
          })
        }
      } catch (emailError) {
        console.error('Failed to send low stock alert:', emailError)
      }
    }

    // Create audit log
    const clientInfo = getClientInfo(request)
    await createAuditLog({
      action: 'inventory.transaction',
      resource: 'inventory',
      resourceId: result.transaction.id,
      userId: session.user.id,
      userEmail: session.user.email,
      userName: session.user.name || 'Unknown User',
      details: {
        productId,
        productName: result.transaction.product.name,
        productSku: result.transaction.product.sku,
        type,
        quantity,
        oldStock: product.stock,
        newStock,
        reason,
        reference
      },
      category: 'data',
      severity: 'info',
      ...clientInfo
    })

    return NextResponse.json({
      transaction: result.transaction,
      product: {
        id: result.product.id,
        stock: result.product.stock,
        stockChange: newStock - product.stock
      },
      message: 'Inventory transaction created successfully'
    }, { status: 201 })

  } catch (error) {
    console.error('Error creating inventory transaction:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  } finally {
    await prisma.$disconnect()
  }
}

// PUT - Bulk stock update
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Only super admins can do bulk updates
    if (session.user.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json()
    const { updates, reason = 'Bulk inventory update' } = body

    if (!Array.isArray(updates) || updates.length === 0) {
      return NextResponse.json({ error: 'Updates array is required' }, { status: 400 })
    }

    // Validate updates
    for (const update of updates) {
      if (!update.productId || update.newStock === undefined) {
        return NextResponse.json({ error: 'Each update must have productId and newStock' }, { status: 400 })
      }
    }

    const results = []

    // Process each update
    for (const update of updates) {
      try {
        const product = await prisma.product.findUnique({
          where: { id: update.productId }
        })

        if (!product) {
          results.push({
            productId: update.productId,
            success: false,
            error: 'Product not found'
          })
          continue
        }

        const oldStock = product.stock
        const newStock = Math.max(0, update.newStock) // Ensure non-negative
        const stockChange = newStock - oldStock

        if (stockChange !== 0) {
          // Create transaction and update stock
          await prisma.$transaction(async (tx) => {
            await tx.inventoryTransaction.create({
              data: {
                productId: update.productId,
                type: 'adjustment',
                quantity: stockChange,
                reason,
                reference: 'bulk_update',
                userId: session.user.id
              }
            })

            await tx.product.update({
              where: { id: update.productId },
              data: { stock: newStock }
            })
          })
        }

        results.push({
          productId: update.productId,
          success: true,
          oldStock,
          newStock,
          stockChange
        })

      } catch (error) {
        results.push({
          productId: update.productId,
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        })
      }
    }

    // Create audit log
    const clientInfo = getClientInfo(request)
    await createAuditLog({
      action: 'inventory.bulk_update',
      resource: 'inventory',
      resourceId: 'bulk_operation',
      userId: session.user.id,
      userEmail: session.user.email,
      userName: session.user.name || 'Unknown User',
      details: {
        totalUpdates: updates.length,
        successCount: results.filter(r => r.success).length,
        failureCount: results.filter(r => !r.success).length,
        reason,
        results
      },
      category: 'system',
      severity: 'warning',
      ...clientInfo
    })

    return NextResponse.json({
      message: 'Bulk inventory update completed',
      results,
      summary: {
        total: updates.length,
        success: results.filter(r => r.success).length,
        failed: results.filter(r => !r.success).length
      }
    })

  } catch (error) {
    console.error('Error performing bulk inventory update:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  } finally {
    await prisma.$disconnect()
  }
}
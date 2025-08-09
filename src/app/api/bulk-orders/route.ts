import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { PrismaClient } from '@prisma/client'
import { createAuditLog, getClientInfo } from '@/lib/audit'

const prisma = new PrismaClient()

interface BulkOrderItem {
  productId: string
  sku?: string
  quantity: number
  requestedPrice?: number
}

// GET - Fetch bulk order requests
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // For this demo, we'll store bulk orders in notifications with type 'bulk_order'
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status') || 'all'
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')

    const where: any = {
      type: 'bulk_order'
    }

    // Filter by user role
    if (session.user.role === 'SUPER_ADMIN') {
      // Admins can see all bulk orders
    } else {
      // Users can only see their own
      where.userId = session.user.id
    }

    if (status !== 'all') {
      where.metadata = {
        path: ['status'],
        equals: status
      }
    }

    const skip = (page - 1) * limit

    const [bulkOrders, total] = await Promise.all([
      prisma.notification.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit
      }),
      prisma.notification.count({ where })
    ])

    return NextResponse.json({
      bulkOrders,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    })

  } catch (error) {
    console.error('Error fetching bulk orders:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  } finally {
    await prisma.$disconnect()
  }
}

// POST - Create bulk order request
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const {
      items,
      notes,
      requestedDeliveryDate,
      priority = 'medium'
    } = body

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: 'Items array is required' }, { status: 400 })
    }

    // Validate and process items
    const processedItems = []
    let totalEstimatedValue = 0

    for (const item of items) {
      if (!item.productId && !item.sku) {
        return NextResponse.json({ error: 'Each item must have productId or sku' }, { status: 400 })
      }

      if (!item.quantity || item.quantity <= 0) {
        return NextResponse.json({ error: 'Each item must have valid quantity' }, { status: 400 })
      }

      // Find product by ID or SKU
      let product
      if (item.productId) {
        product = await prisma.product.findUnique({
          where: { id: item.productId }
        })
      } else {
        product = await prisma.product.findUnique({
          where: { sku: item.sku }
        })
      }

      if (!product) {
        return NextResponse.json({ 
          error: `Product not found: ${item.productId || item.sku}` 
        }, { status: 400 })
      }

      const processedItem = {
        productId: product.id,
        productName: product.name,
        sku: product.sku,
        quantity: item.quantity,
        currentPrice: product.price,
        requestedPrice: item.requestedPrice,
        estimatedTotal: (item.requestedPrice || product.price) * item.quantity
      }

      processedItems.push(processedItem)
      totalEstimatedValue += processedItem.estimatedTotal
    }

    // Generate bulk order number
    const bulkOrderNumber = `BULK-${Date.now().toString(36).toUpperCase()}`

    // Create bulk order notification
    const bulkOrder = await prisma.notification.create({
      data: {
        title: `Bulk Order Request - ${bulkOrderNumber}`,
        message: `New bulk order request for ${processedItems.length} items`,
        type: 'bulk_order',
        userId: session.user.id,
        isGlobal: false,
        metadata: {
          bulkOrderNumber,
          status: 'pending',
          priority,
          requestedBy: {
            userId: session.user.id,
            userName: session.user.name,
            userEmail: session.user.email,
            companyId: session.user.companyId
          },
          items: processedItems,
          totalItems: processedItems.length,
          totalEstimatedValue,
          notes,
          requestedDeliveryDate,
          createdAt: new Date().toISOString()
        }
      }
    })

    // Notify admins about new bulk order
    const adminUsers = await prisma.user.findMany({
      where: {
        role: { in: ['SUPER_ADMIN', 'OPERATION'] },
        isActive: true
      },
      select: { id: true }
    })

    // Create notifications for admins
    await Promise.all(
      adminUsers.map(admin =>
        prisma.notification.create({
          data: {
            title: `New Bulk Order Request - ${bulkOrderNumber}`,
            message: `${session.user.name} has requested a bulk order for ${processedItems.length} items worth $${totalEstimatedValue.toFixed(2)}`,
            type: 'info',
            userId: admin.id,
            metadata: {
              bulkOrderId: bulkOrder.id,
              requestedBy: session.user.name,
              totalValue: totalEstimatedValue
            }
          }
        })
      )
    )

    // Create audit log
    const clientInfo = getClientInfo(request)
    await createAuditLog({
      action: 'bulk_order.create',
      resource: 'bulk_order',
      resourceId: bulkOrder.id,
      userId: session.user.id,
      userEmail: session.user.email,
      userName: session.user.name || 'Unknown User',
      details: {
        bulkOrderNumber,
        totalItems: processedItems.length,
        totalEstimatedValue,
        priority,
        items: processedItems.map(item => ({
          productName: item.productName,
          sku: item.sku,
          quantity: item.quantity
        }))
      },
      category: 'data',
      severity: 'info',
      ...clientInfo
    })

    return NextResponse.json({
      bulkOrder: {
        id: bulkOrder.id,
        bulkOrderNumber,
        status: 'pending',
        totalItems: processedItems.length,
        totalEstimatedValue,
        items: processedItems,
        createdAt: bulkOrder.createdAt
      },
      message: 'Bulk order request created successfully'
    }, { status: 201 })

  } catch (error) {
    console.error('Error creating bulk order:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  } finally {
    await prisma.$disconnect()
  }
}

// PUT - Update bulk order status (admin only)
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Only admins can update bulk order status
    if (!['SUPER_ADMIN', 'OPERATION'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const bulkOrderId = searchParams.get('id')
    const body = await request.json()
    const { status, adminNotes, approvedItems, quotedPrices } = body

    if (!bulkOrderId) {
      return NextResponse.json({ error: 'Bulk order ID required' }, { status: 400 })
    }

    if (!['pending', 'approved', 'rejected', 'quoted', 'converted'].includes(status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 })
    }

    // Get current bulk order
    const currentBulkOrder = await prisma.notification.findUnique({
      where: { id: bulkOrderId }
    })

    if (!currentBulkOrder) {
      return NextResponse.json({ error: 'Bulk order not found' }, { status: 404 })
    }

    const metadata = currentBulkOrder.metadata as any
    const updatedMetadata = {
      ...metadata,
      status,
      adminNotes,
      approvedItems,
      quotedPrices,
      updatedBy: {
        userId: session.user.id,
        userName: session.user.name,
        updatedAt: new Date().toISOString()
      }
    }

    // Update bulk order
    const updatedBulkOrder = await prisma.notification.update({
      where: { id: bulkOrderId },
      data: {
        title: `Bulk Order Request - ${metadata.bulkOrderNumber} (${status.toUpperCase()})`,
        metadata: updatedMetadata
      }
    })

    // Notify requester about status change
    if (metadata.requestedBy?.userId) {
      await prisma.notification.create({
        data: {
          title: `Bulk Order ${status.toUpperCase()} - ${metadata.bulkOrderNumber}`,
          message: `Your bulk order request has been ${status}. ${adminNotes || ''}`,
          type: status === 'approved' ? 'success' : status === 'rejected' ? 'error' : 'info',
          userId: metadata.requestedBy.userId,
          metadata: {
            bulkOrderId: updatedBulkOrder.id,
            originalBulkOrderNumber: metadata.bulkOrderNumber,
            status
          }
        }
      })
    }

    // If converting to regular order, create the order
    if (status === 'converted' && approvedItems) {
      // This would integrate with the regular order creation process
      // For now, we'll just log it
      console.log('Converting bulk order to regular order:', {
        bulkOrderId,
        approvedItems
      })
    }

    // Create audit log
    const clientInfo = getClientInfo(request)
    await createAuditLog({
      action: 'bulk_order.status_update',
      resource: 'bulk_order',
      resourceId: bulkOrderId,
      userId: session.user.id,
      userEmail: session.user.email,
      userName: session.user.name || 'Unknown User',
      details: {
        bulkOrderNumber: metadata.bulkOrderNumber,
        oldStatus: metadata.status,
        newStatus: status,
        adminNotes,
        requestedBy: metadata.requestedBy?.userName
      },
      category: 'data',
      severity: 'info',
      ...clientInfo
    })

    return NextResponse.json({
      bulkOrder: {
        id: updatedBulkOrder.id,
        ...updatedMetadata
      },
      message: 'Bulk order status updated successfully'
    })

  } catch (error) {
    console.error('Error updating bulk order:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  } finally {
    await prisma.$disconnect()
  }
}
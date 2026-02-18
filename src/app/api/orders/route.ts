import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'
import { createAuditLog, getClientInfo } from '@/lib/audit'
import { sendOrderConfirmation } from '@/lib/email'
import { nanoid } from 'nanoid'
import { logError } from '@/lib/security'
import { orderSchema, orderStatusUpdateSchema } from '@/lib/validations'
import { z } from 'zod'



// GET - Fetch orders
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const dateFrom = searchParams.get('dateFrom')
    const dateTo = searchParams.get('dateTo')
    const companyFilter = searchParams.get('company') // For super admin filtering
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')

    const where: Record<string, unknown> = {}

    // Filter by user's orders unless admin
    if (!['SUPER_ADMIN', 'ACCOUNT_ADMIN'].includes(session.user.role)) {
      where.userId = session.user.id
    } else if (session.user.role === 'ACCOUNT_ADMIN') {
      where.companyId = session.user.companyId
    } else if (session.user.role === 'SUPER_ADMIN') {
      // Super admin can filter by company or see all
      if (companyFilter && companyFilter !== 'all') {
        if (companyFilter === 'individual') {
          where.companyId = null // Individual buyer orders
        } else {
          where.companyId = companyFilter
        }
      }
    }

    if (status && status !== 'all') {
      where.status = status
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

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        include: {
          user: {
            select: {
              name: true,
              email: true
            }
          },
          company: {
            select: {
              name: true
            }
          },
          shippingAddress: true,
          billingAddress: true,
          orderItems: {
            include: {
              product: {
                select: {
                  name: true,
                  sku: true,
                  images: true
                }
              }
            }
          },
          paymentRecords: {
            select: {
              status: true,
              paymentMethod: true,
              amount: true,
              paidAt: true
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit
      }),
      prisma.order.count({ where })
    ])

    return NextResponse.json({
      orders,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    })

  } catch (error) {
    logError('order.fetch', error)
    return NextResponse.json({ error: 'Something went wrong. Please try again.' }, { status: 500 })
  }
}

// POST - Create new order (checkout)
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const json = await request.json()
    const validation = orderSchema.safeParse(json)

    if (!validation.success) {
      return NextResponse.json({
        error: 'Invalid request data',
        details: validation.error.format()
      }, { status: 400 })
    }

    const {
      shippingAddressId,
      billingAddressId,
      notes,
      paymentMethod,
      paymentToken
    } = validation.data

    // Validate addresses exist and belong to user
    const [shippingAddress, billingAddress] = await Promise.all([
      prisma.address.findFirst({
        where: {
          id: shippingAddressId,
          OR: [
            { userId: session.user.id },
            { companyId: session.user.companyId }
          ]
        }
      }),
      prisma.address.findFirst({
        where: {
          id: billingAddressId,
          OR: [
            { userId: session.user.id },
            { companyId: session.user.companyId }
          ]
        }
      })
    ])

    if (!shippingAddress || !billingAddress) {
      return NextResponse.json({ error: 'Invalid shipping or billing address' }, { status: 400 })
    }

    // Get user's cart items
    const cartItems = await prisma.cartItem.findMany({
      where: { userId: session.user.id },
      include: {
        product: {
          select: {
            id: true,
            name: true,
            price: true,
            stock: true,
            status: true,
            sku: true
          }
        }
      }
    })

    if (cartItems.length === 0) {
      return NextResponse.json({ error: 'Cart is empty' }, { status: 400 })
    }

    // Validate stock and calculate totals
    let subtotal = 0
    const orderItems: any[] = []

    for (const cartItem of cartItems) {
      const product = cartItem.product

      if (product.status !== 'ACTIVE') {
        return NextResponse.json({ error: `Product ${product.name} is not available` }, { status: 400 })
      }

      if (product.stock < cartItem.quantity) {
        return NextResponse.json({ error: `Insufficient stock for ${product.name}` }, { status: 400 })
      }

      const itemSubtotal = product.price * cartItem.quantity
      subtotal += itemSubtotal

      orderItems.push({
        productId: product.id,
        quantity: cartItem.quantity,
        price: product.price // Lock in current price
      })
    }

    // Calculate taxes and shipping
    const tax = subtotal * 0.1 // 10% tax
    const shipping = subtotal > 100 ? 0 : 15 // Free shipping over $100
    const total = subtotal + tax + shipping

    // Generate order number
    const orderNumber = `ORD-${nanoid(10).toUpperCase()}`

    // Create order with transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create order
      const order = await tx.order.create({
        data: {
          orderNumber,
          status: 'PENDING',
          subtotal,
          tax,
          shipping,
          total,
          notes,
          userId: session.user.id,
          companyId: session.user.companyId,
          shippingAddressId,
          billingAddressId,
          orderItems: {
            create: orderItems
          }
        },
        include: {
          orderItems: {
            include: {
              product: {
                select: {
                  name: true,
                  sku: true,
                  images: true
                }
              }
            }
          },
          shippingAddress: true,
          billingAddress: true,
          user: {
            select: {
              name: true,
              email: true
            }
          },
          company: {
            select: {
              name: true
            }
          }
        }
      })

      // Reduce product stock and create inventory transactions
      for (const cartItem of cartItems) {
        await tx.product.update({
          where: { id: cartItem.productId },
          data: {
            stock: {
              decrement: cartItem.quantity
            }
          }
        })

        await tx.inventoryTransaction.create({
          data: {
            productId: cartItem.productId,
            type: 'out',
            quantity: -cartItem.quantity,
            reason: 'sale',
            reference: orderNumber,
            userId: session.user.id
          }
        })
      }

      // Clear user's cart
      await tx.cartItem.deleteMany({
        where: { userId: session.user.id }
      })

      return order
    })

    // Process payment if payment token provided
    if (paymentToken) {
      try {
        const paymentResponse = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/payments`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Cookie': request.headers.get('cookie') || ''
          },
          body: JSON.stringify({
            orderId: result.id,
            amount: total,
            paymentMethod,
            paymentToken
          })
        })

        if (!paymentResponse.ok) {
          // Payment failed, but order is created
          console.error('Payment failed for order:', result.orderNumber)
        }
      } catch (paymentError) {
        console.error('Error processing payment:', paymentError)
      }
    }

    // Send order confirmation email
    try {
      await sendOrderConfirmation(result.user.email, {
        customerName: result.user.name,
        orderNumber: result.orderNumber,
        total: result.total,
        items: result.orderItems.map(item => ({
          name: item.product.name,
          sku: item.product.sku,
          quantity: item.quantity,
          price: item.price
        })),
        shippingAddress: result.shippingAddress,
        estimatedDelivery: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString()
      })
    } catch (emailError) {
      console.error('Failed to send order confirmation email:', emailError)
    }

    // Create audit log
    const clientInfo = getClientInfo(request)
    await createAuditLog({
      action: 'order.create',
      resource: 'order',
      resourceId: result.id,
      userId: session.user.id,
      userEmail: session.user.email || 'unknown@example.com',
      userName: session.user.name || 'Unknown User',
      details: {
        orderNumber: result.orderNumber,
        total: result.total,
        itemCount: result.orderItems.length,
        paymentMethod,
        shippingCity: result.shippingAddress.city
      },
      category: 'data',
      severity: 'info',
      ...clientInfo
    })

    return NextResponse.json({
      order: result,
      message: 'Order created successfully'
    }, { status: 201 })

  } catch (error) {
    logError('order.create', error)
    return NextResponse.json({ error: 'Something went wrong. Please try again.' }, { status: 500 })
  }
}

// PUT - Update order status
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Only admins can update order status
    if (!['SUPER_ADMIN', 'ACCOUNT_ADMIN', 'OPERATION'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const orderId = searchParams.get('id')
    const json = await request.json()

    const validation = orderStatusUpdateSchema.safeParse({ ...json, id: orderId })

    if (!validation.success) {
      return NextResponse.json({
        error: 'Invalid update data',
        details: validation.error.format()
      }, { status: 400 })
    }

    const { status, notes, id: validatedOrderId } = validation.data

    const validStatuses = ['PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED']
    if (!validStatuses.includes(status)) {
      return NextResponse.json({ error: 'Invalid order status' }, { status: 400 })
    }

    // Get current order
    const currentOrder = await prisma.order.findUnique({
      where: { id: validatedOrderId },
      include: {
        orderItems: true,
        user: true
      }
    }) as any // Using as any to bypass complex Prisma include typing for now, or I can define the type. But local fix is faster.


    if (!currentOrder) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    // Handle cancelled orders - restore stock
    if (status === 'CANCELLED' && currentOrder.status !== 'CANCELLED') {
      await prisma.$transaction(async (tx) => {
        // Restore product stock
        for (const item of currentOrder.orderItems) {
          await tx.product.update({
            where: { id: item.productId },
            data: {
              stock: {
                increment: item.quantity
              }
            }
          })

          await tx.inventoryTransaction.create({
            data: {
              productId: item.productId,
              type: 'in',
              quantity: item.quantity,
              reason: 'order_cancelled',
              reference: currentOrder.orderNumber,
              userId: session.user.id
            }
          })
        }
      })
    }

    const updateData: Record<string, unknown> = { status }
    if (notes) updateData.notes = notes

    const updatedOrder = await prisma.order.update({
      where: { id: validatedOrderId },
      data: updateData,
      include: {
        user: true
      }
    })

    // Create audit log
    const clientInfo = getClientInfo(request)
    await createAuditLog({
      action: 'order.status_update',
      resource: 'order',
      resourceId: validatedOrderId,
      userId: session.user.id,
      userEmail: session.user.email || 'unknown@example.com',
      userName: session.user.name || 'Unknown User',
      details: {
        orderNumber: currentOrder.orderNumber,
        oldStatus: currentOrder.status,
        newStatus: status,
        notes
      },
      category: 'data',
      severity: status === 'CANCELLED' ? 'warning' : 'info',
      ...clientInfo
    })

    return NextResponse.json({
      order: updatedOrder,
      message: 'Order status updated successfully'
    })

  } catch (error) {
    logError('order.update', error)
    return NextResponse.json({ error: 'Something went wrong. Please try again.' }, { status: 500 })
  }
}
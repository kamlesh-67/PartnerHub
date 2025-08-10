import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { PrismaClient } from '@prisma/client'
import { createAuditLog, getClientInfo } from '@/lib/audit'

const prisma = new PrismaClient()

// GET - Fetch payment records
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const orderId = searchParams.get('orderId')
    const status = searchParams.get('status')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')

    const where: Record<string, unknown> = {}
    
    // Filter by user's orders unless admin
    if (session.user.role !== 'SUPER_ADMIN') {
      where.order = {
        userId: session.user.id
      }
    }

    if (orderId) {
      where.orderId = orderId
    }

    if (status && status !== 'all') {
      where.status = status
    }

    const skip = (page - 1) * limit

    const [paymentRecords, total] = await Promise.all([
      prisma.paymentRecord.findMany({
        where,
        include: {
          order: {
            select: {
              orderNumber: true,
              total: true,
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
          }
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit
      }),
      prisma.paymentRecord.count({ where })
    ])

    return NextResponse.json({
      paymentRecords,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    })

  } catch (error) {
    console.error('Error fetching payment records:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  } finally {
    await prisma.$disconnect()
  }
}

// POST - Process payment
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const {
      orderId,
      amount,
      currency = 'USD',
      paymentMethod,
      paymentToken, // From Stripe or other gateway
      savePaymentMethod = false
    } = body

    // Validate order exists and belongs to user
    const order = await prisma.order.findFirst({
      where: {
        id: orderId,
        ...(session.user.role !== 'SUPER_ADMIN' ? { userId: session.user.id } : {})
      }
    })

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    if (order.total !== amount) {
      return NextResponse.json({ error: 'Amount mismatch' }, { status: 400 })
    }

    // Check if payment already exists for this order
    const existingPayment = await prisma.paymentRecord.findFirst({
      where: {
        orderId,
        status: { in: ['completed', 'pending'] }
      }
    })

    if (existingPayment) {
      return NextResponse.json({ error: 'Payment already exists for this order' }, { status: 400 })
    }

    // Simulate payment processing (replace with actual Stripe integration)
    let paymentResult
    try {
      paymentResult = await processPayment({
        amount,
        currency,
        paymentToken,
        paymentMethod,
        orderId: order.orderNumber,
        customerEmail: session.user.email || 'unknown@example.com'
      })
    } catch (paymentError: any) {
      // Create failed payment record
      await prisma.paymentRecord.create({
        data: {
          orderId,
          amount,
          currency,
          status: 'failed',
          paymentMethod,
          failureReason: paymentError.message,
          gatewayData: paymentError.details || {}
        }
      })

      return NextResponse.json({ error: paymentError.message }, { status: 400 })
    }

    // Create successful payment record
    const paymentRecord = await prisma.paymentRecord.create({
      data: {
        orderId,
        amount,
        currency,
        status: 'completed',
        paymentMethod,
        gatewayId: paymentResult.transactionId,
        gatewayData: paymentResult.details,
        paidAt: new Date()
      }
    })

    // Update order status
    await prisma.order.update({
      where: { id: orderId },
      data: { status: 'CONFIRMED' }
    })

    // Create audit log
    const clientInfo = getClientInfo(request)
    await createAuditLog({
      action: 'payment.completed',
      resource: 'payment',
      resourceId: paymentRecord.id,
      userId: session.user.id,
      userEmail: session.user.email || 'unknown@example.com',
      userName: session.user.name || 'Unknown User',
      details: {
        orderId,
        amount,
        paymentMethod,
        transactionId: paymentResult.transactionId
      },
      category: 'data',
      severity: 'info',
      ...clientInfo
    })

    return NextResponse.json({
      paymentRecord,
      message: 'Payment processed successfully'
    }, { status: 201 })

  } catch (error) {
    console.error('Error processing payment:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  } finally {
    await prisma.$disconnect()
  }
}

// Simulate payment processing (replace with actual Stripe/PayPal integration)
async function processPayment(paymentData: Record<string, unknown>) {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 1000))

  // Simulate payment success/failure
  const success = Math.random() > 0.1 // 90% success rate for demo

  if (!success) {
    throw new Error('Payment declined by card issuer')
  }

  return {
    transactionId: `txn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    status: 'completed',
    details: {
      card_last4: paymentData.paymentMethod === 'credit_card' ? '4242' : null,
      gateway: 'stripe_simulation',
      processed_at: new Date().toISOString()
    }
  }
}

// PUT - Update payment status (for webhooks or admin)
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Only admins can update payment status manually
    if (!['SUPER_ADMIN', 'ACCOUNT_ADMIN'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const paymentId = searchParams.get('id')
    const body = await request.json()
    const { status, failureReason, refundedAt } = body

    if (!paymentId) {
      return NextResponse.json({ error: 'Payment ID required' }, { status: 400 })
    }

    const updateData: Record<string, unknown> = { status }
    
    if (status === 'failed' && failureReason) {
      updateData.failureReason = failureReason
    }
    
    if (status === 'refunded' && refundedAt) {
      updateData.refundedAt = new Date(refundedAt)
    }

    const paymentRecord = await prisma.paymentRecord.update({
      where: { id: paymentId },
      data: updateData
    })

    // Update order status if payment failed
    if (status === 'failed') {
      await prisma.order.update({
        where: { id: paymentRecord.orderId },
        data: { status: 'CANCELLED' }
      })
    }

    // Create audit log
    const clientInfo = getClientInfo(request)
    await createAuditLog({
      action: 'payment.status_updated',
      resource: 'payment',
      resourceId: paymentId,
      userId: session.user.id,
      userEmail: session.user.email || 'unknown@example.com',
      userName: session.user.name || 'Unknown User',
      details: {
        oldStatus: 'pending',
        newStatus: status,
        paymentId,
        orderId: paymentRecord.orderId
      },
      category: 'data',
      severity: status === 'failed' ? 'warning' : 'info',
      ...clientInfo
    })

    return NextResponse.json({ paymentRecord })

  } catch (error) {
    console.error('Error updating payment:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  } finally {
    await prisma.$disconnect()
  }
}
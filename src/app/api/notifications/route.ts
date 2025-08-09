import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// GET - Fetch notifications for user
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const unreadOnly = searchParams.get('unreadOnly') === 'true'
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const skip = (page - 1) * limit

    const where: any = {
      OR: [
        { userId: session.user.id },
        { isGlobal: true }
      ]
    }

    if (unreadOnly) {
      where.isRead = false
    }

    // Filter out expired notifications
    where.OR = [
      where.OR,
      { expiresAt: null },
      { expiresAt: { gt: new Date() } }
    ].flat()

    const [notifications, total, unreadCount] = await Promise.all([
      prisma.notification.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit
      }),
      prisma.notification.count({ where }),
      prisma.notification.count({
        where: {
          OR: [
            { userId: session.user.id },
            { isGlobal: true }
          ],
          isRead: false,
          OR: [
            { expiresAt: null },
            { expiresAt: { gt: new Date() } }
          ]
        }
      })
    ])

    return NextResponse.json({
      notifications,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      },
      unreadCount
    })

  } catch (error) {
    console.error('Error fetching notifications:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  } finally {
    await prisma.$disconnect()
  }
}

// POST - Create notification
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Only admins can create global notifications
    if (!['SUPER_ADMIN', 'ACCOUNT_ADMIN'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json()
    const {
      title,
      message,
      type = 'info',
      userId,
      isGlobal = false,
      metadata,
      expiresAt
    } = body

    const notification = await prisma.notification.create({
      data: {
        title,
        message,
        type,
        userId: isGlobal ? null : userId,
        isGlobal,
        metadata,
        expiresAt: expiresAt ? new Date(expiresAt) : null
      }
    })

    return NextResponse.json({ notification }, { status: 201 })

  } catch (error) {
    console.error('Error creating notification:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  } finally {
    await prisma.$disconnect()
  }
}

// PUT - Mark notifications as read
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const notificationId = searchParams.get('id')
    const markAllRead = searchParams.get('markAllRead') === 'true'

    if (markAllRead) {
      // Mark all user notifications as read
      await prisma.notification.updateMany({
        where: {
          OR: [
            { userId: session.user.id },
            { isGlobal: true }
          ],
          isRead: false
        },
        data: {
          isRead: true,
          readAt: new Date()
        }
      })

      return NextResponse.json({ message: 'All notifications marked as read' })
    }

    if (notificationId) {
      // Mark specific notification as read
      const notification = await prisma.notification.update({
        where: { id: notificationId },
        data: {
          isRead: true,
          readAt: new Date()
        }
      })

      return NextResponse.json({ notification })
    }

    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })

  } catch (error) {
    console.error('Error updating notification:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  } finally {
    await prisma.$disconnect()
  }
}

// DELETE - Delete notification
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const notificationId = searchParams.get('id')

    if (!notificationId) {
      return NextResponse.json({ error: 'Notification ID required' }, { status: 400 })
    }

    // Users can only delete their own notifications or global ones
    // Admins can delete any notification
    const where: any = { id: notificationId }
    
    if (session.user.role !== 'SUPER_ADMIN') {
      where.OR = [
        { userId: session.user.id },
        { isGlobal: true }
      ]
    }

    await prisma.notification.delete({ where })

    return NextResponse.json({ message: 'Notification deleted' })

  } catch (error) {
    console.error('Error deleting notification:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  } finally {
    await prisma.$disconnect()
  }
}
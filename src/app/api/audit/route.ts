import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// GET - Fetch audit logs
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Only Super Admins can access audit logs
    if (session.user.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search') || ''
    const category = searchParams.get('category') || 'all'
    const severity = searchParams.get('severity') || 'all'
    const dateRange = searchParams.get('dateRange') || '7d'
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50')

    // Calculate date range
    const now = new Date()
    const daysBack = dateRange === '1d' ? 1 : dateRange === '30d' ? 30 : dateRange === '90d' ? 90 : 7
    const startDate = new Date(now)
    startDate.setDate(now.getDate() - daysBack)

    // Build where clause
    const where: Record<string, unknown> = {
      timestamp: { gte: startDate }
    }

    if (search) {
      where.OR = [
        { action: { contains: search, mode: 'insensitive' } },
        { userEmail: { contains: search, mode: 'insensitive' } },
        { userName: { contains: search, mode: 'insensitive' } },
        { resource: { contains: search, mode: 'insensitive' } },
        { resourceId: { contains: search, mode: 'insensitive' } }
      ]
    }

    if (category !== 'all') {
      where.category = category
    }

    if (severity !== 'all') {
      where.severity = severity
    }

    const skip = (page - 1) * limit

    const [auditLogs, total] = await Promise.all([
      prisma.auditLog.findMany({
        where,
        orderBy: { timestamp: 'desc' },
        skip,
        take: limit,
        include: {
          user: {
            select: {
              name: true,
              email: true
            }
          }
        }
      }),
      prisma.auditLog.count({ where })
    ])

    const formattedLogs = auditLogs.map(log => ({
      id: log.id,
      timestamp: log.timestamp.toISOString(),
      action: log.action,
      resource: log.resource,
      resourceId: log.resourceId,
      userId: log.userId,
      userEmail: log.userEmail,
      userName: log.userName,
      ipAddress: log.ipAddress,
      userAgent: log.userAgent,
      details: log.details,
      severity: log.severity,
      category: log.category
    }))

    return NextResponse.json({
      auditLogs: formattedLogs,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    })

  } catch (error) {
    console.error('Error fetching audit logs:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  } finally {
    await prisma.$disconnect()
  }
}

// POST - Create audit log entry
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const {
      action,
      resource,
      resourceId,
      details,
      severity = 'info',
      category = 'system',
      ipAddress,
      userAgent
    } = body

    const auditLog = await prisma.auditLog.create({
      data: {
        action,
        resource,
        resourceId,
        userId: session.user.id,
        userEmail: session.user.email,
        userName: session.user.name || 'Unknown User',
        details,
        severity,
        category,
        ipAddress,
        userAgent
      }
    })

    return NextResponse.json({ auditLog }, { status: 201 })

  } catch (error) {
    console.error('Error creating audit log:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  } finally {
    await prisma.$disconnect()
  }
}
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// GET - Fetch analytics data from database
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check permissions
    if (!['SUPER_ADMIN', 'ACCOUNT_ADMIN'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const timeRange = searchParams.get('timeRange') || '30d'

    // Calculate date range
    const now = new Date()
    const daysBack = timeRange === '7d' ? 7 : timeRange === '90d' ? 90 : timeRange === '1y' ? 365 : 30
    const startDate = new Date(now)
    startDate.setDate(now.getDate() - daysBack)

    // Build where clause based on user role
    const userScope = session.user.role === 'ACCOUNT_ADMIN' 
      ? { companyId: session.user.companyId } 
      : {}

    // Fetch analytics data
    const [
      totalRevenue,
      previousRevenue,
      totalOrders,
      previousOrders,
      totalUsers,
      previousUsers,
      totalProducts,
      previousProducts,
      topProducts,
      topCompanies,
      recentOrders
    ] = await Promise.all([
      // Total revenue (current period)
      prisma.order.aggregate({
        where: {
          ...userScope,
          createdAt: { gte: startDate },
          status: { not: 'CANCELLED' }
        },
        _sum: { total: true }
      }),
      // Previous period revenue for comparison
      prisma.order.aggregate({
        where: {
          ...userScope,
          createdAt: { 
            gte: new Date(startDate.getTime() - (daysBack * 24 * 60 * 60 * 1000)),
            lt: startDate
          },
          status: { not: 'CANCELLED' }
        },
        _sum: { total: true }
      }),
      // Total orders (current period)
      prisma.order.count({
        where: {
          ...userScope,
          createdAt: { gte: startDate }
        }
      }),
      // Previous period orders
      prisma.order.count({
        where: {
          ...userScope,
          createdAt: { 
            gte: new Date(startDate.getTime() - (daysBack * 24 * 60 * 60 * 1000)),
            lt: startDate
          }
        }
      }),
      // Total users (current period)
      prisma.user.count({
        where: {
          ...userScope,
          createdAt: { gte: startDate }
        }
      }),
      // Previous period users
      prisma.user.count({
        where: {
          ...userScope,
          createdAt: { 
            gte: new Date(startDate.getTime() - (daysBack * 24 * 60 * 60 * 1000)),
            lt: startDate
          }
        }
      }),
      // Total products (current period)
      prisma.product.count({
        where: {
          createdAt: { gte: startDate },
          status: 'ACTIVE'
        }
      }),
      // Previous period products
      prisma.product.count({
        where: {
          createdAt: { 
            gte: new Date(startDate.getTime() - (daysBack * 24 * 60 * 60 * 1000)),
            lt: startDate
          },
          status: 'ACTIVE'
        }
      }),
      // Top products by revenue
      prisma.orderItem.groupBy({
        by: ['productId'],
        where: {
          order: {
            ...userScope,
            createdAt: { gte: startDate },
            status: { not: 'CANCELLED' }
          }
        },
        _sum: {
          price: true,
          quantity: true
        },
        orderBy: {
          _sum: {
            price: 'desc'
          }
        },
        take: 10
      }),
      // Top companies by revenue (only for SUPER_ADMIN)
      session.user.role === 'SUPER_ADMIN' ? prisma.order.groupBy({
        by: ['companyId'],
        where: {
          createdAt: { gte: startDate },
          status: { not: 'CANCELLED' },
          companyId: { not: null }
        },
        _sum: {
          total: true
        },
        _count: true,
        orderBy: {
          _sum: {
            total: 'desc'
          }
        },
        take: 10
      }) : [],
      // Recent orders
      prisma.order.findMany({
        where: {
          ...userScope,
          createdAt: { gte: startDate }
        },
        include: {
          company: {
            select: { name: true }
          }
        },
        orderBy: { createdAt: 'desc' },
        take: 10
      })
    ])

    // Get product details for top products
    const productIds = topProducts.map(p => p.productId)
    const productDetails = await prisma.product.findMany({
      where: { id: { in: productIds } },
      select: { id: true, name: true }
    })

    // Get company details for top companies (SUPER_ADMIN only)
    let companyDetails: { id: string; name: string }[] = []
    if (session.user.role === 'SUPER_ADMIN') {
      const companyIds = topCompanies.map((c: any) => c.companyId).filter(Boolean)
      companyDetails = await prisma.company.findMany({
        where: { id: { in: companyIds } },
        select: { id: true, name: true }
      })
    }

    // Calculate percentage changes
    const calculateChange = (current: number, previous: number) => {
      if (previous === 0) return current > 0 ? 100 : 0
      return Number(((current - previous) / previous * 100).toFixed(1))
    }

    const currentRevenue = totalRevenue._sum.total || 0
    const prevRevenue = previousRevenue._sum.total || 0
    const revenueChange = calculateChange(currentRevenue, prevRevenue)

    const ordersChange = calculateChange(totalOrders, previousOrders)
    const usersChange = calculateChange(totalUsers, previousUsers)
    const productsChange = calculateChange(totalProducts, previousProducts)

    // Format top products
    const formattedTopProducts = topProducts.map(product => {
      const details = productDetails.find(p => p.id === product.productId)
      return {
        id: product.productId,
        name: details?.name || 'Unknown Product',
        sales: product._sum.quantity || 0,
        revenue: product._sum.price || 0
      }
    })

    // Format top companies (SUPER_ADMIN only)
    const formattedTopCompanies = session.user.role === 'SUPER_ADMIN' 
      ? topCompanies.map((company: any) => {
          const details = companyDetails.find(c => c.id === company.companyId)
          return {
            id: company.companyId,
            name: details?.name || 'Unknown Company',
            orders: company._count,
            revenue: company._sum.total || 0
          }
        })
      : []

    // Format recent orders
    const formattedRecentOrders = recentOrders.map(order => ({
      id: order.orderNumber,
      company: order.company?.name || 'Unknown',
      amount: order.total,
      status: order.status,
      date: order.createdAt.toISOString().split('T')[0]
    }))

    const analyticsData = {
      totalRevenue: currentRevenue,
      revenueChange,
      totalOrders,
      ordersChange,
      totalUsers,
      usersChange,
      totalProducts,
      productsChange,
      topProducts: formattedTopProducts,
      topCompanies: formattedTopCompanies,
      recentOrders: formattedRecentOrders
    }

    return NextResponse.json(analyticsData)

  } catch (error) {
    console.error('Error fetching analytics:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  } finally {
    await prisma.$disconnect()
  }
}

// POST - Store analytics metrics
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { metricName, metricValue, period, date, metadata } = await request.json()

    const metric = await prisma.analyticsMetric.upsert({
      where: {
        metricName_period_date: {
          metricName,
          period,
          date: new Date(date)
        }
      },
      update: {
        metricValue,
        metadata
      },
      create: {
        metricName,
        metricValue,
        period,
        date: new Date(date),
        metadata
      }
    })

    return NextResponse.json({ metric }, { status: 201 })

  } catch (error) {
    console.error('Error storing analytics metric:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  } finally {
    await prisma.$disconnect()
  }
}
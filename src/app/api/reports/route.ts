import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// GET - Generate and export reports
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Only admins can generate reports
    if (!['SUPER_ADMIN', 'ACCOUNT_ADMIN', 'OPERATION'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const reportType = searchParams.get('type') || 'sales'
    const dateFrom = searchParams.get('dateFrom')
    const dateTo = searchParams.get('dateTo')
    const format = searchParams.get('format') || 'json' // json, csv, xlsx
    const companyId = searchParams.get('companyId')

    // Set default date range (last 30 days)
    const defaultDateTo = new Date()
    const defaultDateFrom = new Date()
    defaultDateFrom.setDate(defaultDateTo.getDate() - 30)

    const startDate = dateFrom ? new Date(dateFrom) : defaultDateFrom
    const endDate = dateTo ? new Date(dateTo) : defaultDateTo

    let reportData: Record<string, unknown> = {}

    switch (reportType) {
      case 'sales':
        reportData = await generateSalesReport(startDate, endDate, session, companyId)
        break
      case 'inventory':
        reportData = await generateInventoryReport(session)
        break
      case 'customers':
        reportData = await generateCustomerReport(startDate, endDate, session, companyId)
        break
      case 'products':
        reportData = await generateProductReport(startDate, endDate, session)
        break
      case 'orders':
        reportData = await generateOrderReport(startDate, endDate, session, companyId)
        break
      case 'audit':
        reportData = await generateAuditReport(startDate, endDate, session)
        break
      default:
        return NextResponse.json({ error: 'Invalid report type' }, { status: 400 })
    }

    if (format === 'csv') {
      const csv = convertToCSV(reportData.data as any[], reportData.headers as string[])
      return new NextResponse(csv, {
        status: 200,
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="${reportType}_report_${new Date().toISOString().split('T')[0]}.csv"`
        }
      })
    }

    if (format === 'xlsx') {
      // In a real implementation, you'd use a library like xlsx to generate Excel files
      return NextResponse.json({ 
        error: 'XLSX format not yet implemented. Please use CSV or JSON.' 
      }, { status: 400 })
    }

    return NextResponse.json({
      reportType,
      dateRange: { from: startDate, to: endDate },
      generatedAt: new Date().toISOString(),
      generatedBy: {
        name: session.user.name,
        email: session.user.email
      },
      ...reportData
    })

  } catch (error) {
    console.error('Error generating report:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  } finally {
    await prisma.$disconnect()
  }
}

// Sales Report
async function generateSalesReport(startDate: Date, endDate: Date, session: Record<string, any>, companyId?: string | null) {
  const where: Record<string, unknown> = {
    createdAt: { gte: startDate, lte: endDate },
    status: { not: 'CANCELLED' }
  }

  // Filter by company if specified or if user is account admin
  if (companyId) {
    where.companyId = companyId
  } else if (session.user.role === 'ACCOUNT_ADMIN') {
    where.companyId = session.user.companyId
  }

  const [orders, ordersByDay, ordersByCompany, topProducts] = await Promise.all([
    // Total orders
    prisma.order.findMany({
      where,
      include: {
        user: { select: { name: true, email: true } },
        company: { select: { name: true } },
        orderItems: {
          include: {
            product: { select: { name: true, sku: true } }
          }
        }
      }
    }),
    
    // Daily sales
    prisma.$queryRaw`
      SELECT DATE(created_at) as date, 
             COUNT(*) as orders_count,
             SUM(total) as total_revenue,
             AVG(total) as avg_order_value
      FROM orders 
      WHERE created_at >= ${startDate} 
        AND created_at <= ${endDate}
        AND status != 'CANCELLED'
        ${companyId ? `AND company_id = '${companyId}'` : ''}
        ${session.user.role === 'ACCOUNT_ADMIN' ? `AND company_id = '${session.user.companyId}'` : ''}
      GROUP BY DATE(created_at)
      ORDER BY date ASC
    `,

    // Sales by company (only for super admin)
    session.user.role === 'SUPER_ADMIN' ? prisma.$queryRaw`
      SELECT c.name as company_name,
             COUNT(o.id) as orders_count,
             SUM(o.total) as total_revenue,
             AVG(o.total) as avg_order_value
      FROM orders o
      JOIN companies c ON o.company_id = c.id
      WHERE o.created_at >= ${startDate} 
        AND o.created_at <= ${endDate}
        AND o.status != 'CANCELLED'
        ${companyId ? `AND o.company_id = '${companyId}'` : ''}
      GROUP BY c.id, c.name
      ORDER BY total_revenue DESC
    ` : [],

    // Top selling products
    prisma.$queryRaw`
      SELECT p.name as product_name,
             p.sku,
             SUM(oi.quantity) as total_sold,
             SUM(oi.price * oi.quantity) as total_revenue
      FROM order_items oi
      JOIN products p ON oi.product_id = p.id
      JOIN orders o ON oi.order_id = o.id
      WHERE o.created_at >= ${startDate} 
        AND o.created_at <= ${endDate}
        AND o.status != 'CANCELLED'
        ${companyId ? `AND o.company_id = '${companyId}'` : ''}
        ${session.user.role === 'ACCOUNT_ADMIN' ? `AND o.company_id = '${session.user.companyId}'` : ''}
      GROUP BY p.id, p.name, p.sku
      ORDER BY total_revenue DESC
      LIMIT 10
    `
  ])

  const summary = {
    totalOrders: orders.length,
    totalRevenue: orders.reduce((sum, order) => sum + order.total, 0),
    averageOrderValue: orders.length > 0 ? orders.reduce((sum, order) => sum + order.total, 0) / orders.length : 0
  }

  return {
    summary,
    dailySales: ordersByDay,
    salesByCompany: ordersByCompany,
    topProducts,
    orders: orders.map(order => ({
      orderNumber: order.orderNumber,
      date: order.createdAt,
      customer: order.user.name,
      company: order.company?.name || 'N/A',
      total: order.total,
      status: order.status,
      itemCount: order.orderItems.length
    })),
    headers: ['Order Number', 'Date', 'Customer', 'Company', 'Total', 'Status', 'Items'],
    data: orders.map(order => [
      order.orderNumber,
      order.createdAt.toISOString().split('T')[0],
      order.user.name,
      order.company?.name || 'N/A',
      order.total,
      order.status,
      order.orderItems.length
    ])
  }
}

// Inventory Report
async function generateInventoryReport(session: Record<string, any>) {
  const products = await prisma.product.findMany({
    include: {
      category: { select: { name: true } },
      _count: {
        select: {
          orderItems: true
        }
      }
    },
    orderBy: { name: 'asc' }
  })

  const lowStockProducts = products.filter(product => product.stock <= product.minStock)
  const outOfStockProducts = products.filter(product => product.stock === 0)

  return {
    summary: {
      totalProducts: products.length,
      activeProducts: products.filter(p => p.status === 'ACTIVE').length,
      lowStockItems: lowStockProducts.length,
      outOfStockItems: outOfStockProducts.length,
      totalInventoryValue: products.reduce((sum, p) => sum + (p.price * p.stock), 0)
    },
    lowStockProducts,
    outOfStockProducts,
    products: products.map(product => ({
      name: product.name,
      sku: product.sku,
      category: product.category.name,
      currentStock: product.stock,
      minStock: product.minStock,
      price: product.price,
      inventoryValue: product.price * product.stock,
      status: product.status,
      totalSold: product._count.orderItems,
      stockStatus: product.stock === 0 ? 'Out of Stock' : 
                  product.stock <= product.minStock ? 'Low Stock' : 'Good'
    })),
    headers: ['Name', 'SKU', 'Category', 'Current Stock', 'Min Stock', 'Price', 'Inventory Value', 'Status', 'Total Sold', 'Stock Status'],
    data: products.map(product => [
      product.name,
      product.sku,
      product.category.name,
      product.stock,
      product.minStock,
      product.price,
      product.price * product.stock,
      product.status,
      product._count.orderItems,
      product.stock === 0 ? 'Out of Stock' : 
      product.stock <= product.minStock ? 'Low Stock' : 'Good'
    ])
  }
}

// Customer Report
async function generateCustomerReport(startDate: Date, endDate: Date, session: Record<string, any>, companyId?: string | null) {
  const where: Record<string, unknown> = {}
  
  if (companyId) {
    where.companyId = companyId
  } else if (session.user.role === 'ACCOUNT_ADMIN') {
    where.companyId = session.user.companyId
  }

  const users = await prisma.user.findMany({
    where,
    include: {
      company: { select: { name: true } },
      orders: {
        where: {
          createdAt: { gte: startDate, lte: endDate }
        }
      },
      _count: {
        select: {
          orders: {
            where: {
              createdAt: { gte: startDate, lte: endDate }
            }
          }
        }
      }
    }
  })

  return {
    summary: {
      totalCustomers: users.length,
      activeCustomers: users.filter(user => user._count.orders > 0).length,
      newCustomers: users.filter(user => 
        new Date(user.createdAt) >= startDate && new Date(user.createdAt) <= endDate
      ).length
    },
    customers: users.map(user => {
      const totalSpent = user.orders.reduce((sum, order) => sum + order.total, 0)
      return {
        name: user.name,
        email: user.email,
        company: user.company?.name || 'N/A',
        role: user.role,
        joinDate: user.createdAt,
        lastLogin: user.lastLogin,
        totalOrders: user._count.orders,
        totalSpent,
        isActive: user.isActive
      }
    }),
    headers: ['Name', 'Email', 'Company', 'Role', 'Join Date', 'Last Login', 'Total Orders', 'Total Spent', 'Active'],
    data: users.map(user => {
      const totalSpent = user.orders.reduce((sum, order) => sum + order.total, 0)
      return [
        user.name,
        user.email,
        user.company?.name || 'N/A',
        user.role,
        user.createdAt.toISOString().split('T')[0],
        user.lastLogin?.toISOString().split('T')[0] || 'Never',
        user._count.orders,
        totalSpent,
        user.isActive ? 'Yes' : 'No'
      ]
    })
  }
}

// Product Performance Report
async function generateProductReport(startDate: Date, endDate: Date, session: Record<string, any>) {
  const products = await prisma.product.findMany({
    include: {
      category: { select: { name: true } },
      orderItems: {
        where: {
          order: {
            createdAt: { gte: startDate, lte: endDate },
            status: { not: 'CANCELLED' }
          }
        },
        include: {
          order: { select: { createdAt: true } }
        }
      }
    }
  })

  return {
    products: products.map(product => {
      const totalSold = product.orderItems.reduce((sum, item) => sum + item.quantity, 0)
      const revenue = product.orderItems.reduce((sum, item) => sum + (item.price * item.quantity), 0)
      
      return {
        name: product.name,
        sku: product.sku,
        category: product.category.name,
        price: product.price,
        stock: product.stock,
        totalSold,
        revenue,
        lastSold: product.orderItems.length > 0 
          ? Math.max(...product.orderItems.map(item => new Date(item.order.createdAt).getTime()))
          : null
      }
    }),
    headers: ['Name', 'SKU', 'Category', 'Price', 'Stock', 'Total Sold', 'Revenue', 'Last Sold'],
    data: products.map(product => {
      const totalSold = product.orderItems.reduce((sum, item) => sum + item.quantity, 0)
      const revenue = product.orderItems.reduce((sum, item) => sum + (item.price * item.quantity), 0)
      const lastSold = product.orderItems.length > 0 
        ? new Date(Math.max(...product.orderItems.map(item => new Date(item.order.createdAt).getTime()))).toISOString().split('T')[0]
        : 'Never'
      
      return [
        product.name,
        product.sku,
        product.category.name,
        product.price,
        product.stock,
        totalSold,
        revenue,
        lastSold
      ]
    })
  }
}

// Order Report
async function generateOrderReport(startDate: Date, endDate: Date, session: Record<string, any>, companyId?: string | null) {
  const where: Record<string, unknown> = {
    createdAt: { gte: startDate, lte: endDate }
  }

  if (companyId) {
    where.companyId = companyId
  } else if (session.user.role === 'ACCOUNT_ADMIN') {
    where.companyId = session.user.companyId
  }

  const orders = await prisma.order.findMany({
    where,
    include: {
      user: { select: { name: true, email: true } },
      company: { select: { name: true } },
      orderItems: {
        include: {
          product: { select: { name: true, sku: true } }
        }
      },
      paymentRecords: { select: { status: true, paymentMethod: true } }
    },
    orderBy: { createdAt: 'desc' }
  })

  const statusCounts = orders.reduce((acc, order) => {
    acc[order.status] = (acc[order.status] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  return {
    summary: {
      totalOrders: orders.length,
      statusBreakdown: statusCounts,
      totalRevenue: orders.filter(o => o.status !== 'CANCELLED').reduce((sum, order) => sum + order.total, 0)
    },
    orders: orders.map(order => ({
      orderNumber: order.orderNumber,
      date: order.createdAt,
      customer: order.user.name,
      company: order.company?.name || 'N/A',
      status: order.status,
      total: order.total,
      itemCount: order.orderItems.length,
      paymentStatus: order.paymentRecords[0]?.status || 'Pending'
    })),
    headers: ['Order Number', 'Date', 'Customer', 'Company', 'Status', 'Total', 'Items', 'Payment Status'],
    data: orders.map(order => [
      order.orderNumber,
      order.createdAt.toISOString().split('T')[0],
      order.user.name,
      order.company?.name || 'N/A',
      order.status,
      order.total,
      order.orderItems.length,
      order.paymentRecords[0]?.status || 'Pending'
    ])
  }
}

// Audit Report (Super Admin only)
async function generateAuditReport(startDate: Date, endDate: Date, session: Record<string, any>) {
  if (session.user.role !== 'SUPER_ADMIN') {
    return { error: 'Unauthorized to access audit logs' }
  }

  const auditLogs = await prisma.auditLog.findMany({
    where: {
      timestamp: { gte: startDate, lte: endDate }
    },
    orderBy: { timestamp: 'desc' },
    take: 1000 // Limit for performance
  })

  const actionCounts = auditLogs.reduce((acc, log) => {
    acc[log.action] = (acc[log.action] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  const severityCounts = auditLogs.reduce((acc, log) => {
    acc[log.severity] = (acc[log.severity] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  return {
    summary: {
      totalLogs: auditLogs.length,
      actionBreakdown: actionCounts,
      severityBreakdown: severityCounts,
      uniqueUsers: new Set(auditLogs.map(log => log.userId)).size
    },
    auditLogs: auditLogs.map(log => ({
      timestamp: log.timestamp,
      action: log.action,
      resource: log.resource,
      userName: log.userName,
      userEmail: log.userEmail,
      severity: log.severity,
      category: log.category,
      ipAddress: log.ipAddress
    })),
    headers: ['Timestamp', 'Action', 'Resource', 'User Name', 'User Email', 'Severity', 'Category', 'IP Address'],
    data: auditLogs.map(log => [
      log.timestamp.toISOString(),
      log.action,
      log.resource,
      log.userName,
      log.userEmail,
      log.severity,
      log.category,
      log.ipAddress
    ])
  }
}

// Helper function to convert data to CSV
function convertToCSV(data: unknown[], headers: string[]): string {
  const csvRows = []
  
  // Add headers
  csvRows.push(headers.join(','))
  
  // Add data rows
  for (const row of data) {
    const values = (row as any[]).map((field: any) => {
      let escaped = ('' + field).replace(/"/g, '\\"')
      if (escaped.search(/("|,|\n)/g) >= 0) {
        escaped = `"${escaped}"`
      }
      return escaped
    })
    csvRows.push(values.join(','))
  }
  
  return csvRows.join('\n')
}
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// GET - Advanced search across products, orders, users, companies
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const query = searchParams.get('q') || ''
    const type = searchParams.get('type') || 'all' // all, products, orders, users, companies
    const category = searchParams.get('category')
    const priceMin = searchParams.get('priceMin')
    const priceMax = searchParams.get('priceMax')
    const status = searchParams.get('status')
    const dateFrom = searchParams.get('dateFrom')
    const dateTo = searchParams.get('dateTo')
    const sortBy = searchParams.get('sortBy') || 'relevance'
    const sortOrder = searchParams.get('sortOrder') || 'desc'
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')

    if (!query && type === 'all') {
      return NextResponse.json({ error: 'Search query is required' }, { status: 400 })
    }

    const results: any = {
      query,
      total: 0,
      results: []
    }

    const skip = (page - 1) * limit

    // Search Products
    if (type === 'all' || type === 'products') {
      const productWhere: any = {
        OR: query ? [
          { name: { contains: query, mode: 'insensitive' } },
          { description: { contains: query, mode: 'insensitive' } },
          { sku: { contains: query, mode: 'insensitive' } },
          { tags: { contains: query, mode: 'insensitive' } }
        ] : undefined
      }

      if (category && category !== 'all') {
        productWhere.category = { slug: category }
      }

      if (priceMin) {
        productWhere.price = { gte: parseFloat(priceMin) }
      }

      if (priceMax) {
        productWhere.price = productWhere.price 
          ? { ...productWhere.price, lte: parseFloat(priceMax) }
          : { lte: parseFloat(priceMax) }
      }

      if (status && status !== 'all') {
        productWhere.status = status
      }

      const orderBy: any = {}
      switch (sortBy) {
        case 'name':
          orderBy.name = sortOrder
          break
        case 'price':
          orderBy.price = sortOrder
          break
        case 'created':
          orderBy.createdAt = sortOrder
          break
        default:
          orderBy.createdAt = 'desc'
      }

      const [products, productsCount] = await Promise.all([
        prisma.product.findMany({
          where: productWhere,
          include: {
            category: {
              select: { name: true, slug: true }
            }
          },
          orderBy,
          skip: type === 'products' ? skip : 0,
          take: type === 'products' ? limit : 10
        }),
        prisma.product.count({ where: productWhere })
      ])

      if (type === 'products') {
        results.products = {
          items: products.map(product => ({
            id: product.id,
            name: product.name,
            description: product.description,
            sku: product.sku,
            price: product.price,
            stock: product.stock,
            status: product.status,
            images: product.images ? JSON.parse(product.images) : [],
            category: product.category,
            slug: product.slug,
            type: 'product'
          })),
          total: productsCount,
          pagination: {
            page,
            limit,
            totalPages: Math.ceil(productsCount / limit)
          }
        }
        results.total = productsCount
        results.results = results.products.items
      } else {
        results.products = products.slice(0, 5).map(product => ({
          ...product,
          type: 'product',
          relevance: calculateRelevance(query, [product.name, product.description, product.sku])
        }))
      }
    }

    // Search Orders (admin only)
    if ((type === 'all' || type === 'orders') && ['SUPER_ADMIN', 'ACCOUNT_ADMIN', 'OPERATION'].includes(session.user.role)) {
      const orderWhere: any = {}

      if (query) {
        orderWhere.OR = [
          { orderNumber: { contains: query, mode: 'insensitive' } },
          { user: { name: { contains: query, mode: 'insensitive' } } },
          { user: { email: { contains: query, mode: 'insensitive' } } },
          { company: { name: { contains: query, mode: 'insensitive' } } }
        ]
      }

      if (status && status !== 'all') {
        orderWhere.status = status
      }

      if (dateFrom) {
        orderWhere.createdAt = { gte: new Date(dateFrom) }
      }

      if (dateTo) {
        orderWhere.createdAt = orderWhere.createdAt
          ? { ...orderWhere.createdAt, lte: new Date(dateTo) }
          : { lte: new Date(dateTo) }
      }

      // Filter by user permissions
      if (session.user.role === 'ACCOUNT_ADMIN') {
        orderWhere.companyId = session.user.companyId
      }

      const [orders, ordersCount] = await Promise.all([
        prisma.order.findMany({
          where: orderWhere,
          include: {
            user: { select: { name: true, email: true } },
            company: { select: { name: true } }
          },
          orderBy: { createdAt: 'desc' },
          skip: type === 'orders' ? skip : 0,
          take: type === 'orders' ? limit : 10
        }),
        prisma.order.count({ where: orderWhere })
      ])

      if (type === 'orders') {
        results.orders = {
          items: orders.map(order => ({
            ...order,
            type: 'order'
          })),
          total: ordersCount,
          pagination: {
            page,
            limit,
            totalPages: Math.ceil(ordersCount / limit)
          }
        }
        results.total = ordersCount
        results.results = results.orders.items
      } else {
        results.orders = orders.slice(0, 5).map(order => ({
          ...order,
          type: 'order',
          relevance: calculateRelevance(query, [order.orderNumber, order.user.name, order.user.email])
        }))
      }
    }

    // Search Users (admin only)
    if ((type === 'all' || type === 'users') && ['SUPER_ADMIN', 'ACCOUNT_ADMIN'].includes(session.user.role)) {
      const userWhere: any = {}

      if (query) {
        userWhere.OR = [
          { name: { contains: query, mode: 'insensitive' } },
          { email: { contains: query, mode: 'insensitive' } },
          { company: { name: { contains: query, mode: 'insensitive' } } }
        ]
      }

      // Account admins can only see users from their company
      if (session.user.role === 'ACCOUNT_ADMIN') {
        userWhere.companyId = session.user.companyId
      }

      const [users, usersCount] = await Promise.all([
        prisma.user.findMany({
          where: userWhere,
          include: {
            company: { select: { name: true } }
          },
          orderBy: { name: 'asc' },
          skip: type === 'users' ? skip : 0,
          take: type === 'users' ? limit : 10
        }),
        prisma.user.count({ where: userWhere })
      ])

      const sanitizedUsers = users.map(user => ({
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        company: user.company,
        isActive: user.isActive,
        createdAt: user.createdAt,
        lastLogin: user.lastLogin,
        type: 'user'
      }))

      if (type === 'users') {
        results.users = {
          items: sanitizedUsers,
          total: usersCount,
          pagination: {
            page,
            limit,
            totalPages: Math.ceil(usersCount / limit)
          }
        }
        results.total = usersCount
        results.results = results.users.items
      } else {
        results.users = sanitizedUsers.slice(0, 5).map(user => ({
          ...user,
          relevance: calculateRelevance(query, [user.name, user.email])
        }))
      }
    }

    // Search Companies (super admin only)
    if ((type === 'all' || type === 'companies') && session.user.role === 'SUPER_ADMIN') {
      const companyWhere: any = {}

      if (query) {
        companyWhere.OR = [
          { name: { contains: query, mode: 'insensitive' } },
          { email: { contains: query, mode: 'insensitive' } },
          { description: { contains: query, mode: 'insensitive' } }
        ]
      }

      const [companies, companiesCount] = await Promise.all([
        prisma.company.findMany({
          where: companyWhere,
          include: {
            _count: {
              select: {
                users: true,
                orders: true
              }
            }
          },
          orderBy: { name: 'asc' },
          skip: type === 'companies' ? skip : 0,
          take: type === 'companies' ? limit : 10
        }),
        prisma.company.count({ where: companyWhere })
      ])

      if (type === 'companies') {
        results.companies = {
          items: companies.map(company => ({
            ...company,
            type: 'company'
          })),
          total: companiesCount,
          pagination: {
            page,
            limit,
            totalPages: Math.ceil(companiesCount / limit)
          }
        }
        results.total = companiesCount
        results.results = results.companies.items
      } else {
        results.companies = companies.slice(0, 5).map(company => ({
          ...company,
          type: 'company',
          relevance: calculateRelevance(query, [company.name, company.email, company.description])
        }))
      }
    }

    // For 'all' type, combine and sort by relevance
    if (type === 'all') {
      const allResults = [
        ...(results.products || []),
        ...(results.orders || []),
        ...(results.users || []),
        ...(results.companies || [])
      ].sort((a, b) => (b.relevance || 0) - (a.relevance || 0))

      results.results = allResults.slice(skip, skip + limit)
      results.total = allResults.length
      results.pagination = {
        page,
        limit,
        totalPages: Math.ceil(allResults.length / limit)
      }
    }

    return NextResponse.json(results)

  } catch (error) {
    console.error('Error performing search:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  } finally {
    await prisma.$disconnect()
  }
}

// Calculate search relevance score
function calculateRelevance(query: string, fields: (string | null | undefined)[]): number {
  if (!query) return 0

  const queryLower = query.toLowerCase()
  let score = 0

  fields.forEach(field => {
    if (!field) return

    const fieldLower = field.toLowerCase()
    
    // Exact match gets highest score
    if (fieldLower === queryLower) {
      score += 10
    }
    // Starts with query gets high score
    else if (fieldLower.startsWith(queryLower)) {
      score += 7
    }
    // Contains query gets medium score
    else if (fieldLower.includes(queryLower)) {
      score += 5
    }
    // Word boundary match gets some score
    else if (new RegExp(`\\b${queryLower}`, 'i').test(field)) {
      score += 3
    }
  })

  return score
}

// POST - Save search (for search history/suggestions)
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { query, type, resultsCount } = body

    // In a real implementation, you might want to store popular searches
    // For now, we'll just return success
    console.log('Search saved:', {
      userId: session.user.id,
      query,
      type,
      resultsCount,
      timestamp: new Date()
    })

    return NextResponse.json({ message: 'Search saved successfully' })

  } catch (error) {
    console.error('Error saving search:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
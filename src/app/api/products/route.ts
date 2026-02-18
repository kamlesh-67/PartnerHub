import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'



// GET - Fetch all products with filtering and pagination
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search') || ''
    const category = searchParams.get('category')
    const status = searchParams.get('status')
    const companyFilter = searchParams.get('company') // For super admin filtering
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '12')
    const skip = (page - 1) * limit

    const where: Record<string, unknown> = {}

    // Company privacy controls
    if (session.user.role === 'SUPER_ADMIN') {
      // Super admin can see all products or filter by company
      if (companyFilter && companyFilter !== 'all') {
        if (companyFilter === 'global') {
          where.companyId = null // Global products (no company)
        } else {
          where.companyId = companyFilter
        }
      }
    } else {
      // All other roles can only see their own company products + global products
      where.OR = [
        { companyId: session.user.companyId }, // Their company products
        { companyId: null }, // Global products
      ]
    }

    // Search filter - combine with company filter
    if (search) {
      const searchConditions = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { sku: { contains: search, mode: 'insensitive' } },
      ]
      
      if (where.OR) {
        // Combine search with existing company filter
        where.AND = [
          { OR: where.OR },
          { OR: searchConditions }
        ]
        delete where.OR
      } else {
        where.OR = searchConditions
      }
    }

    // Category filter
    if (category && category !== 'all') {
      where.category = {
        slug: category
      }
    }

    // Status filter
    if (status && status !== 'all') {
      where.status = status
    }

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        include: {
          category: {
            select: {
              id: true,
              name: true,
              slug: true,
            },
          },
          company: {
            select: {
              id: true,
              name: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.product.count({ where }),
    ])

    // Parse JSON fields
    const formattedProducts = products.map((product) => ({
      ...product,
      images: product.images ? JSON.parse(product.images) : [],
      tags: product.tags ? JSON.parse(product.tags) : [],
      dimensions: product.dimensions ? JSON.parse(product.dimensions) : null,
    }))

    return NextResponse.json({
      products: formattedProducts,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error('Error fetching products:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

// POST - Create new product
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user has permission to create products
    if (!['SUPER_ADMIN', 'ACCOUNT_ADMIN', 'OPERATION'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json()
    const {
      name,
      description,
      shortDescription,
      sku,
      price,
      comparePrice,
      costPrice,
      stock,
      minStock,
      status,
      weight,
      dimensions,
      images,
      tags,
      categoryId,
      companyId, // Company assignment from form
    } = body

    // Validate required fields
    if (!name || !sku || !price || !categoryId) {
      return NextResponse.json(
        { error: 'Missing required fields: name, sku, price, categoryId' },
        { status: 400 }
      )
    }

    // Determine company assignment based on user role
    let assignedCompanyId = null
    if (session.user.role === 'SUPER_ADMIN') {
      // Super admin can assign to any company or leave as global (null)
      assignedCompanyId = companyId === 'global' ? null : companyId
    } else {
      // Other roles can only assign to their own company
      assignedCompanyId = session.user.companyId
    }

    // Check if SKU already exists
    const existingSku = await prisma.product.findUnique({
      where: { sku },
    })

    if (existingSku) {
      return NextResponse.json(
        { error: 'SKU already exists' },
        { status: 400 }
      )
    }

    // Generate slug from name
    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim('-')

    // Check if slug already exists and make it unique
    let uniqueSlug = slug
    let counter = 1
    while (await prisma.product.findUnique({ where: { slug: uniqueSlug } })) {
      uniqueSlug = `${slug}-${counter}`
      counter++
    }

    // Create product
    const product = await prisma.product.create({
      data: {
        name,
        slug: uniqueSlug,
        description,
        shortDescription,
        sku,
        price: parseFloat(price),
        comparePrice: comparePrice ? parseFloat(comparePrice) : null,
        costPrice: costPrice ? parseFloat(costPrice) : null,
        stock: parseInt(stock) || 0,
        minStock: parseInt(minStock) || 0,
        status: status || 'ACTIVE',
        weight: weight ? parseFloat(weight) : null,
        dimensions: dimensions ? JSON.stringify(dimensions) : null,
        images: images ? JSON.stringify(images) : null,
        tags: tags ? JSON.stringify(tags) : null,
        categoryId,
        companyId: assignedCompanyId,
      },
      include: {
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
        company: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    })

    // Format response
    const formattedProduct = {
      ...product,
      images: product.images ? JSON.parse(product.images) : [],
      tags: product.tags ? JSON.parse(product.tags) : [],
      dimensions: product.dimensions ? JSON.parse(product.dimensions) : null,
    }

    return NextResponse.json({ product: formattedProduct }, { status: 201 })
  } catch (error) {
    console.error('Error creating product:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
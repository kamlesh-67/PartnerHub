import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'



// GET - Fetch single product by ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const resolvedParams = await params
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const product = await prisma.product.findUnique({
      where: { id: resolvedParams.id },
      include: {
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
    })

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    }

    // Format response
    const formattedProduct = {
      ...product,
      images: product.images ? JSON.parse(product.images) : [],
      tags: product.tags ? JSON.parse(product.tags) : [],
      dimensions: product.dimensions ? JSON.parse(product.dimensions) : null,
    }

    return NextResponse.json({ product: formattedProduct })
  } catch (error) {
    console.error('Error fetching product:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

// PUT - Update product
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const resolvedParams = await params
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user has permission to update products
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
    } = body

    // Check if product exists
    const existingProduct = await prisma.product.findUnique({
      where: { id: resolvedParams.id },
    })

    if (!existingProduct) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    }

    // Check if SKU already exists (exclude current product)
    if (sku && sku !== existingProduct.sku) {
      const existingSku = await prisma.product.findFirst({
        where: { 
          sku,
          id: { not: resolvedParams.id }
        },
      })

      if (existingSku) {
        return NextResponse.json(
          { error: 'SKU already exists' },
          { status: 400 }
        )
      }
    }

    // Generate slug from name if name is being updated
    let slug = existingProduct.slug
    if (name && name !== existingProduct.name) {
      const newSlug = name
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim('-')

      // Check if slug already exists and make it unique (exclude current product)
      let uniqueSlug = newSlug
      let counter = 1
      while (true) {
        const existingSlug = await prisma.product.findFirst({
          where: { 
            slug: uniqueSlug,
            id: { not: resolvedParams.id }
          }
        })
        if (!existingSlug) break
        uniqueSlug = `${newSlug}-${counter}`
        counter++
      }
      slug = uniqueSlug
    }

    // Update product
    const updatedProduct = await prisma.product.update({
      where: { id: resolvedParams.id },
      data: {
        name: name || existingProduct.name,
        slug,
        description: description !== undefined ? description : existingProduct.description,
        shortDescription: shortDescription !== undefined ? shortDescription : existingProduct.shortDescription,
        sku: sku || existingProduct.sku,
        price: price ? parseFloat(price) : existingProduct.price,
        comparePrice: comparePrice !== undefined ? (comparePrice ? parseFloat(comparePrice) : null) : existingProduct.comparePrice,
        costPrice: costPrice !== undefined ? (costPrice ? parseFloat(costPrice) : null) : existingProduct.costPrice,
        stock: stock !== undefined ? parseInt(stock) : existingProduct.stock,
        minStock: minStock !== undefined ? parseInt(minStock) : existingProduct.minStock,
        status: status || existingProduct.status,
        weight: weight !== undefined ? (weight ? parseFloat(weight) : null) : existingProduct.weight,
        dimensions: dimensions !== undefined ? (dimensions ? JSON.stringify(dimensions) : null) : existingProduct.dimensions,
        images: images !== undefined ? (images ? JSON.stringify(images) : null) : existingProduct.images,
        tags: tags !== undefined ? (tags ? JSON.stringify(tags) : null) : existingProduct.tags,
        categoryId: categoryId || existingProduct.categoryId,
      },
      include: {
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
    })

    // Format response
    const formattedProduct = {
      ...updatedProduct,
      images: updatedProduct.images ? JSON.parse(updatedProduct.images) : [],
      tags: updatedProduct.tags ? JSON.parse(updatedProduct.tags) : [],
      dimensions: updatedProduct.dimensions ? JSON.parse(updatedProduct.dimensions) : null,
    }

    return NextResponse.json({ product: formattedProduct })
  } catch (error) {
    console.error('Error updating product:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

// DELETE - Delete product
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const resolvedParams = await params
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Only Super Admins and Account Admins can delete products
    if (!['SUPER_ADMIN', 'ACCOUNT_ADMIN'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Check if product exists
    const existingProduct = await prisma.product.findUnique({
      where: { id: resolvedParams.id },
    })

    if (!existingProduct) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    }

    // Check if product is used in any cart items or order items
    const [cartItems, orderItems] = await Promise.all([
      prisma.cartItem.count({ where: { productId: resolvedParams.id } }),
      prisma.orderItem.count({ where: { productId: resolvedParams.id } }),
    ])

    if (cartItems > 0 || orderItems > 0) {
      // Instead of deleting, set status to INACTIVE
      await prisma.product.update({
        where: { id: resolvedParams.id },
        data: { status: 'INACTIVE' },
      })

      return NextResponse.json({
        message: 'Product deactivated due to existing references in carts/orders',
        deactivated: true,
      })
    }

    // Safe to delete
    await prisma.product.delete({
      where: { id: resolvedParams.id },
    })

    return NextResponse.json({ message: 'Product deleted successfully' })
  } catch (error) {
    console.error('Error deleting product:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
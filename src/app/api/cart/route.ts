import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// GET - Fetch user's cart
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Build where clause for cart items with company privacy
    const cartWhere: any = { userId: session.user.id }
    
    // Apply company privacy filter to products
    if (session.user.role !== 'SUPER_ADMIN') {
      cartWhere.product = {
        OR: [
          { companyId: session.user.companyId },
          { companyId: null }
        ]
      }
    }

    const cartItems = await prisma.cartItem.findMany({
      where: cartWhere,
      include: {
        product: {
          select: {
            id: true,
            name: true,
            slug: true,
            price: true,
            images: true,
            sku: true,
            stock: true,
            status: true,
            companyId: true,
            company: {
              select: {
                id: true,
                name: true
              }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    // Format cart items
    const formattedCartItems = cartItems.map(item => ({
      id: item.id,
      productId: item.productId,
      name: item.product.name,
      slug: item.product.slug,
      price: item.product.price,
      quantity: item.quantity,
      image: item.product.images ? JSON.parse(item.product.images)[0] : null,
      sku: item.product.sku,
      stock: item.product.stock,
      status: item.product.status,
      subtotal: item.product.price * item.quantity
    }))

    // Calculate totals
    const subtotal = formattedCartItems.reduce((sum, item) => sum + item.subtotal, 0)
    const totalItems = formattedCartItems.reduce((sum, item) => sum + item.quantity, 0)

    return NextResponse.json({
      cartItems: formattedCartItems,
      summary: {
        subtotal,
        totalItems,
        tax: subtotal * 0.1, // 10% tax
        shipping: subtotal > 100 ? 0 : 15, // Free shipping over $100
        total: subtotal + (subtotal * 0.1) + (subtotal > 100 ? 0 : 15)
      }
    })

  } catch (error) {
    console.error('Error fetching cart:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  } finally {
    await prisma.$disconnect()
  }
}

// POST - Add item to cart
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { productId, quantity = 1 } = body

    if (!productId || quantity <= 0) {
      return NextResponse.json({ error: 'Invalid product or quantity' }, { status: 400 })
    }

    // Check if product exists and is available with company privacy controls
    const productWhere: any = { id: productId }
    
    // Apply company privacy filter
    if (session.user.role === 'SUPER_ADMIN') {
      // Super admin can add any product to cart
    } else {
      // Other roles can only add their own company products + global products
      productWhere.OR = [
        { companyId: session.user.companyId },
        { companyId: null }
      ]
    }

    const product = await prisma.product.findFirst({
      where: productWhere
    })

    if (!product) {
      return NextResponse.json({ error: 'Product not found or not accessible' }, { status: 404 })
    }

    if (product.status !== 'ACTIVE') {
      return NextResponse.json({ error: 'Product not available' }, { status: 400 })
    }

    if (product.stock < quantity) {
      return NextResponse.json({ error: 'Insufficient stock' }, { status: 400 })
    }

    // Check if item already exists in cart
    const existingCartItem = await prisma.cartItem.findUnique({
      where: {
        userId_productId: {
          userId: session.user.id,
          productId
        }
      }
    })

    let cartItem
    if (existingCartItem) {
      // Update quantity
      const newQuantity = existingCartItem.quantity + quantity
      
      if (product.stock < newQuantity) {
        return NextResponse.json({ error: 'Insufficient stock' }, { status: 400 })
      }

      cartItem = await prisma.cartItem.update({
        where: { id: existingCartItem.id },
        data: { quantity: newQuantity },
        include: {
          product: {
            select: {
              name: true,
              price: true,
              images: true,
              sku: true,
              stock: true
            }
          }
        }
      })
    } else {
      // Create new cart item
      cartItem = await prisma.cartItem.create({
        data: {
          userId: session.user.id,
          productId,
          quantity
        },
        include: {
          product: {
            select: {
              name: true,
              price: true,
              images: true,
              sku: true,
              stock: true
            }
          }
        }
      })
    }

    return NextResponse.json({
      cartItem: {
        id: cartItem.id,
        productId: cartItem.productId,
        name: cartItem.product.name,
        price: cartItem.product.price,
        quantity: cartItem.quantity,
        image: cartItem.product.images ? JSON.parse(cartItem.product.images)[0] : null,
        sku: cartItem.product.sku,
        stock: cartItem.product.stock,
        subtotal: cartItem.product.price * cartItem.quantity
      },
      message: existingCartItem ? 'Cart item updated' : 'Item added to cart'
    }, { status: existingCartItem ? 200 : 201 })

  } catch (error) {
    console.error('Error adding to cart:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  } finally {
    await prisma.$disconnect()
  }
}

// PUT - Update cart item quantity
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { cartItemId, quantity } = body

    if (!cartItemId || quantity < 0) {
      return NextResponse.json({ error: 'Invalid cart item or quantity' }, { status: 400 })
    }

    // Verify cart item belongs to user
    const cartItem = await prisma.cartItem.findFirst({
      where: {
        id: cartItemId,
        userId: session.user.id
      },
      include: {
        product: true
      }
    })

    if (!cartItem) {
      return NextResponse.json({ error: 'Cart item not found' }, { status: 404 })
    }

    if (quantity === 0) {
      // Remove item from cart
      await prisma.cartItem.delete({
        where: { id: cartItemId }
      })

      return NextResponse.json({ message: 'Item removed from cart' })
    }

    // Check stock availability
    if (cartItem.product.stock < quantity) {
      return NextResponse.json({ error: 'Insufficient stock' }, { status: 400 })
    }

    // Update quantity
    const updatedCartItem = await prisma.cartItem.update({
      where: { id: cartItemId },
      data: { quantity },
      include: {
        product: {
          select: {
            name: true,
            price: true,
            images: true,
            sku: true,
            stock: true
          }
        }
      }
    })

    return NextResponse.json({
      cartItem: {
        id: updatedCartItem.id,
        productId: updatedCartItem.productId,
        name: updatedCartItem.product.name,
        price: updatedCartItem.product.price,
        quantity: updatedCartItem.quantity,
        image: updatedCartItem.product.images ? JSON.parse(updatedCartItem.product.images)[0] : null,
        sku: updatedCartItem.product.sku,
        stock: updatedCartItem.product.stock,
        subtotal: updatedCartItem.product.price * updatedCartItem.quantity
      },
      message: 'Cart item updated'
    })

  } catch (error) {
    console.error('Error updating cart item:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  } finally {
    await prisma.$disconnect()
  }
}

// DELETE - Remove item from cart or clear cart
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const cartItemId = searchParams.get('itemId')
    const clearAll = searchParams.get('clearAll') === 'true'

    if (clearAll) {
      // Clear entire cart
      await prisma.cartItem.deleteMany({
        where: { userId: session.user.id }
      })

      return NextResponse.json({ message: 'Cart cleared' })
    }

    if (!cartItemId) {
      return NextResponse.json({ error: 'Cart item ID required' }, { status: 400 })
    }

    // Verify cart item belongs to user
    const cartItem = await prisma.cartItem.findFirst({
      where: {
        id: cartItemId,
        userId: session.user.id
      }
    })

    if (!cartItem) {
      return NextResponse.json({ error: 'Cart item not found' }, { status: 404 })
    }

    await prisma.cartItem.delete({
      where: { id: cartItemId }
    })

    return NextResponse.json({ message: 'Item removed from cart' })

  } catch (error) {
    console.error('Error removing from cart:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  } finally {
    await prisma.$disconnect()
  }
}
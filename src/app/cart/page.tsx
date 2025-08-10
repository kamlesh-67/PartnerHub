'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useAppSelector, useAppDispatch } from '@/lib/store'
import { updateQuantity, removeFromCart, clearCart } from '@/lib/features/cart/cartSlice'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import { 
  ShoppingCart, 
  Minus,
  Plus,
  Trash2,
  ArrowLeft,
  CreditCard,
  Package,
  AlertCircle
} from 'lucide-react'
import Link from 'next/link'

export default function CartPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const dispatch = useAppDispatch()
  const { items, total, itemCount } = useAppSelector(state => state.cart)
  const [isLoading, setIsLoading] = useState(false)

  // Redirect to signin if not authenticated
  if (status === 'loading') {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>
  }

  if (!session) {
    router.push('/auth/signin')
    return null
  }

  const updateItemQuantity = (productId: string, newQuantity: number) => {
    if (newQuantity < 1) {
      dispatch(removeFromCart(productId))
    } else {
      dispatch(updateQuantity({ productId, quantity: newQuantity }))
    }
  }

  const handleRemoveItem = (productId: string) => {
    dispatch(removeFromCart(productId))
  }

  const handleClearCart = () => {
    dispatch(clearCart())
  }

  const handleCheckout = async () => {
    setIsLoading(true)
    // Simulate checkout process
    setTimeout(() => {
      setIsLoading(false)
      // In a real app, this would redirect to checkout or payment page
      alert('Checkout functionality would be implemented here!')
    }, 2000)
  }

  const subtotal = total
  const tax = subtotal * 0.08 // 8% tax
  const shipping = subtotal > 500 ? 0 : 25 // Free shipping over $500
  const finalTotal = subtotal + tax + shipping

  if (items.length === 0) {
    return (
      <div className="container mx-auto py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold mb-2">Shopping Cart</h1>
              <p className="text-muted-foreground">Your cart is currently empty</p>
            </div>
            <div className="flex items-center space-x-2">
              <Badge variant="outline">
                {session.user.company?.name || 'Individual'}
              </Badge>
              <Badge>
                {session.user.role.replace('_', ' ')}
              </Badge>
            </div>
          </div>

          {/* Empty Cart State */}
          <Card className="text-center py-16">
            <CardContent>
              <ShoppingCart className="h-24 w-24 text-gray-300 mx-auto mb-6" />
              <h2 className="text-2xl font-semibold mb-4">Your cart is empty</h2>
              <p className="text-muted-foreground mb-8">
                Looks like you haven&apos;t added any products to your cart yet.
              </p>
              <Button asChild size="lg">
                <Link href="/products">
                  <Package className="h-4 w-4 mr-2" />
                  Continue Shopping
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">Shopping Cart</h1>
            <p className="text-muted-foreground">
              {itemCount} {itemCount === 1 ? 'item' : 'items'} in your cart
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <Badge variant="outline">
              {session.user.company?.name || 'Individual'}
            </Badge>
            <Badge>
              {session.user.role.replace('_', ' ')}
            </Badge>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Cart Items</h2>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleClearCart}
                className="text-red-600 hover:text-red-700"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Clear Cart
              </Button>
            </div>

            {items.map((item) => (
              <Card key={item.productId}>
                <CardContent className="p-6">
                  <div className="flex items-center space-x-4">
                    {/* Product Image Placeholder */}
                    <div className="w-20 h-20 bg-gray-100 rounded-lg flex items-center justify-center">
                      <Package className="h-8 w-8 text-gray-400" />
                    </div>

                    {/* Product Details */}
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg">{item.name}</h3>
                      <p className="text-sm text-muted-foreground">SKU: {item.sku}</p>
                      <div className="flex items-center space-x-2 mt-2">
                        <Badge variant="outline" className="text-xs">
                          {item.stock > 0 ? `${item.stock} in stock` : 'Out of stock'}
                        </Badge>
                      </div>
                    </div>

                    {/* Quantity Controls */}
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => updateItemQuantity(item.productId, item.quantity - 1)}
                        disabled={item.quantity <= 1}
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                      <Input
                        type="number"
                        value={item.quantity}
                        onChange={(e) => updateItemQuantity(item.productId, parseInt(e.target.value) || 1)}
                        className="w-16 text-center"
                        min="1"
                        max={item.stock}
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => updateItemQuantity(item.productId, item.quantity + 1)}
                        disabled={item.quantity >= item.stock}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>

                    {/* Price */}
                    <div className="text-right">
                      <p className="font-semibold text-lg">${(item.price * item.quantity).toFixed(2)}</p>
                      <p className="text-sm text-muted-foreground">${item.price.toFixed(2)} each</p>
                    </div>

                    {/* Remove Button */}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveItem(item.productId)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}

            {/* Continue Shopping */}
            <div className="pt-4">
              <Button variant="outline" asChild>
                <Link href="/products">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Continue Shopping
                </Link>
              </Button>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <Card className="sticky top-4">
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
                <CardDescription>
                  Review your order before checkout
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span>Subtotal ({itemCount} items)</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
                
                <div className="flex justify-between">
                  <span>Tax (8%)</span>
                  <span>${tax.toFixed(2)}</span>
                </div>
                
                <div className="flex justify-between">
                  <span>Shipping</span>
                  <span>{shipping === 0 ? 'Free' : `$${shipping.toFixed(2)}`}</span>
                </div>

                {shipping === 0 && (
                  <div className="flex items-center space-x-2 text-green-600 text-sm">
                    <AlertCircle className="h-4 w-4" />
                    <span>Free shipping on orders over $500!</span>
                  </div>
                )}

                <Separator />
                
                <div className="flex justify-between text-lg font-semibold">
                  <span>Total</span>
                  <span>${finalTotal.toFixed(2)}</span>
                </div>

                <Button 
                  className="w-full" 
                  size="lg"
                  onClick={handleCheckout}
                  disabled={isLoading}
                >
                  <CreditCard className="h-4 w-4 mr-2" />
                  {isLoading ? 'Processing...' : 'Proceed to Checkout'}
                </Button>

                <div className="text-xs text-muted-foreground text-center">
                  Secure checkout powered by our B2B platform
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

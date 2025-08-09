'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { 
  CreditCard, 
  MapPin, 
  Package, 
  ShoppingCart,
  Loader2,
  CheckCircle,
  AlertCircle
} from 'lucide-react'
import { toast } from 'sonner'

interface CartItem {
  id: string
  productId: string
  name: string
  price: number
  quantity: number
  image: string
  sku: string
  subtotal: number
}

interface CartSummary {
  subtotal: number
  totalItems: number
  tax: number
  shipping: number
  total: number
}

interface Address {
  id: string
  street: string
  city: string
  state: string
  zipCode: string
  country: string
  type: string
  isDefault: boolean
}

export default function CheckoutPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [cartItems, setCartItems] = useState<CartItem[]>([])
  const [cartSummary, setCartSummary] = useState<CartSummary | null>(null)
  const [addresses, setAddresses] = useState<Address[]>([])
  const [selectedShippingAddress, setSelectedShippingAddress] = useState('')
  const [selectedBillingAddress, setSelectedBillingAddress] = useState('')
  const [paymentMethod, setPaymentMethod] = useState('credit_card')
  const [notes, setNotes] = useState('')
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [orderComplete, setOrderComplete] = useState(false)
  const [orderNumber, setOrderNumber] = useState('')

  // Payment form state
  const [cardNumber, setCardNumber] = useState('4242 4242 4242 4242')
  const [expiryDate, setExpiryDate] = useState('12/25')
  const [cvv, setCvv] = useState('123')
  const [cardholderName, setCardholderName] = useState('')

  useEffect(() => {
    if (status === 'loading') return
    if (!session) {
      router.push('/auth/signin?redirect=/checkout')
      return
    }

    fetchCartAndAddresses()
  }, [session, status])

  const fetchCartAndAddresses = async () => {
    try {
      const [cartResponse, addressResponse] = await Promise.all([
        fetch('/api/cart'),
        fetch('/api/addresses')
      ])

      if (cartResponse.ok) {
        const cartData = await cartResponse.json()
        setCartItems(cartData.cartItems)
        setCartSummary(cartData.summary)
      }

      if (addressResponse.ok) {
        const addressData = await addressResponse.json()
        setAddresses(addressData.addresses)
        
        // Auto-select default addresses
        const defaultShipping = addressData.addresses.find((addr: Address) => 
          addr.type === 'shipping' && addr.isDefault
        )
        const defaultBilling = addressData.addresses.find((addr: Address) => 
          addr.type === 'billing' && addr.isDefault
        )
        
        if (defaultShipping) setSelectedShippingAddress(defaultShipping.id)
        if (defaultBilling) setSelectedBillingAddress(defaultBilling.id)
      }
    } catch (error) {
      console.error('Error fetching checkout data:', error)
      toast.error('Failed to load checkout information')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmitOrder = async () => {
    if (!selectedShippingAddress || !selectedBillingAddress) {
      toast.error('Please select shipping and billing addresses')
      return
    }

    if (!cardholderName.trim()) {
      toast.error('Please enter cardholder name')
      return
    }

    setSubmitting(true)

    try {
      // Simulate payment token (in real app, this would come from Stripe)
      const paymentToken = `tok_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          shippingAddressId: selectedShippingAddress,
          billingAddressId: selectedBillingAddress,
          notes,
          paymentMethod,
          paymentToken
        })
      })

      if (response.ok) {
        const data = await response.json()
        setOrderNumber(data.order.orderNumber)
        setOrderComplete(true)
        toast.success('Order placed successfully!')
        
        // Clear form
        setCardNumber('')
        setExpiryDate('')
        setCvv('')
        setCardholderName('')
        setNotes('')
      } else {
        const error = await response.json()
        toast.error(error.error || 'Failed to place order')
      }
    } catch (error) {
      console.error('Error placing order:', error)
      toast.error('Failed to place order')
    } finally {
      setSubmitting(false)
    }
  }

  if (status === 'loading' || loading) {
    return (
      <div className="container mx-auto py-8">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </div>
    )
  }

  if (!session) {
    return null
  }

  if (orderComplete) {
    return (
      <div className="container mx-auto py-8">
        <Card className="max-w-md mx-auto text-center">
          <CardHeader>
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <CardTitle>Order Placed Successfully!</CardTitle>
            <CardDescription>Thank you for your order</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="mb-4">Your order number is:</p>
            <Badge variant="outline" className="text-lg py-2 px-4 mb-6">
              {orderNumber}
            </Badge>
            <div className="space-y-2">
              <Button onClick={() => router.push('/orders')} className="w-full">
                View Orders
              </Button>
              <Button variant="outline" onClick={() => router.push('/products')} className="w-full">
                Continue Shopping
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!cartItems.length) {
    return (
      <div className="container mx-auto py-8">
        <Card className="max-w-md mx-auto text-center">
          <CardHeader>
            <ShoppingCart className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <CardTitle>Your cart is empty</CardTitle>
            <CardDescription>Add some items to proceed with checkout</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => router.push('/products')} className="w-full">
              Continue Shopping
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const shippingAddresses = addresses.filter(addr => addr.type === 'shipping')
  const billingAddresses = addresses.filter(addr => addr.type === 'billing')

  return (
    <div className="container mx-auto py-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Checkout Form */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center space-x-4 mb-6">
            <ShoppingCart className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold">Checkout</h1>
          </div>

          {/* Shipping Address */}
          <Card>
            <CardHeader>
              <div className="flex items-center space-x-2">
                <MapPin className="h-5 w-5" />
                <CardTitle>Shipping Address</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <Select value={selectedShippingAddress} onValueChange={setSelectedShippingAddress}>
                <SelectTrigger>
                  <SelectValue placeholder="Select shipping address" />
                </SelectTrigger>
                <SelectContent>
                  {shippingAddresses.map(address => (
                    <SelectItem key={address.id} value={address.id}>
                      {address.street}, {address.city}, {address.state} {address.zipCode}
                      {address.isDefault && ' (Default)'}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {shippingAddresses.length === 0 && (
                <div className="flex items-center space-x-2 mt-2 text-amber-600">
                  <AlertCircle className="h-4 w-4" />
                  <span className="text-sm">No shipping addresses found. Please add one in your profile.</span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Billing Address */}
          <Card>
            <CardHeader>
              <CardTitle>Billing Address</CardTitle>
            </CardHeader>
            <CardContent>
              <Select value={selectedBillingAddress} onValueChange={setSelectedBillingAddress}>
                <SelectTrigger>
                  <SelectValue placeholder="Select billing address" />
                </SelectTrigger>
                <SelectContent>
                  {billingAddresses.map(address => (
                    <SelectItem key={address.id} value={address.id}>
                      {address.street}, {address.city}, {address.state} {address.zipCode}
                      {address.isDefault && ' (Default)'}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {billingAddresses.length === 0 && (
                <div className="flex items-center space-x-2 mt-2 text-amber-600">
                  <AlertCircle className="h-4 w-4" />
                  <span className="text-sm">No billing addresses found. Please add one in your profile.</span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Payment Information */}
          <Card>
            <CardHeader>
              <div className="flex items-center space-x-2">
                <CreditCard className="h-5 w-5" />
                <CardTitle>Payment Information</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="paymentMethod">Payment Method</Label>
                <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="credit_card">Credit Card</SelectItem>
                    <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                    <SelectItem value="paypal">PayPal</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {paymentMethod === 'credit_card' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <Label htmlFor="cardholderName">Cardholder Name</Label>
                    <Input
                      id="cardholderName"
                      value={cardholderName}
                      onChange={(e) => setCardholderName(e.target.value)}
                      placeholder="John Doe"
                      required
                    />
                  </div>
                  <div className="md:col-span-2">
                    <Label htmlFor="cardNumber">Card Number</Label>
                    <Input
                      id="cardNumber"
                      value={cardNumber}
                      onChange={(e) => setCardNumber(e.target.value)}
                      placeholder="1234 5678 9012 3456"
                    />
                  </div>
                  <div>
                    <Label htmlFor="expiryDate">Expiry Date</Label>
                    <Input
                      id="expiryDate"
                      value={expiryDate}
                      onChange={(e) => setExpiryDate(e.target.value)}
                      placeholder="MM/YY"
                    />
                  </div>
                  <div>
                    <Label htmlFor="cvv">CVV</Label>
                    <Input
                      id="cvv"
                      value={cvv}
                      onChange={(e) => setCvv(e.target.value)}
                      placeholder="123"
                    />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Order Notes */}
          <Card>
            <CardHeader>
              <CardTitle>Order Notes</CardTitle>
              <CardDescription>Any special instructions for your order?</CardDescription>
            </CardHeader>
            <CardContent>
              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Special delivery instructions, etc."
                rows={3}
              />
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Order Summary */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center space-x-2">
                <Package className="h-5 w-5" />
                <CardTitle>Order Summary</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {cartItems.map(item => (
                <div key={item.id} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    {item.image && (
                      <img 
                        src={item.image} 
                        alt={item.name}
                        className="w-12 h-12 object-cover rounded"
                      />
                    )}
                    <div>
                      <p className="font-medium text-sm">{item.name}</p>
                      <p className="text-xs text-muted-foreground">
                        ${item.price} × {item.quantity}
                      </p>
                    </div>
                  </div>
                  <p className="font-medium">${item.subtotal.toFixed(2)}</p>
                </div>
              ))}

              <Separator />

              {cartSummary && (
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Subtotal ({cartSummary.totalItems} items)</span>
                    <span>${cartSummary.subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Tax</span>
                    <span>${cartSummary.tax.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Shipping</span>
                    <span>{cartSummary.shipping === 0 ? 'Free' : `$${cartSummary.shipping.toFixed(2)}`}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total</span>
                    <span>${cartSummary.total.toFixed(2)}</span>
                  </div>
                </div>
              )}

              <Button 
                onClick={handleSubmitOrder} 
                disabled={submitting || !selectedShippingAddress || !selectedBillingAddress}
                className="w-full mt-6"
                size="lg"
              >
                {submitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  `Place Order - $${cartSummary?.total.toFixed(2) || '0.00'}`
                )}
              </Button>

              {(!selectedShippingAddress || !selectedBillingAddress) && (
                <p className="text-sm text-muted-foreground text-center">
                  Please select shipping and billing addresses to continue
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
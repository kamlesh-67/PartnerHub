'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { 
  ShoppingCart, 
  Search, 
  Filter,
  Eye,
  Package,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Truck,
  Calendar,
  DollarSign,
  ArrowRight,
  Download
} from 'lucide-react'
import { hasPermission, type UserRole } from '@/lib/permissions'

interface OrderItem {
  id: string
  quantity: number
  price: number
  product: {
    name: string
    sku: string
    images?: string[]
  }
}

interface Order {
  id: string
  orderNumber: string
  status: 'PENDING' | 'CONFIRMED' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED'
  subtotal: number
  tax: number
  shipping: number
  discount: number
  total: number
  notes?: string
  orderItems: OrderItem[]
  createdAt: string
  updatedAt: string
  shippingAddress?: {
    street: string
    city: string
    state: string
    zipCode: string
    country: string
  }
}

export default function MyOrdersPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedStatus, setSelectedStatus] = useState<string>('all')
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [showOrderDialog, setShowOrderDialog] = useState(false)

  const userRole = session?.user?.role as UserRole

  useEffect(() => {
    if (status === 'loading') return

    if (!session) {
      router.push('/auth/signin')
      return
    }

    // Only buyers and account admins can view their orders
    if (!hasPermission(userRole, 'canViewOwnOrders')) {
      router.push('/unauthorized')
      return
    }

    fetchMyOrders()
  }, [session, status, userRole, router])

  const fetchMyOrders = async () => {
    try {
      const response = await fetch('/api/user/orders')
      if (response.ok) {
        const data = await response.json()
        setOrders(data.orders)
      }
    } catch (error) {
      console.error('Failed to fetch orders:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.orderItems.some(item => 
                           item.product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           item.product.sku.toLowerCase().includes(searchTerm.toLowerCase())
                         )
    
    const matchesStatus = selectedStatus === 'all' || order.status === selectedStatus

    return matchesSearch && matchesStatus
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800'
      case 'CONFIRMED':
        return 'bg-blue-100 text-blue-800'
      case 'PROCESSING':
        return 'bg-purple-100 text-purple-800'
      case 'SHIPPED':
        return 'bg-indigo-100 text-indigo-800'
      case 'DELIVERED':
        return 'bg-green-100 text-green-800'
      case 'CANCELLED':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PENDING':
        return Clock
      case 'CONFIRMED':
        return CheckCircle
      case 'PROCESSING':
        return Package
      case 'SHIPPED':
        return Truck
      case 'DELIVERED':
        return CheckCircle
      case 'CANCELLED':
        return XCircle
      default:
        return AlertTriangle
    }
  }

  const canCancelOrder = (order: Order) => {
    return hasPermission(userRole, 'canCancelOrders') && 
           (order.status === 'PENDING' || order.status === 'CONFIRMED')
  }

  const handleCancelOrder = async (orderId: string) => {
    if (!confirm('Are you sure you want to cancel this order?')) return

    try {
      const response = await fetch(`/api/user/orders/${orderId}/cancel`, {
        method: 'PATCH'
      })
      
      if (response.ok) {
        fetchMyOrders()
      }
    } catch (error) {
      console.error('Failed to cancel order:', error)
    }
  }

  const handleReorder = async (order: Order) => {
    try {
      // Add all items from this order to cart
      for (const item of order.orderItems) {
        await fetch('/api/cart', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            productId: item.product.sku, // Assuming we can use SKU to find product
            quantity: item.quantity
          })
        })
      }
      
      router.push('/cart')
    } catch (error) {
      console.error('Failed to reorder:', error)
    }
  }

  if (status === 'loading' || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  if (!session || !hasPermission(userRole, 'canViewOwnOrders')) {
    return null
  }

  return (
    <div className="flex-1 space-y-6 p-8 pt-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">My Orders</h2>
          <p className="text-muted-foreground">
            Track your order history and current shipments
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
            {filteredOrders.length} orders
          </Badge>
          <Button onClick={() => router.push('/products')}>
            <ShoppingCart className="mr-2 h-4 w-4" />
            Continue Shopping
          </Button>
        </div>
      </div>

      {/* Order Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{orders.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Orders</CardTitle>
            <Clock className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {orders.filter(order => order.status === 'PENDING').length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Delivered Orders</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {orders.filter(order => order.status === 'DELIVERED').length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Spent</CardTitle>
            <DollarSign className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              ${orders.reduce((sum, order) => sum + order.total, 0).toLocaleString()}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="search">Search Orders</Label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder="Order number, product name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="status">Status</Label>
              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger id="status">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="PENDING">Pending</SelectItem>
                  <SelectItem value="CONFIRMED">Confirmed</SelectItem>
                  <SelectItem value="PROCESSING">Processing</SelectItem>
                  <SelectItem value="SHIPPED">Shipped</SelectItem>
                  <SelectItem value="DELIVERED">Delivered</SelectItem>
                  <SelectItem value="CANCELLED">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-end">
              <Button variant="outline" onClick={() => {
                setSearchTerm('')
                setSelectedStatus('all')
              }}>
                <Filter className="mr-2 h-4 w-4" />
                Clear Filters
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Orders List */}
      <div className="space-y-4">
        {filteredOrders.map((order) => {
          const StatusIcon = getStatusIcon(order.status)
          return (
            <Card key={order.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg">Order #{order.orderNumber}</CardTitle>
                    <CardDescription className="flex items-center space-x-4 mt-1">
                      <div className="flex items-center space-x-1">
                        <Calendar className="h-4 w-4" />
                        <span>{new Date(order.createdAt).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Package className="h-4 w-4" />
                        <span>{order.orderItems.length} items</span>
                      </div>
                    </CardDescription>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge className={getStatusColor(order.status)}>
                      <StatusIcon className="mr-1 h-3 w-3" />
                      {order.status}
                    </Badge>
                    <div className="text-right">
                      <div className="text-lg font-semibold">${order.total.toFixed(2)}</div>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="flex -space-x-2">
                      {order.orderItems.slice(0, 3).map((item, index) => (
                        <div
                          key={item.id}
                          className="w-10 h-10 bg-gray-100 rounded-full border-2 border-white flex items-center justify-center"
                        >
                          {item.product.images && item.product.images[0] ? (
                            <img
                              src={item.product.images[0]}
                              alt={item.product.name}
                              className="w-8 h-8 rounded-full object-cover"
                            />
                          ) : (
                            <Package className="h-4 w-4 text-gray-400" />
                          )}
                        </div>
                      ))}
                      {order.orderItems.length > 3 && (
                        <div className="w-10 h-10 bg-gray-200 rounded-full border-2 border-white flex items-center justify-center">
                          <span className="text-xs text-gray-600">+{order.orderItems.length - 3}</span>
                        </div>
                      )}
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">
                        {order.orderItems[0]?.product.name}
                        {order.orderItems.length > 1 && ` and ${order.orderItems.length - 1} more`}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    {canCancelOrder(order) && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleCancelOrder(order.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        Cancel
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleReorder(order)}
                    >
                      Reorder
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedOrder(order)
                        setShowOrderDialog(true)
                      }}
                    >
                      <Eye className="mr-2 h-4 w-4" />
                      View Details
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {filteredOrders.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <ShoppingCart className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No orders found</h3>
            <p className="text-muted-foreground mb-6">
              {searchTerm || selectedStatus !== 'all' 
                ? 'Try adjusting your search filters.' 
                : "You haven't placed any orders yet."
              }
            </p>
            <Button onClick={() => router.push('/products')}>
              <ShoppingCart className="mr-2 h-4 w-4" />
              Start Shopping
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Order Details Dialog */}
      <Dialog open={showOrderDialog} onOpenChange={setShowOrderDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Order Details</DialogTitle>
            <DialogDescription>
              Order #{selectedOrder?.orderNumber}
            </DialogDescription>
          </DialogHeader>
          
          {selectedOrder && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">Status</Label>
                  <Badge className={getStatusColor(selectedOrder.status)}>
                    {selectedOrder.status}
                  </Badge>
                </div>
                <div>
                  <Label className="text-sm font-medium">Order Date</Label>
                  <p className="text-sm">{new Date(selectedOrder.createdAt).toLocaleDateString()}</p>
                </div>
              </div>

              <div>
                <Label className="text-sm font-medium">Items Ordered</Label>
                <div className="space-y-2 mt-2">
                  {selectedOrder.orderItems.map((item) => (
                    <div key={item.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                          {item.product.images && item.product.images[0] ? (
                            <img
                              src={item.product.images[0]}
                              alt={item.product.name}
                              className="w-10 h-10 rounded-lg object-cover"
                            />
                          ) : (
                            <Package className="h-6 w-6 text-gray-400" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium">{item.product.name}</p>
                          <p className="text-sm text-muted-foreground">SKU: {item.product.sku}</p>
                          <p className="text-sm">Qty: {item.quantity}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">${(item.price * item.quantity).toFixed(2)}</p>
                        <p className="text-sm text-muted-foreground">${item.price.toFixed(2)} each</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="border-t pt-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Subtotal:</span>
                    <span>${selectedOrder.subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Tax:</span>
                    <span>${selectedOrder.tax.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Shipping:</span>
                    <span>${selectedOrder.shipping.toFixed(2)}</span>
                  </div>
                  {selectedOrder.discount > 0 && (
                    <div className="flex justify-between">
                      <span>Discount:</span>
                      <span>-${selectedOrder.discount.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between font-bold text-lg border-t pt-2">
                    <span>Total:</span>
                    <span>${selectedOrder.total.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-2">
                {canCancelOrder(selectedOrder) && (
                  <Button
                    variant="outline"
                    onClick={() => {
                      handleCancelOrder(selectedOrder.id)
                      setShowOrderDialog(false)
                    }}
                    className="text-red-600"
                  >
                    Cancel Order
                  </Button>
                )}
                <Button
                  onClick={() => {
                    handleReorder(selectedOrder)
                    setShowOrderDialog(false)
                  }}
                >
                  <ArrowRight className="mr-2 h-4 w-4" />
                  Reorder
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
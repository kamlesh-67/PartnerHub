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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { 
  Package2,
  Search, 
  Filter,
  Eye,
  Truck,
  CheckCircle,
  Clock,
  AlertTriangle,
  User,
  Building2,
  Calendar,
  RefreshCw,
  Printer,
  Download,
  ArrowUpDown
} from 'lucide-react'
import { type UserRole } from '@/lib/permissions'

interface Order {
  id: string
  orderNumber: string
  status: 'PENDING' | 'CONFIRMED' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED'
  subtotal: number
  tax: number
  shipping: number
  discount: number
  total: number
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'
  user: {
    id: string
    name: string
    email: string
  }
  company?: {
    id: string
    name: string
  }
  orderItems: {
    id: string
    quantity: number
    price: number
    product: {
      name: string
      sku: string
      stock: number
    }
  }[]
  shippingAddress?: {
    street: string
    city: string
    state: string
    zipCode: string
    country: string
  }
  createdAt: string
  updatedAt: string
}

export default function OperationsOrdersPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedStatus, setSelectedStatus] = useState<string>('PROCESSING')
  const [selectedPriority, setSelectedPriority] = useState<string>('all')
  const [sortBy, setSortBy] = useState<string>('created_desc')
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [showOrderDialog, setShowOrderDialog] = useState(false)

  const userRole = session?.user?.role as UserRole

  useEffect(() => {
    if (status === 'loading') return

    if (!session) {
      router.push('/auth/signin')
      return
    }

    if (userRole !== 'OPERATION') {
      router.push('/unauthorized')
      return
    }

    fetchOrders()
  }, [session, status, userRole, router])

  const fetchOrders = async () => {
    try {
      const response = await fetch('/api/operations/orders')
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

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/operations/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      })
      
      if (response.ok) {
        fetchOrders()
      }
    } catch (error) {
      console.error('Failed to update order status:', error)
    }
  }

  const updateOrderPriority = async (orderId: string, priority: string) => {
    try {
      const response = await fetch(`/api/operations/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ priority })
      })
      
      if (response.ok) {
        fetchOrders()
      }
    } catch (error) {
      console.error('Failed to update order priority:', error)
    }
  }

  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.company?.name?.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = selectedStatus === 'all' || order.status === selectedStatus
    const matchesPriority = selectedPriority === 'all' || order.priority === selectedPriority

    return matchesSearch && matchesStatus && matchesPriority
  }).sort((a, b) => {
    switch (sortBy) {
      case 'created_asc':
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      case 'created_desc':
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      case 'priority_desc':
        const priorityOrder = { 'URGENT': 4, 'HIGH': 3, 'MEDIUM': 2, 'LOW': 1 }
        return priorityOrder[b.priority] - priorityOrder[a.priority]
      case 'total_desc':
        return b.total - a.total
      case 'total_asc':
        return a.total - b.total
      default:
        return 0
    }
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

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'URGENT':
        return 'bg-red-100 text-red-800 border-red-300'
      case 'HIGH':
        return 'bg-orange-100 text-orange-800 border-orange-300'
      case 'MEDIUM':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300'
      case 'LOW':
        return 'bg-green-100 text-green-800 border-green-300'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PENDING':
      case 'CONFIRMED':
        return Clock
      case 'PROCESSING':
        return Package2
      case 'SHIPPED':
        return Truck
      case 'DELIVERED':
        return CheckCircle
      case 'CANCELLED':
        return AlertTriangle
      default:
        return Clock
    }
  }

  const printShippingLabel = async (orderId: string) => {
    try {
      const response = await fetch(`/api/operations/orders/${orderId}/shipping-label`)
      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `shipping-label-${orderId}.pdf`
        a.click()
      }
    } catch (error) {
      console.error('Failed to print shipping label:', error)
    }
  }

  if (status === 'loading' || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  if (!session || userRole !== 'OPERATION') {
    return null
  }

  return (
    <div className="flex-1 space-y-6 p-8 pt-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Order Processing</h2>
          <p className="text-muted-foreground">
            Process orders, update status, and manage fulfillment
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
            {filteredOrders.length} orders
          </Badge>
          <Button variant="outline" onClick={fetchOrders}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <Clock className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {orders.filter(o => o.status === 'PENDING').length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Processing</CardTitle>
            <Package2 className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {orders.filter(o => o.status === 'PROCESSING').length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ready to Ship</CardTitle>
            <Truck className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {orders.filter(o => o.status === 'CONFIRMED').length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Urgent Orders</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {orders.filter(o => o.priority === 'URGENT').length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed Today</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {orders.filter(o => 
                o.status === 'DELIVERED' && 
                new Date(o.updatedAt).toDateString() === new Date().toDateString()
              ).length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Filters & Sorting</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div>
              <Label htmlFor="search">Search Orders</Label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder="Order number, customer..."
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
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="PENDING">Pending</SelectItem>
                  <SelectItem value="CONFIRMED">Confirmed</SelectItem>
                  <SelectItem value="PROCESSING">Processing</SelectItem>
                  <SelectItem value="SHIPPED">Shipped</SelectItem>
                  <SelectItem value="DELIVERED">Delivered</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="priority">Priority</Label>
              <Select value={selectedPriority} onValueChange={setSelectedPriority}>
                <SelectTrigger id="priority">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Priority</SelectItem>
                  <SelectItem value="URGENT">Urgent</SelectItem>
                  <SelectItem value="HIGH">High</SelectItem>
                  <SelectItem value="MEDIUM">Medium</SelectItem>
                  <SelectItem value="LOW">Low</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="sortBy">Sort By</Label>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger id="sortBy">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="created_desc">Newest First</SelectItem>
                  <SelectItem value="created_asc">Oldest First</SelectItem>
                  <SelectItem value="priority_desc">Priority (High to Low)</SelectItem>
                  <SelectItem value="total_desc">Value (High to Low)</SelectItem>
                  <SelectItem value="total_asc">Value (Low to High)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-end">
              <Button variant="outline" onClick={() => {
                setSearchTerm('')
                setSelectedStatus('all')
                setSelectedPriority('all')
                setSortBy('created_desc')
              }}>
                <Filter className="mr-2 h-4 w-4" />
                Clear
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Orders Table */}
      <Card>
        <CardHeader>
          <CardTitle>Orders Queue</CardTitle>
          <CardDescription>
            Orders requiring processing and fulfillment
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Items</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredOrders.map((order) => {
                const StatusIcon = getStatusIcon(order.status)
                return (
                  <TableRow key={order.id} className={order.priority === 'URGENT' ? 'bg-red-50' : ''}>
                    <TableCell>
                      <div>
                        <div className="font-medium">#{order.orderNumber}</div>
                        <div className="text-sm text-muted-foreground">
                          {order.company?.name || 'Individual Order'}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <div className="font-medium">{order.user.name || 'No Name'}</div>
                          <div className="text-sm text-muted-foreground">{order.user.email}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Select
                        value={order.priority}
                        onValueChange={(value) => updateOrderPriority(order.id, value)}
                      >
                        <SelectTrigger className={`w-[90px] h-7 ${getPriorityColor(order.priority)}`}>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="LOW">Low</SelectItem>
                          <SelectItem value="MEDIUM">Medium</SelectItem>
                          <SelectItem value="HIGH">High</SelectItem>
                          <SelectItem value="URGENT">Urgent</SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell>
                      <Select
                        value={order.status}
                        onValueChange={(value) => updateOrderStatus(order.id, value)}
                      >
                        <SelectTrigger className={`w-[120px] h-7 ${getStatusColor(order.status)}`}>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="PENDING">Pending</SelectItem>
                          <SelectItem value="CONFIRMED">Confirmed</SelectItem>
                          <SelectItem value="PROCESSING">Processing</SelectItem>
                          <SelectItem value="SHIPPED">Shipped</SelectItem>
                          <SelectItem value="DELIVERED">Delivered</SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{order.orderItems.length} items</div>
                        <div className="text-sm text-muted-foreground">
                          {order.orderItems.reduce((sum, item) => sum + item.quantity, 0)} units
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">
                      ${order.total.toFixed(2)}
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div>{new Date(order.createdAt).toLocaleDateString()}</div>
                        <div className="text-muted-foreground">
                          {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-1">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => {
                            setSelectedOrder(order)
                            setShowOrderDialog(true)
                          }}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        {order.status === 'CONFIRMED' && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => printShippingLabel(order.id)}
                          >
                            <Printer className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>

          {filteredOrders.length === 0 && (
            <div className="text-center py-8">
              <Package2 className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No orders found</h3>
              <p className="mt-1 text-sm text-gray-500">
                Try adjusting your search filters.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Order Details Dialog */}
      <Dialog open={showOrderDialog} onOpenChange={setShowOrderDialog}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Order Processing Details</DialogTitle>
            <DialogDescription>
              Order #{selectedOrder?.orderNumber} - Operations View
            </DialogDescription>
          </DialogHeader>
          
          {selectedOrder && (
            <div className="space-y-6">
              {/* Order Info */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <Label className="text-sm font-medium">Status</Label>
                  <Badge className={getStatusColor(selectedOrder.status)}>
                    {selectedOrder.status}
                  </Badge>
                </div>
                <div>
                  <Label className="text-sm font-medium">Priority</Label>
                  <Badge className={getPriorityColor(selectedOrder.priority)}>
                    {selectedOrder.priority}
                  </Badge>
                </div>
                <div>
                  <Label className="text-sm font-medium">Order Date</Label>
                  <p className="text-sm">{new Date(selectedOrder.createdAt).toLocaleDateString()}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Order Value</Label>
                  <p className="text-sm font-bold">${selectedOrder.total.toFixed(2)}</p>
                </div>
              </div>

              {/* Customer & Shipping Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label className="text-sm font-medium">Customer Information</Label>
                  <div className="mt-2 p-3 border rounded-lg">
                    <p className="font-medium">{selectedOrder.user.name}</p>
                    <p className="text-sm text-muted-foreground">{selectedOrder.user.email}</p>
                    {selectedOrder.company && (
                      <p className="text-sm text-muted-foreground">{selectedOrder.company.name}</p>
                    )}
                  </div>
                </div>

                {selectedOrder.shippingAddress && (
                  <div>
                    <Label className="text-sm font-medium">Shipping Address</Label>
                    <div className="mt-2 p-3 border rounded-lg">
                      <p>{selectedOrder.shippingAddress.street}</p>
                      <p>{selectedOrder.shippingAddress.city}, {selectedOrder.shippingAddress.state} {selectedOrder.shippingAddress.zipCode}</p>
                      <p>{selectedOrder.shippingAddress.country}</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Items to Process */}
              <div>
                <Label className="text-sm font-medium">Items to Process</Label>
                <div className="mt-2 space-y-2">
                  {selectedOrder.orderItems.map((item) => (
                    <div key={item.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-medium">{item.product.name}</p>
                        <p className="text-sm text-muted-foreground">SKU: {item.product.sku}</p>
                        <p className="text-sm">
                          Stock Available: {item.product.stock} units
                          {item.product.stock < item.quantity && (
                            <span className="text-red-600 font-medium"> (Insufficient Stock)</span>
                          )}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">Qty: {item.quantity}</p>
                        <p className="text-sm text-muted-foreground">${item.price.toFixed(2)} each</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Processing Actions */}
              <div className="flex justify-end space-x-2">
                {selectedOrder.status === 'CONFIRMED' && (
                  <Button onClick={() => printShippingLabel(selectedOrder.id)}>
                    <Printer className="mr-2 h-4 w-4" />
                    Print Shipping Label
                  </Button>
                )}
                <Button
                  onClick={() => updateOrderStatus(selectedOrder.id, 'PROCESSING')}
                  disabled={selectedOrder.status === 'PROCESSING'}
                >
                  <Package2 className="mr-2 h-4 w-4" />
                  Start Processing
                </Button>
                {selectedOrder.status === 'PROCESSING' && (
                  <Button
                    onClick={() => updateOrderStatus(selectedOrder.id, 'SHIPPED')}
                  >
                    <Truck className="mr-2 h-4 w-4" />
                    Mark as Shipped
                  </Button>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
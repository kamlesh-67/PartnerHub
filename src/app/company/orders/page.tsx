'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  ShoppingCart, 
  Search, 
  Filter,
  Eye,
  Download,
  Package,
  Truck,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  DollarSign,
  Calendar,
  User,
  RefreshCcw,
  Plus,
  TrendingUp
} from 'lucide-react'

interface CompanyOrder {
  id: string
  orderNumber: string
  buyer: string
  buyerEmail: string
  date: string
  status: 'PENDING' | 'CONFIRMED' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED'
  total: number
  itemCount: number
  shippingAddress: string
  expectedDelivery?: string
  trackingNumber?: string
  paymentMethod: string
  notes?: string
}

interface OrderMetric {
  title: string
  value: string
  change: string
  trend: 'up' | 'down' | 'neutral'
  icon: React.ElementType
}

export default function CompanyOrdersPage() {
  const { data: session } = useSession()
  const [orders, setOrders] = useState<CompanyOrder[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('ALL')
  const [dateRange, setDateRange] = useState<string>('30_DAYS')

  const mockOrders: CompanyOrder[] = [
    {
      id: '1',
      orderNumber: 'ORD-2024-001',
      buyer: 'John Smith',
      buyerEmail: 'john.smith@company.com',
      date: '2024-01-10T14:30:00Z',
      status: 'DELIVERED',
      total: 2847.50,
      itemCount: 8,
      shippingAddress: '123 Business Plaza, Chicago, IL 60601',
      expectedDelivery: '2024-01-12T17:00:00Z',
      trackingNumber: '1Z999AA1234567890',
      paymentMethod: 'Corporate Account'
    },
    {
      id: '2',
      orderNumber: 'ORD-2024-002',
      buyer: 'Sarah Johnson',
      buyerEmail: 'sarah.johnson@company.com',
      date: '2024-01-09T11:15:00Z',
      status: 'SHIPPED',
      total: 1299.99,
      itemCount: 3,
      shippingAddress: '456 Corporate Center, New York, NY 10001',
      expectedDelivery: '2024-01-11T15:00:00Z',
      trackingNumber: 'FDX123456789',
      paymentMethod: 'Corporate Card'
    },
    {
      id: '3',
      orderNumber: 'ORD-2024-003',
      buyer: 'Michael Brown',
      buyerEmail: 'michael.brown@company.com',
      date: '2024-01-08T16:45:00Z',
      status: 'PROCESSING',
      total: 4567.80,
      itemCount: 12,
      shippingAddress: '789 Enterprise Way, Los Angeles, CA 90210',
      expectedDelivery: '2024-01-13T14:00:00Z',
      paymentMethod: 'Corporate Account',
      notes: 'Rush order - needed by end of week'
    },
    {
      id: '4',
      orderNumber: 'ORD-2024-004',
      buyer: 'Emily Davis',
      buyerEmail: 'emily.davis@company.com',
      date: '2024-01-07T09:30:00Z',
      status: 'CONFIRMED',
      total: 899.99,
      itemCount: 2,
      shippingAddress: '321 Business District, Miami, FL 33101',
      expectedDelivery: '2024-01-12T12:00:00Z',
      paymentMethod: 'Purchase Order'
    },
    {
      id: '5',
      orderNumber: 'ORD-2024-005',
      buyer: 'David Wilson',
      buyerEmail: 'david.wilson@company.com',
      date: '2024-01-06T13:20:00Z',
      status: 'PENDING',
      total: 3245.67,
      itemCount: 15,
      shippingAddress: '654 Commerce Plaza, Seattle, WA 98101',
      paymentMethod: 'Corporate Account',
      notes: 'Bulk order for new office setup'
    }
  ]

  const orderMetrics: OrderMetric[] = [
    {
      title: 'Total Orders',
      value: '127',
      change: '+12',
      trend: 'up',
      icon: ShoppingCart
    },
    {
      title: 'Order Value',
      value: '$45,892',
      change: '+8.5%',
      trend: 'up',
      icon: DollarSign
    },
    {
      title: 'Avg. Order Value',
      value: '$361',
      change: '+4.1%',
      trend: 'up',
      icon: TrendingUp
    },
    {
      title: 'Pending Orders',
      value: '8',
      change: '+2',
      trend: 'up',
      icon: Clock
    }
  ]

  useEffect(() => {
    setTimeout(() => {
      setOrders(mockOrders)
      setLoading(false)
    }, 1000)
  }, [])

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PENDING':
        return <Badge variant="secondary" className="bg-gray-100 text-gray-800">Pending</Badge>
      case 'CONFIRMED':
        return <Badge variant="secondary" className="bg-blue-100 text-blue-800">Confirmed</Badge>
      case 'PROCESSING':
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">Processing</Badge>
      case 'SHIPPED':
        return <Badge variant="secondary" className="bg-purple-100 text-purple-800">Shipped</Badge>
      case 'DELIVERED':
        return <Badge variant="secondary" className="bg-green-100 text-green-800">Delivered</Badge>
      case 'CANCELLED':
        return <Badge variant="destructive">Cancelled</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PENDING':
        return <Clock className="h-4 w-4 text-gray-500" />
      case 'CONFIRMED':
        return <CheckCircle className="h-4 w-4 text-blue-500" />
      case 'PROCESSING':
        return <Package className="h-4 w-4 text-yellow-500" />
      case 'SHIPPED':
        return <Truck className="h-4 w-4 text-purple-500" />
      case 'DELIVERED':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'CANCELLED':
        return <XCircle className="h-4 w-4 text-red-500" />
      default:
        return <AlertTriangle className="h-4 w-4" />
    }
  }

  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.buyer.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.buyerEmail.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'ALL' || order.status === statusFilter
    return matchesSearch && matchesStatus
  })

  if (loading) {
    return <div className="flex items-center justify-center h-96">Loading orders...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Company Orders</h1>
          <p className="text-muted-foreground">Track and manage all company orders and purchases</p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline">
            <RefreshCcw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            New Order
          </Button>
        </div>
      </div>

      {/* Metrics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {orderMetrics.map((metric, index) => {
          const Icon = metric.icon
          return (
            <Card key={index}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{metric.title}</CardTitle>
                <Icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{metric.value}</div>
                <p className={`text-xs ${metric.trend === 'up' ? 'text-green-600' : metric.trend === 'down' ? 'text-red-600' : 'text-gray-600'}`}>
                  {metric.change} from last period
                </p>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <Tabs defaultValue="orders" className="space-y-4">
        <TabsList>
          <TabsTrigger value="orders">All Orders</TabsTrigger>
          <TabsTrigger value="pending">Pending Approval</TabsTrigger>
          <TabsTrigger value="tracking">Shipment Tracking</TabsTrigger>
          <TabsTrigger value="history">Order History</TabsTrigger>
        </TabsList>

        <TabsContent value="orders" className="space-y-4">
          {/* Filters */}
          <Card>
            <CardHeader>
              <CardTitle>Filter Orders</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <Label htmlFor="search">Search Orders</Label>
                  <div className="relative">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="search"
                      placeholder="Search by order number, buyer, or email..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-8"
                    />
                  </div>
                </div>
                
                <div className="min-w-[150px]">
                  <Label>Status</Label>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="All Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ALL">All Status</SelectItem>
                      <SelectItem value="PENDING">Pending</SelectItem>
                      <SelectItem value="CONFIRMED">Confirmed</SelectItem>
                      <SelectItem value="PROCESSING">Processing</SelectItem>
                      <SelectItem value="SHIPPED">Shipped</SelectItem>
                      <SelectItem value="DELIVERED">Delivered</SelectItem>
                      <SelectItem value="CANCELLED">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="min-w-[150px]">
                  <Label>Date Range</Label>
                  <Select value={dateRange} onValueChange={setDateRange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select range" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="7_DAYS">Last 7 days</SelectItem>
                      <SelectItem value="30_DAYS">Last 30 days</SelectItem>
                      <SelectItem value="90_DAYS">Last 90 days</SelectItem>
                      <SelectItem value="1_YEAR">Last year</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Orders Table */}
          <Card>
            <CardHeader>
              <CardTitle>Orders ({filteredOrders.length})</CardTitle>
              <CardDescription>
                Company orders and purchase history
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Order</TableHead>
                      <TableHead>Buyer</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Items</TableHead>
                      <TableHead>Total</TableHead>
                      <TableHead>Payment</TableHead>
                      <TableHead>Delivery</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredOrders.map((order) => (
                      <TableRow key={order.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{order.orderNumber}</div>
                            {order.trackingNumber && (
                              <div className="text-xs text-muted-foreground">
                                Track: {order.trackingNumber}
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white text-xs font-medium">
                              {order.buyer.split(' ').map(n => n[0]).join('')}
                            </div>
                            <div>
                              <div className="font-medium">{order.buyer}</div>
                              <div className="text-sm text-muted-foreground">{order.buyerEmail}</div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">
                              {new Date(order.date).toLocaleDateString()}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {new Date(order.date).toLocaleTimeString()}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            {getStatusIcon(order.status)}
                            {getStatusBadge(order.status)}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-center">
                            <div className="font-medium">{order.itemCount}</div>
                            <div className="text-xs text-muted-foreground">items</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="font-bold">${order.total.toLocaleString()}</div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{order.paymentMethod}</Badge>
                        </TableCell>
                        <TableCell>
                          {order.expectedDelivery ? (
                            <div>
                              <div className="text-sm font-medium">
                                {new Date(order.expectedDelivery).toLocaleDateString()}
                              </div>
                              <div className="text-xs text-muted-foreground">
                                Expected
                              </div>
                            </div>
                          ) : (
                            <span className="text-gray-400">TBD</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex space-x-1">
                            <Button variant="outline" size="sm">
                              <Eye className="h-3 w-3" />
                            </Button>
                            <Button variant="outline" size="sm">
                              <Download className="h-3 w-3" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="pending" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Pending Approval</CardTitle>
              <CardDescription>
                Orders awaiting approval or review
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <Clock className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">Order Approvals</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Review and approve pending orders from team members.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tracking" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Shipment Tracking</CardTitle>
              <CardDescription>
                Track active shipments and delivery status
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <Truck className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">Shipment Tracking</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Real-time tracking for all active shipments.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Order History</CardTitle>
              <CardDescription>
                Complete order history and analytics
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <Calendar className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">Historical Data</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Complete order history with analytics and insights.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
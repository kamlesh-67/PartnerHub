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
  Truck, 
  Package, 
  MapPin,
  Clock,
  CheckCircle,
  AlertTriangle,
  XCircle,
  Route,
  Calendar,
  Search,
  RefreshCcw,
  Plus,
  Eye,
  Edit,
  Navigation,
  BarChart3,
  TrendingUp,
  Users,
  DollarSign
} from 'lucide-react'

interface Shipment {
  id: string
  trackingNumber: string
  orderId: string
  customer: string
  origin: string
  destination: string
  status: 'PENDING' | 'IN_TRANSIT' | 'OUT_FOR_DELIVERY' | 'DELIVERED' | 'DELAYED' | 'RETURNED'
  carrier: string
  service: string
  estimatedDelivery: string
  actualDelivery?: string
  weight: number
  cost: number
  createdAt: string
}

interface ShippingMetric {
  title: string
  value: string
  change: string
  trend: 'up' | 'down' | 'neutral'
  icon: React.ElementType
}

export default function OperationsShippingPage() {
  const { data: session } = useSession()
  const [shipments, setShipments] = useState<Shipment[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('ALL')
  const [carrierFilter, setCarrierFilter] = useState<string>('ALL')

  const mockShipments: Shipment[] = [
    {
      id: '1',
      trackingNumber: '1Z999AA1234567890',
      orderId: 'ORD-001',
      customer: 'Acme Corp',
      origin: 'Warehouse A - New York',
      destination: 'Chicago, IL',
      status: 'IN_TRANSIT',
      carrier: 'UPS',
      service: 'UPS Ground',
      estimatedDelivery: '2024-01-12T17:00:00Z',
      weight: 25.5,
      cost: 45.99,
      createdAt: '2024-01-10T08:30:00Z'
    },
    {
      id: '2',
      trackingNumber: 'FDX123456789',
      orderId: 'ORD-002',
      customer: 'Global Solutions Ltd',
      origin: 'Warehouse B - Los Angeles',
      destination: 'Phoenix, AZ',
      status: 'OUT_FOR_DELIVERY',
      carrier: 'FedEx',
      service: 'FedEx Express',
      estimatedDelivery: '2024-01-11T15:00:00Z',
      weight: 18.2,
      cost: 67.50,
      createdAt: '2024-01-09T14:15:00Z'
    },
    {
      id: '3',
      trackingNumber: 'DHX987654321',
      orderId: 'ORD-003',
      customer: 'Tech Innovations Inc',
      origin: 'Warehouse C - Miami',
      destination: 'Atlanta, GA',
      status: 'DELIVERED',
      carrier: 'DHL',
      service: 'DHL Express',
      estimatedDelivery: '2024-01-10T16:00:00Z',
      actualDelivery: '2024-01-10T14:30:00Z',
      weight: 32.1,
      cost: 89.25,
      createdAt: '2024-01-08T11:45:00Z'
    },
    {
      id: '4',
      trackingNumber: 'USPS123ABC789',
      orderId: 'ORD-004',
      customer: 'Design Studio Pro',
      origin: 'Warehouse A - New York',
      destination: 'Boston, MA',
      status: 'DELAYED',
      carrier: 'USPS',
      service: 'Priority Mail',
      estimatedDelivery: '2024-01-11T17:00:00Z',
      weight: 12.8,
      cost: 28.75,
      createdAt: '2024-01-09T16:20:00Z'
    },
    {
      id: '5',
      trackingNumber: 'LOCAL001234',
      orderId: 'ORD-005',
      customer: 'Local Business Hub',
      origin: 'Warehouse D - Dallas',
      destination: 'Houston, TX',
      status: 'PENDING',
      carrier: 'Local Courier',
      service: 'Same Day',
      estimatedDelivery: '2024-01-11T12:00:00Z',
      weight: 8.5,
      cost: 35.00,
      createdAt: '2024-01-10T09:15:00Z'
    }
  ]

  const shippingMetrics: ShippingMetric[] = [
    {
      title: 'Active Shipments',
      value: '347',
      change: '+23',
      trend: 'up',
      icon: Truck
    },
    {
      title: 'On-Time Delivery',
      value: '94.2%',
      change: '+2.1%',
      trend: 'up',
      icon: CheckCircle
    },
    {
      title: 'Avg. Transit Time',
      value: '2.4 days',
      change: '-0.3 days',
      trend: 'up',
      icon: Clock
    },
    {
      title: 'Shipping Costs',
      value: '$12,847',
      change: '+8.5%',
      trend: 'up',
      icon: DollarSign
    }
  ]

  useEffect(() => {
    setTimeout(() => {
      setShipments(mockShipments)
      setLoading(false)
    }, 1000)
  }, [])

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PENDING':
        return <Badge variant="secondary" className="bg-gray-100 text-gray-800">Pending</Badge>
      case 'IN_TRANSIT':
        return <Badge variant="secondary" className="bg-blue-100 text-blue-800">In Transit</Badge>
      case 'OUT_FOR_DELIVERY':
        return <Badge variant="secondary" className="bg-purple-100 text-purple-800">Out for Delivery</Badge>
      case 'DELIVERED':
        return <Badge variant="secondary" className="bg-green-100 text-green-800">Delivered</Badge>
      case 'DELAYED':
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">Delayed</Badge>
      case 'RETURNED':
        return <Badge variant="destructive">Returned</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PENDING':
        return <Clock className="h-4 w-4 text-gray-500" />
      case 'IN_TRANSIT':
        return <Truck className="h-4 w-4 text-blue-500" />
      case 'OUT_FOR_DELIVERY':
        return <Route className="h-4 w-4 text-purple-500" />
      case 'DELIVERED':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'DELAYED':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />
      case 'RETURNED':
        return <XCircle className="h-4 w-4 text-red-500" />
      default:
        return <Package className="h-4 w-4" />
    }
  }

  const filteredShipments = shipments.filter(shipment => {
    const matchesSearch = shipment.trackingNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         shipment.orderId.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         shipment.customer.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'ALL' || shipment.status === statusFilter
    const matchesCarrier = carrierFilter === 'ALL' || shipment.carrier === carrierFilter
    return matchesSearch && matchesStatus && matchesCarrier
  })

  if (loading) {
    return <div className="flex items-center justify-center h-96">Loading shipments...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Shipping Management</h1>
          <p className="text-muted-foreground">Track shipments, manage carriers, and optimize delivery operations</p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline">
            <RefreshCcw className="h-4 w-4 mr-2" />
            Sync Tracking
          </Button>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            New Shipment
          </Button>
        </div>
      </div>

      {/* Metrics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {shippingMetrics.map((metric, index) => {
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
                  {metric.change} from last week
                </p>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <Tabs defaultValue="shipments" className="space-y-4">
        <TabsList>
          <TabsTrigger value="shipments">Active Shipments</TabsTrigger>
          <TabsTrigger value="carriers">Carrier Management</TabsTrigger>
          <TabsTrigger value="routes">Route Optimization</TabsTrigger>
          <TabsTrigger value="analytics">Shipping Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="shipments" className="space-y-4">
          {/* Filters */}
          <Card>
            <CardHeader>
              <CardTitle>Filter Shipments</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <Label htmlFor="search">Search Shipments</Label>
                  <div className="relative">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="search"
                      placeholder="Search by tracking, order ID, or customer..."
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
                      <SelectItem value="IN_TRANSIT">In Transit</SelectItem>
                      <SelectItem value="OUT_FOR_DELIVERY">Out for Delivery</SelectItem>
                      <SelectItem value="DELIVERED">Delivered</SelectItem>
                      <SelectItem value="DELAYED">Delayed</SelectItem>
                      <SelectItem value="RETURNED">Returned</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="min-w-[150px]">
                  <Label>Carrier</Label>
                  <Select value={carrierFilter} onValueChange={setCarrierFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="All Carriers" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ALL">All Carriers</SelectItem>
                      <SelectItem value="UPS">UPS</SelectItem>
                      <SelectItem value="FedEx">FedEx</SelectItem>
                      <SelectItem value="DHL">DHL</SelectItem>
                      <SelectItem value="USPS">USPS</SelectItem>
                      <SelectItem value="Local Courier">Local Courier</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Shipments Table */}
          <Card>
            <CardHeader>
              <CardTitle>Shipments ({filteredShipments.length})</CardTitle>
              <CardDescription>
                Track and manage all shipments in real-time
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Tracking</TableHead>
                      <TableHead>Order</TableHead>
                      <TableHead>Customer</TableHead>
                      <TableHead>Route</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Carrier</TableHead>
                      <TableHead>Delivery</TableHead>
                      <TableHead>Cost</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredShipments.map((shipment) => (
                      <TableRow key={shipment.id}>
                        <TableCell className="font-mono text-sm">
                          {shipment.trackingNumber}
                        </TableCell>
                        <TableCell>
                          <div className="font-medium">{shipment.orderId}</div>
                        </TableCell>
                        <TableCell>{shipment.customer}</TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <div className="text-sm font-medium flex items-center">
                              <MapPin className="h-3 w-3 mr-1 text-green-500" />
                              {shipment.origin.split(' - ')[0]}
                            </div>
                            <div className="text-sm text-muted-foreground flex items-center">
                              <Navigation className="h-3 w-3 mr-1 text-red-500" />
                              {shipment.destination}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            {getStatusIcon(shipment.status)}
                            {getStatusBadge(shipment.status)}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">{shipment.carrier}</div>
                            <div className="text-sm text-muted-foreground">{shipment.service}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <div className="text-sm">
                              {shipment.actualDelivery ? 
                                new Date(shipment.actualDelivery).toLocaleDateString() :
                                new Date(shipment.estimatedDelivery).toLocaleDateString()
                              }
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {shipment.actualDelivery ? 'Delivered' : 'Estimated'}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">${shipment.cost}</div>
                            <div className="text-xs text-muted-foreground">{shipment.weight} lbs</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex space-x-1">
                            <Button variant="outline" size="sm">
                              <Eye className="h-3 w-3" />
                            </Button>
                            <Button variant="outline" size="sm">
                              <Edit className="h-3 w-3" />
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

        <TabsContent value="carriers" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Carrier Management</CardTitle>
              <CardDescription>
                Manage shipping carriers, rates, and service levels
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <Truck className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">Carrier Configuration</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Carrier management and rate configuration interface.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="routes" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Route Optimization</CardTitle>
              <CardDescription>
                Optimize shipping routes and delivery schedules
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <Route className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">Route Planning</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Advanced route optimization and scheduling tools.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Shipping Analytics</CardTitle>
              <CardDescription>
                Performance metrics and shipping insights
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <BarChart3 className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">Analytics Dashboard</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Comprehensive shipping analytics and performance metrics.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
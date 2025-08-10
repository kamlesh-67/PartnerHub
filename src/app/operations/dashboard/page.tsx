'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Package,
  ShoppingCart, 
  TrendingUp,
  AlertTriangle,
  Clock,
  CheckCircle,
  Truck,
  BarChart3,
  FileText,
  RefreshCw,
  Warehouse,
  ClipboardList
} from 'lucide-react'
import { hasPermission, type UserRole } from '@/lib/permissions'

interface OperationsDashboardStats {
  ordersToProcess: number
  lowStockProducts: number
  shippedToday: number
  completedOrders: number
  pendingShipments: number
  inventoryValue: number
  avgProcessingTime: number
  returnedItems: number
}

export default function OperationsDashboard() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [stats, setStats] = useState<OperationsDashboardStats | null>(null)
  const [loading, setLoading] = useState(true)

  const userRole = session?.user?.role as UserRole

  useEffect(() => {
    if (status === 'loading') return

    if (!session) {
      router.push('/auth/signin')
      return
    }

    if (userRole !== 'OPERATION' && userRole !== 'SUPER_ADMIN') {
      router.push('/unauthorized')
      return
    }

    fetchOperationsStats()
  }, [session, status, userRole, router])

  const fetchOperationsStats = async () => {
    try {
      const response = await fetch('/api/analytics?scope=operations')
      if (response.ok) {
        const data = await response.json()
        setStats(data.operationsStats)
      }
    } catch (error) {
      console.error('Failed to fetch operations stats:', error)
    } finally {
      setLoading(false)
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

  const operationsActions = [
    {
      title: 'Order Processing',
      description: 'Process pending orders',
      icon: ShoppingCart,
      href: '/operations/orders',
      color: 'bg-orange-500',
      urgent: stats?.ordersToProcess && stats.ordersToProcess > 0
    },
    {
      title: 'Inventory Management',
      description: 'Manage stock levels',
      icon: Package,
      href: '/operations/inventory',
      color: 'bg-blue-500',
      urgent: stats?.lowStockProducts && stats.lowStockProducts > 0
    },
    {
      title: 'Product Catalog',
      description: 'Update product info',
      icon: Warehouse,
      href: '/operations/products',
      color: 'bg-green-500'
    },
    {
      title: 'Shipping & Fulfillment',
      description: 'Manage shipments',
      icon: Truck,
      href: '/operations/shipping',
      color: 'bg-purple-500'
    },
    {
      title: 'Operations Reports',
      description: 'Generate reports',
      icon: BarChart3,
      href: '/operations/reports',
      color: 'bg-indigo-500'
    },
    {
      title: 'Data Export',
      description: 'Export operational data',
      icon: FileText,
      href: '/operations/export',
      color: 'bg-teal-500'
    },
    {
      title: 'Quality Control',
      description: 'Product quality checks',
      icon: CheckCircle,
      href: '/operations/quality',
      color: 'bg-emerald-500'
    },
    {
      title: 'Task Management',
      description: 'Daily operations tasks',
      icon: ClipboardList,
      href: '/operations/tasks',
      color: 'bg-yellow-500'
    }
  ]

  return (
    <div className="flex-1 space-y-6 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Operations Dashboard</h2>
          <p className="text-muted-foreground">
            Welcome, {session.user?.name}! Manage daily operations and fulfillment.
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
            {userRole}
          </Badge>
          <Button onClick={() => window.location.reload()}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh Data
          </Button>
        </div>
      </div>

      {/* Operations Stats Overview */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Orders to Process</CardTitle>
            <ShoppingCart className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{stats?.ordersToProcess || 0}</div>
            <p className="text-xs text-muted-foreground">
              Pending processing
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Low Stock Items</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats?.lowStockProducts || 0}</div>
            <p className="text-xs text-muted-foreground">
              Need restocking
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Shipped Today</CardTitle>
            <Truck className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats?.shippedToday || 0}</div>
            <p className="text-xs text-muted-foreground">
              Orders fulfilled
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Processing Time</CardTitle>
            <Clock className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats?.avgProcessingTime || 0}h</div>
            <p className="text-xs text-muted-foreground">
              Average time
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Performance Metrics */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed Orders</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.completedOrders || 0}</div>
            <p className="text-xs text-muted-foreground">This week</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Shipments</CardTitle>
            <Truck className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{stats?.pendingShipments || 0}</div>
            <p className="text-xs text-muted-foreground">Ready to ship</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Inventory Value</CardTitle>
            <TrendingUp className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${(stats?.inventoryValue || 0).toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Current stock</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Returns</CardTitle>
            <RefreshCw className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats?.returnedItems || 0}</div>
            <p className="text-xs text-muted-foreground">This month</p>
          </CardContent>
        </Card>
      </div>

      {/* Operations Tools */}
      <Card>
        <CardHeader>
          <CardTitle>Operations Tools</CardTitle>
          <CardDescription>
            Quick access to daily operational functions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {operationsActions.map((action) => {
              const Icon = action.icon
              return (
                <Button
                  key={action.href}
                  variant="outline"
                  className={`h-auto p-4 flex flex-col items-center space-y-2 hover:bg-gray-50 relative ${
                    action.urgent ? 'border-orange-300 bg-orange-50' : ''
                  }`}
                  onClick={() => router.push(action.href)}
                >
                  {action.urgent && (
                    <Badge 
                      variant="destructive" 
                      className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 flex items-center justify-center"
                    >
                      !
                    </Badge>
                  )}
                  <div className={`p-2 rounded-lg ${action.color} text-white`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="text-center">
                    <div className="font-medium text-sm">{action.title}</div>
                    <div className="text-xs text-muted-foreground">{action.description}</div>
                  </div>
                </Button>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Today's Priority Tasks */}
      <Card>
        <CardHeader>
          <CardTitle>Today&apos;s Priority Tasks</CardTitle>
          <CardDescription>
            High-priority operations requiring attention
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {stats?.ordersToProcess && stats.ordersToProcess > 0 && (
              <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg border-l-4 border-orange-400">
                <div className="flex items-center space-x-3">
                  <ShoppingCart className="h-5 w-5 text-orange-500" />
                  <div>
                    <p className="font-medium text-sm">Process Pending Orders</p>
                    <p className="text-xs text-muted-foreground">{stats.ordersToProcess} orders waiting</p>
                  </div>
                </div>
                <Button size="sm" onClick={() => router.push('/operations/orders')}>
                  Process Now
                </Button>
              </div>
            )}

            {stats?.lowStockProducts && stats.lowStockProducts > 0 && (
              <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg border-l-4 border-red-400">
                <div className="flex items-center space-x-3">
                  <AlertTriangle className="h-5 w-5 text-red-500" />
                  <div>
                    <p className="font-medium text-sm">Restock Low Inventory</p>
                    <p className="text-xs text-muted-foreground">{stats.lowStockProducts} products need restocking</p>
                  </div>
                </div>
                <Button size="sm" onClick={() => router.push('/operations/inventory')}>
                  View Items
                </Button>
              </div>
            )}

            {stats?.pendingShipments && stats.pendingShipments > 0 && (
              <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border-l-4 border-blue-400">
                <div className="flex items-center space-x-3">
                  <Truck className="h-5 w-5 text-blue-500" />
                  <div>
                    <p className="font-medium text-sm">Schedule Shipments</p>
                    <p className="text-xs text-muted-foreground">{stats.pendingShipments} orders ready to ship</p>
                  </div>
                </div>
                <Button size="sm" onClick={() => router.push('/operations/shipping')}>
                  Schedule
                </Button>
              </div>
            )}

            {(!stats?.ordersToProcess || stats.ordersToProcess === 0) &&
             (!stats?.lowStockProducts || stats.lowStockProducts === 0) &&
             (!stats?.pendingShipments || stats.pendingShipments === 0) && (
              <div className="flex items-center justify-center p-6 bg-green-50 rounded-lg">
                <div className="text-center">
                  <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-2" />
                  <p className="font-medium text-green-800">All caught up!</p>
                  <p className="text-sm text-green-600">No urgent tasks at the moment</p>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
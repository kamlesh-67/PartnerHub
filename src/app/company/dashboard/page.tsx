'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Users, 
  Package, 
  ShoppingCart, 
  TrendingUp, 
  Settings,
  FileText,
  Bell,
  BarChart3,
  AlertTriangle,
  DollarSign,
  Clock
} from 'lucide-react'
import { hasPermission, canAccessPage, type UserRole } from '@/lib/permissions'

interface CompanyDashboardStats {
  companyUsers: number
  companyProducts: number
  companyOrders: number
  companyRevenue: number
  pendingOrders: number
  recentOrders: number
  activeProducts: number
  notifications: number
}

export default function CompanyDashboard() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [stats, setStats] = useState<CompanyDashboardStats | null>(null)
  const [loading, setLoading] = useState(true)

  const userRole = session?.user?.role as UserRole

  useEffect(() => {
    if (status === 'loading') return

    if (!session) {
      router.push('/auth/signin')
      return
    }

    if (userRole !== 'ACCOUNT_ADMIN') {
      router.push('/unauthorized')
      return
    }

    fetchCompanyStats()
  }, [session, status, userRole, router])

  const fetchCompanyStats = async () => {
    try {
      const response = await fetch('/api/analytics?scope=company')
      if (response.ok) {
        const data = await response.json()
        setStats(data.companyStats)
      }
    } catch (error) {
      console.error('Failed to fetch company stats:', error)
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

  if (!session || userRole !== 'ACCOUNT_ADMIN') {
    return null
  }

  const companyActions = [
    {
      title: 'Team Management',
      description: 'Manage company users',
      icon: Users,
      href: '/company/users',
      permission: 'canAccessUserManagement',
      color: 'bg-blue-500'
    },
    {
      title: 'Product Catalog',
      description: 'Manage company products',
      icon: Package,
      href: '/company/products',
      permission: 'canAccessProductManagement',
      color: 'bg-purple-500'
    },
    {
      title: 'Order Management',
      description: 'Process company orders',
      icon: ShoppingCart,
      href: '/company/orders',
      permission: 'canAccessOrderManagement',
      color: 'bg-orange-500'
    },
    {
      title: 'Analytics',
      description: 'Company performance',
      icon: BarChart3,
      href: '/company/analytics',
      permission: 'canAccessAnalytics',
      color: 'bg-indigo-500'
    },
    {
      title: 'Inventory',
      description: 'Stock management',
      icon: Package,
      href: '/company/inventory',
      permission: 'canAccessInventoryManagement',
      color: 'bg-green-500'
    },
    {
      title: 'Reports',
      description: 'Company reports',
      icon: FileText,
      href: '/company/reports',
      permission: 'canAccessReports',
      color: 'bg-teal-500'
    },
    {
      title: 'Company Settings',
      description: 'Update company info',
      icon: Settings,
      href: '/company/settings',
      permission: 'canEditCompanies',
      color: 'bg-gray-500'
    },
    {
      title: 'Bulk Orders',
      description: 'Manage bulk purchases',
      icon: ShoppingCart,
      href: '/company/bulk-orders',
      permission: 'canApproveBulkOrders',
      color: 'bg-yellow-500'
    }
  ]

  const availableActions = companyActions.filter(action => 
    hasPermission(userRole, action.permission as keyof import('@/lib/permissions').RolePermissions)
  )

  return (
    <div className="flex-1 space-y-6 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Company Dashboard</h2>
          <p className="text-muted-foreground">
            Welcome back, {session.user?.name}! Manage your company&apos;s B2B operations.
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
            {userRole}
          </Badge>
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
            {typeof session.user?.company === 'string' ? session.user.company : session.user?.company?.name || 'Company Admin'}
          </Badge>
          <Button onClick={() => router.push('/company/settings')}>
            <Settings className="mr-2 h-4 w-4" />
            Company Settings
          </Button>
        </div>
      </div>

      {/* Company Stats Overview */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Team Members</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.companyUsers || 0}</div>
            <p className="text-xs text-muted-foreground">
              Active employees
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Products</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.companyProducts || 0}</div>
            <p className="text-xs text-muted-foreground">
              In your catalog
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Orders This Month</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.companyOrders || 0}</div>
            <p className="text-xs text-muted-foreground">
              Company orders
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Company Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${(stats?.companyRevenue || 0).toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              This month
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Company Alerts */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Orders</CardTitle>
            <Clock className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{stats?.pendingOrders || 0}</div>
            <p className="text-xs text-muted-foreground">Need approval</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Recent Orders</CardTitle>
            <ShoppingCart className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats?.recentOrders || 0}</div>
            <p className="text-xs text-muted-foreground">Last 7 days</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Products</CardTitle>
            <Package className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats?.activeProducts || 0}</div>
            <p className="text-xs text-muted-foreground">In stock</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Notifications</CardTitle>
            <Bell className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">{stats?.notifications || 0}</div>
            <p className="text-xs text-muted-foreground">Unread</p>
          </CardContent>
        </Card>
      </div>

      {/* Company Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Company Management</CardTitle>
          <CardDescription>
            Quick access to company administration tools
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {availableActions.map((action) => {
              const Icon = action.icon
              return (
                <Button
                  key={action.href}
                  variant="outline"
                  className="h-auto p-4 flex flex-col items-center space-y-2 hover:bg-gray-50"
                  onClick={() => router.push(action.href)}
                >
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

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>
            Latest company activities and updates
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center space-x-4">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <div className="flex-1">
                <p className="text-sm font-medium">New team member added</p>
                <p className="text-xs text-muted-foreground">2 hours ago</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <div className="flex-1">
                <p className="text-sm font-medium">Product catalog updated</p>
                <p className="text-xs text-muted-foreground">4 hours ago</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
              <div className="flex-1">
                <p className="text-sm font-medium">Bulk order processed</p>
                <p className="text-xs text-muted-foreground">1 day ago</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
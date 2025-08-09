'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Users, 
  Building2, 
  Package, 
  ShoppingCart, 
  TrendingUp, 
  Shield, 
  Settings,
  FileText,
  Bell,
  BarChart3,
  AlertTriangle
} from 'lucide-react'
import { hasPermission, canAccessPage, type UserRole } from '@/lib/permissions'

interface DashboardStats {
  totalUsers: number
  totalCompanies: number
  totalProducts: number
  totalOrders: number
  totalRevenue: number
  pendingOrders: number
  lowStockProducts: number
  systemAlerts: number
}

export default function AdminDashboard() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)

  const userRole = session?.user?.role as UserRole

  useEffect(() => {
    if (status === 'loading') return

    if (!session) {
      router.push('/auth/signin')
      return
    }

    if (!canAccessPage(userRole, '/admin/dashboard')) {
      router.push('/unauthorized')
      return
    }

    fetchDashboardStats()
  }, [session, status, userRole, router])

  const fetchDashboardStats = async () => {
    try {
      const response = await fetch('/api/analytics')
      if (response.ok) {
        const data = await response.json()
        setStats(data.stats)
      }
    } catch (error) {
      console.error('Failed to fetch dashboard stats:', error)
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

  if (!session || !canAccessPage(userRole, '/admin/dashboard')) {
    return null
  }

  const quickActions = [
    {
      title: 'User Management',
      description: 'Manage users and roles',
      icon: Users,
      href: '/admin/users',
      permission: 'canAccessUserManagement',
      color: 'bg-blue-500'
    },
    {
      title: 'Company Management',
      description: 'Manage B2B companies',
      icon: Building2,
      href: '/admin/companies',
      permission: 'canAccessCompanyManagement',
      color: 'bg-green-500'
    },
    {
      title: 'Product Management',
      description: 'Manage product catalog',
      icon: Package,
      href: '/admin/products',
      permission: 'canAccessProductManagement',
      color: 'bg-purple-500'
    },
    {
      title: 'Order Management',
      description: 'Process and manage orders',
      icon: ShoppingCart,
      href: '/admin/orders',
      permission: 'canAccessOrderManagement',
      color: 'bg-orange-500'
    },
    {
      title: 'Analytics',
      description: 'View business analytics',
      icon: BarChart3,
      href: '/admin/analytics',
      permission: 'canAccessAnalytics',
      color: 'bg-indigo-500'
    },
    {
      title: 'Audit Logs',
      description: 'Security and activity logs',
      icon: Shield,
      href: '/admin/audit',
      permission: 'canAccessAuditLogs',
      color: 'bg-red-500'
    },
    {
      title: 'System Settings',
      description: 'Configure system settings',
      icon: Settings,
      href: '/admin/settings',
      permission: 'canAccessSystemSettings',
      color: 'bg-gray-500'
    },
    {
      title: 'Reports',
      description: 'Generate and export reports',
      icon: FileText,
      href: '/admin/reports',
      permission: 'canAccessReports',
      color: 'bg-teal-500'
    }
  ]

  const availableActions = quickActions.filter(action => 
    hasPermission(userRole, action.permission as keyof import('@/lib/permissions').RolePermissions)
  )

  return (
    <div className="flex-1 space-y-6 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Super Admin Dashboard</h2>
          <p className="text-muted-foreground">
            Welcome back, {session.user?.name}! Here's what's happening with your B2B platform.
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
            {userRole}
          </Badge>
          <Button onClick={() => router.push('/admin/settings')}>
            <Settings className="mr-2 h-4 w-4" />
            Settings
          </Button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalUsers || 0}</div>
            <p className="text-xs text-muted-foreground">
              Across all companies
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Companies</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalCompanies || 0}</div>
            <p className="text-xs text-muted-foreground">
              Active B2B accounts
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Products</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalProducts || 0}</div>
            <p className="text-xs text-muted-foreground">
              In catalog
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${(stats?.totalRevenue || 0).toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              All time
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Alerts */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Orders</CardTitle>
            <ShoppingCart className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{stats?.pendingOrders || 0}</div>
            <p className="text-xs text-muted-foreground">Require attention</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Low Stock</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats?.lowStockProducts || 0}</div>
            <p className="text-xs text-muted-foreground">Products need restocking</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">System Alerts</CardTitle>
            <Bell className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{stats?.systemAlerts || 0}</div>
            <p className="text-xs text-muted-foreground">Unread notifications</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>
            Access frequently used admin functions
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
    </div>
  )
}
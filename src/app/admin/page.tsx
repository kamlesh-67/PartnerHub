'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Shield,
  Users, 
  Building2, 
  BarChart3,
  Package,
  ShoppingCart,
  DollarSign,
  TrendingUp,
  Activity,
  AlertCircle,
  CheckCircle,
  Clock,
  ArrowRight,
  Plus,
  Settings,
  Database,
  UserCheck,
  Bell
} from 'lucide-react'

interface DashboardStats {
  totalUsers: number
  activeUsers: number
  totalCompanies: number
  activeCompanies: number
  totalOrders: number
  pendingOrders: number
  totalRevenue: number
  monthlyRevenue: number
  totalProducts: number
  lowStockProducts: number
  systemHealth: 'excellent' | 'good' | 'warning' | 'critical'
  recentActivity: Array<{
    id: string
    type: 'user_signup' | 'order_placed' | 'company_added' | 'product_added'
    description: string
    timestamp: string
    user?: string
  }>
  pendingApprovals: Array<{
    id: string
    type: 'user_registration' | 'company_verification' | 'order_review'
    description: string
    priority: 'high' | 'medium' | 'low'
  }>
}

export default function SuperAdminDashboard() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)

  // Mock dashboard data (in a real app, this would come from APIs)
  const mockStats: DashboardStats = {
    totalUsers: 250,
    activeUsers: 238,
    totalCompanies: 45,
    activeCompanies: 43,
    totalOrders: 1250,
    pendingOrders: 23,
    totalRevenue: 325000,
    monthlyRevenue: 45000,
    totalProducts: 120,
    lowStockProducts: 8,
    systemHealth: 'good',
    recentActivity: [
      {
        id: '1',
        type: 'user_signup',
        description: 'New user registered from Chanel',
        timestamp: '2024-01-20T14:30:00Z',
        user: 'marie@chanel.com'
      },
      {
        id: '2',
        type: 'order_placed',
        description: 'Large order placed by Adidas',
        timestamp: '2024-01-20T13:45:00Z',
        user: 'procurement@adidas.com'
      },
      {
        id: '3',
        type: 'company_added',
        description: 'New company registered: Nike Inc',
        timestamp: '2024-01-20T12:15:00Z'
      },
      {
        id: '4',
        type: 'product_added',
        description: '5 new products added to catalog',
        timestamp: '2024-01-20T10:30:00Z'
      }
    ],
    pendingApprovals: [
      {
        id: '1',
        type: 'user_registration',
        description: '3 users awaiting account approval',
        priority: 'high'
      },
      {
        id: '2',
        type: 'company_verification',
        description: '2 companies pending verification',
        priority: 'medium'
      },
      {
        id: '3',
        type: 'order_review',
        description: '5 orders require manual review',
        priority: 'low'
      }
    ]
  }

  // Handle authentication
  useEffect(() => {
    if (status === 'loading') return
    
    if (!session) {
      router.push('/auth/signin')
      return
    }

    // Only Super Admins can access this dashboard
    if (session.user.role !== 'SUPER_ADMIN') {
      router.push('/')
      return
    }
  }, [session, status, router])

  useEffect(() => {
    // Fetch dashboard statistics
    const fetchStats = async () => {
      setLoading(true)
      try {
        // In a real app, this would be multiple API calls
        await new Promise(resolve => setTimeout(resolve, 1000))
        setStats(mockStats)
      } catch (error) {
        console.error('Error fetching dashboard stats:', error)
        setStats(mockStats) // Fallback to mock data
      } finally {
        setLoading(false)
      }
    }

    if (session?.user.role === 'SUPER_ADMIN') {
      fetchStats()
    }
  }, [session])

  // Show loading state
  if (status === 'loading' || loading) {
    return (
      <div className="container mx-auto py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {[...Array(8)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="pb-2">
                <div className="h-4 bg-muted rounded w-1/2"></div>
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-muted rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-muted rounded w-1/3"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  if (!session || !stats) {
    return null
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getHealthColor = (health: string) => {
    switch (health) {
      case 'excellent': return 'text-green-600'
      case 'good': return 'text-blue-600'
      case 'warning': return 'text-yellow-600'
      case 'critical': return 'text-red-600'
      default: return 'text-gray-600'
    }
  }

  const getHealthIcon = (health: string) => {
    switch (health) {
      case 'excellent': return CheckCircle
      case 'good': return CheckCircle
      case 'warning': return AlertCircle
      case 'critical': return AlertCircle
      default: return Activity
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-500'
      case 'medium': return 'bg-yellow-500'
      case 'low': return 'bg-green-500'
      default: return 'bg-gray-500'
    }
  }

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'user_signup': return UserCheck
      case 'order_placed': return ShoppingCart
      case 'company_added': return Building2
      case 'product_added': return Package
      default: return Activity
    }
  }

  const HealthIcon = getHealthIcon(stats.systemHealth)

  return (
    <div className="container mx-auto py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center space-x-4">
          <Shield className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold">Super Admin Dashboard</h1>
            <p className="text-muted-foreground">
              Complete system overview and management center
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <div className={`flex items-center space-x-2 ${getHealthColor(stats.systemHealth)}`}>
            <HealthIcon className="h-5 w-5" />
            <span className="text-sm font-medium capitalize">System {stats.systemHealth}</span>
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalUsers}</div>
            <div className="flex items-center text-xs text-muted-foreground">
              <span className="text-green-600">{stats.activeUsers} active</span>
              <span className="mx-2">•</span>
              <span className="text-red-600">{stats.totalUsers - stats.activeUsers} inactive</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Companies</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalCompanies}</div>
            <div className="flex items-center text-xs text-muted-foreground">
              <span className="text-green-600">{stats.activeCompanies} active</span>
              <span className="mx-2">•</span>
              <span className="text-red-600">{stats.totalCompanies - stats.activeCompanies} inactive</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalOrders}</div>
            <div className="flex items-center text-xs text-muted-foreground">
              <Clock className="h-3 w-3 mr-1 text-yellow-600" />
              {stats.pendingOrders} pending
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(stats.totalRevenue)}</div>
            <div className="flex items-center text-xs text-muted-foreground">
              <TrendingUp className="h-3 w-3 mr-1 text-green-500" />
              {formatCurrency(stats.monthlyRevenue)} this month
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card className="hover:shadow-lg transition-shadow cursor-pointer">
          <Link href="/admin/users">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <Users className="h-8 w-8 text-blue-600" />
                <ArrowRight className="h-4 w-4 text-muted-foreground" />
              </div>
            </CardHeader>
            <CardContent>
              <CardTitle className="text-lg mb-2">Manage Users</CardTitle>
              <CardDescription>
                View, edit, and manage all users across all companies
              </CardDescription>
            </CardContent>
          </Link>
        </Card>

        <Card className="hover:shadow-lg transition-shadow cursor-pointer">
          <Link href="/admin/products">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <Package className="h-8 w-8 text-green-600" />
                <ArrowRight className="h-4 w-4 text-muted-foreground" />
              </div>
            </CardHeader>
            <CardContent>
              <CardTitle className="text-lg mb-2">Manage Products</CardTitle>
              <CardDescription>
                Add, edit, and manage your product catalog
              </CardDescription>
            </CardContent>
          </Link>
        </Card>

        <Card className="hover:shadow-lg transition-shadow cursor-pointer">
          <Link href="/admin/companies">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <Building2 className="h-8 w-8 text-orange-600" />
                <ArrowRight className="h-4 w-4 text-muted-foreground" />
              </div>
            </CardHeader>
            <CardContent>
              <CardTitle className="text-lg mb-2">Manage Companies</CardTitle>
              <CardDescription>
                Oversee company registrations and business relationships
              </CardDescription>
            </CardContent>
          </Link>
        </Card>

        <Card className="hover:shadow-lg transition-shadow cursor-pointer">
          <Link href="/admin/analytics">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <BarChart3 className="h-8 w-8 text-purple-600" />
                <ArrowRight className="h-4 w-4 text-muted-foreground" />
              </div>
            </CardHeader>
            <CardContent>
              <CardTitle className="text-lg mb-2">Analytics</CardTitle>
              <CardDescription>
                View detailed reports and business insights
              </CardDescription>
            </CardContent>
          </Link>
        </Card>

        <Card className="hover:shadow-lg transition-shadow cursor-pointer">
          <Link href="/admin/settings">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <Settings className="h-8 w-8 text-red-600" />
                <ArrowRight className="h-4 w-4 text-muted-foreground" />
              </div>
            </CardHeader>
            <CardContent>
              <CardTitle className="text-lg mb-2">System Settings</CardTitle>
              <CardDescription>
                Configure platform settings and preferences
              </CardDescription>
            </CardContent>
          </Link>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Activity className="h-5 w-5 mr-2" />
              Recent Activity
            </CardTitle>
            <CardDescription>Latest system activities and events</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats.recentActivity.map((activity) => {
                const ActivityIcon = getActivityIcon(activity.type)
                return (
                  <div key={activity.id} className="flex items-start space-x-3">
                    <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center">
                      <ActivityIcon className="h-4 w-4" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">{activity.description}</p>
                      <div className="flex items-center text-xs text-muted-foreground mt-1">
                        <span>{formatDate(activity.timestamp)}</span>
                        {activity.user && (
                          <>
                            <span className="mx-2">•</span>
                            <span>{activity.user}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>

        {/* Pending Approvals */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Bell className="h-5 w-5 mr-2" />
              Pending Approvals
            </CardTitle>
            <CardDescription>Items requiring your attention</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats.pendingApprovals.map((item) => (
                <div key={item.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                  <div className="flex items-center space-x-3">
                    <Badge className={getPriorityColor(item.priority)}>
                      {item.priority}
                    </Badge>
                    <div>
                      <p className="text-sm font-medium">{item.description}</p>
                      <p className="text-xs text-muted-foreground capitalize">
                        {item.type.replace('_', ' ')}
                      </p>
                    </div>
                  </div>
                  <Button size="sm" variant="outline">
                    Review
                  </Button>
                </div>
              ))}
              
              {stats.pendingApprovals.length === 0 && (
                <div className="text-center py-8">
                  <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">All caught up!</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* System Status */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Database className="h-5 w-5 mr-2" />
            System Overview
          </CardTitle>
          <CardDescription>Portal health and key metrics</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{stats.totalProducts}</div>
              <p className="text-sm text-muted-foreground">Total Products</p>
              {stats.lowStockProducts > 0 && (
                <p className="text-xs text-red-600 mt-1">
                  {stats.lowStockProducts} low stock
                </p>
              )}
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{stats.activeUsers}</div>
              <p className="text-sm text-muted-foreground">Active Users</p>
              <p className="text-xs text-muted-foreground mt-1">
                {Math.round((stats.activeUsers / stats.totalUsers) * 100)}% of total
              </p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{stats.activeCompanies}</div>
              <p className="text-sm text-muted-foreground">Active Companies</p>
              <p className="text-xs text-muted-foreground mt-1">
                {Math.round((stats.activeCompanies / stats.totalCompanies) * 100)}% of total
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
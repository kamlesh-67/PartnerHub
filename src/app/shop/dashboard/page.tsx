'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  ShoppingBag,
  ShoppingCart, 
  Heart,
  Clock,
  TrendingUp,
  Package,
  CreditCard,
  Star,
  Search,
  Filter
} from 'lucide-react'
import { hasPermission, type UserRole } from '@/lib/permissions'

interface BuyerDashboardStats {
  cartItems: number
  recentOrders: number
  favoriteProducts: number
  totalSpent: number
  pendingOrders: number
  deliveredOrders: number
  availableProducts: number
  newProducts: number
}

export default function BuyerDashboard() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [stats, setStats] = useState<BuyerDashboardStats | null>(null)
  const [loading, setLoading] = useState(true)

  const userRole = session?.user?.role as UserRole

  useEffect(() => {
    if (status === 'loading') return

    if (!session) {
      router.push('/auth/signin')
      return
    }

    if (userRole !== 'BUYER') {
      router.push('/unauthorized')
      return
    }

    fetchBuyerStats()
  }, [session, status, userRole, router])

  const fetchBuyerStats = async () => {
    try {
      const response = await fetch('/api/analytics?scope=buyer')
      if (response.ok) {
        const data = await response.json()
        setStats(data.buyerStats)
      }
    } catch (error) {
      console.error('Failed to fetch buyer stats:', error)
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

  if (!session || userRole !== 'BUYER') {
    return null
  }

  const buyerActions = [
    {
      title: 'Browse Products',
      description: 'Shop our catalog',
      icon: ShoppingBag,
      href: '/products',
      color: 'bg-blue-500'
    },
    {
      title: 'My Cart',
      description: 'Review items',
      icon: ShoppingCart,
      href: '/cart',
      color: 'bg-green-500',
      badge: stats?.cartItems
    },
    {
      title: 'My Orders',
      description: 'Order history',
      icon: Package,
      href: '/orders',
      color: 'bg-purple-500'
    },
    {
      title: 'Bulk Orders',
      description: 'Place bulk orders',
      icon: Package,
      href: '/bulk-orders',
      color: 'bg-orange-500'
    },
    {
      title: 'Wishlist',
      description: 'Favorite items',
      icon: Heart,
      href: '/wishlist',
      color: 'bg-red-500',
      badge: stats?.favoriteProducts
    },
    {
      title: 'Search Products',
      description: 'Find what you need',
      icon: Search,
      href: '/search',
      color: 'bg-indigo-500'
    },
    {
      title: 'Order Tracking',
      description: 'Track shipments',
      icon: Clock,
      href: '/orders/tracking',
      color: 'bg-teal-500'
    },
    {
      title: 'Account Settings',
      description: 'Update profile',
      icon: CreditCard,
      href: '/account',
      color: 'bg-gray-500'
    }
  ]

  return (
    <div className="flex-1 space-y-6 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Shopping Dashboard</h2>
          <p className="text-muted-foreground">
            Welcome back, {session.user?.name}! Ready to shop for your business?
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
            {userRole}
          </Badge>
          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
            {typeof session.user?.company === 'string' ? session.user.company : session.user?.company?.name || 'Individual Buyer'}
          </Badge>
          <Button onClick={() => router.push('/cart')}>
            <ShoppingCart className="mr-2 h-4 w-4" />
            Cart ({stats?.cartItems || 0})
          </Button>
        </div>
      </div>

      {/* Shopping Stats Overview */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cart Items</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.cartItems || 0}</div>
            <p className="text-xs text-muted-foreground">
              Ready to checkout
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Recent Orders</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.recentOrders || 0}</div>
            <p className="text-xs text-muted-foreground">
              Last 30 days
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Spent</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${(stats?.totalSpent || 0).toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              All time purchases
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Wishlist Items</CardTitle>
            <Heart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.favoriteProducts || 0}</div>
            <p className="text-xs text-muted-foreground">
              Saved for later
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Order Status Overview */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Orders</CardTitle>
            <Clock className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{stats?.pendingOrders || 0}</div>
            <p className="text-xs text-muted-foreground">Being processed</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Delivered Orders</CardTitle>
            <Package className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats?.deliveredOrders || 0}</div>
            <p className="text-xs text-muted-foreground">Completed successfully</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">New Products</CardTitle>
            <Star className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats?.newProducts || 0}</div>
            <p className="text-xs text-muted-foreground">Available this week</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Shopping Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>
            Fast access to your shopping tools
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {buyerActions.map((action) => {
              const Icon = action.icon
              return (
                <Button
                  key={action.href}
                  variant="outline"
                  className="h-auto p-4 flex flex-col items-center space-y-2 hover:bg-gray-50 relative"
                  onClick={() => router.push(action.href)}
                >
                  {action.badge && action.badge > 0 && (
                    <Badge 
                      variant="destructive" 
                      className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0 flex items-center justify-center text-xs"
                    >
                      {action.badge}
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

      {/* Featured Products */}
      <Card>
        <CardHeader>
          <CardTitle>Recommended for You</CardTitle>
          <CardDescription>
            Products based on your purchase history
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardContent className="p-4">
                <div className="aspect-square bg-gray-100 rounded-md mb-4"></div>
                <h3 className="font-semibold text-sm">Premium Office Chair</h3>
                <p className="text-xs text-muted-foreground mb-2">Ergonomic design for long work hours</p>
                <div className="flex items-center justify-between">
                  <span className="text-lg font-bold">$299.99</span>
                  <Button size="sm">Add to Cart</Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="aspect-square bg-gray-100 rounded-md mb-4"></div>
                <h3 className="font-semibold text-sm">Executive Desk</h3>
                <p className="text-xs text-muted-foreground mb-2">Spacious workspace solution</p>
                <div className="flex items-center justify-between">
                  <span className="text-lg font-bold">$599.99</span>
                  <Button size="sm">Add to Cart</Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="aspect-square bg-gray-100 rounded-md mb-4"></div>
                <h3 className="font-semibold text-sm">Storage Cabinet</h3>
                <p className="text-xs text-muted-foreground mb-2">Organize your office space</p>
                <div className="flex items-center justify-between">
                  <span className="text-lg font-bold">$199.99</span>
                  <Button size="sm">Add to Cart</Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
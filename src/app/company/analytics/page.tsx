'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown,
  DollarSign,
  Package,
  ShoppingCart,
  Users,
  Calendar,
  Download,
  RefreshCcw,
  Target,
  Activity,
  Clock,
  Award,
  ArrowUpRight,
  ArrowDownRight,
  Minus
} from 'lucide-react'

interface AnalyticsMetric {
  title: string
  value: string
  change: string
  trend: 'up' | 'down' | 'neutral'
  icon: React.ElementType
  description?: string
}

interface ChartData {
  period: string
  value: number
  label: string
}

export default function CompanyAnalyticsPage() {
  const { data: session } = useSession()
  const [loading, setLoading] = useState(true)
  const [timeRange, setTimeRange] = useState<string>('30_DAYS')

  // Mock analytics data
  const analyticsMetrics: AnalyticsMetric[] = [
    {
      title: 'Total Spending',
      value: '$45,892',
      change: '+12.5%',
      trend: 'up',
      icon: DollarSign,
      description: 'Total company procurement spending'
    },
    {
      title: 'Orders Placed',
      value: '127',
      change: '+8.2%',
      trend: 'up',
      icon: ShoppingCart,
      description: 'Orders placed this period'
    },
    {
      title: 'Active Users',
      value: '24',
      change: '+2',
      trend: 'up',
      icon: Users,
      description: 'Team members actively using platform'
    },
    {
      title: 'Avg. Order Value',
      value: '$361',
      change: '+4.1%',
      trend: 'up',
      icon: Target,
      description: 'Average value per order'
    },
    {
      title: 'Products Ordered',
      value: '1,847',
      change: '+15.3%',
      trend: 'up',
      icon: Package,
      description: 'Total products ordered'
    },
    {
      title: 'Cost Savings',
      value: '$8,245',
      change: '+22.1%',
      trend: 'up',
      icon: Award,
      description: 'Cost savings vs retail prices'
    }
  ]

  const spendingByCategory = [
    { category: 'Seating', amount: 18420, percentage: 40.1, trend: 'up' },
    { category: 'Desks', amount: 13767, percentage: 30.0, trend: 'up' },
    { category: 'Storage', amount: 6883, percentage: 15.0, trend: 'down' },
    { category: 'Accessories', amount: 4592, percentage: 10.0, trend: 'neutral' },
    { category: 'Lighting', amount: 2230, percentage: 4.9, trend: 'up' }
  ]

  const monthlySpending: ChartData[] = [
    { period: 'Jan', value: 38500, label: 'January 2024' },
    { period: 'Feb', value: 42300, label: 'February 2024' },
    { period: 'Mar', value: 45892, label: 'March 2024' },
    { period: 'Apr', value: 41250, label: 'April 2024' },
    { period: 'May', value: 48600, label: 'May 2024' },
    { period: 'Jun', value: 52100, label: 'June 2024' }
  ]

  const topProducts = [
    { name: 'Executive Office Chair', orders: 45, value: 13455, trend: 'up' },
    { name: 'Standing Desk Converter', orders: 32, value: 6398, trend: 'up' },
    { name: 'Conference Table - 8 Seater', orders: 12, value: 10788, trend: 'neutral' },
    { name: 'Storage Cabinet', orders: 28, value: 4199, trend: 'down' },
    { name: 'Visitor Chair', orders: 67, value: 5359, trend: 'up' }
  ]

  const userActivity = [
    { name: 'John Smith', orders: 23, spending: 8945, role: 'Account Admin' },
    { name: 'Sarah Johnson', orders: 18, spending: 6234, role: 'Buyer' },
    { name: 'Michael Brown', orders: 15, spending: 5678, role: 'Operations' },
    { name: 'Emily Davis', orders: 12, spending: 4123, role: 'Buyer' },
    { name: 'David Wilson', orders: 8, spending: 2890, role: 'Buyer' }
  ]

  useEffect(() => {
    setTimeout(() => {
      setLoading(false)
    }, 1000)
  }, [])

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up':
        return <ArrowUpRight className="h-4 w-4 text-green-500" />
      case 'down':
        return <ArrowDownRight className="h-4 w-4 text-red-500" />
      default:
        return <Minus className="h-4 w-4 text-gray-500" />
    }
  }

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'up':
        return 'text-green-600'
      case 'down':
        return 'text-red-600'
      default:
        return 'text-gray-600'
    }
  }

  if (loading) {
    return <div className="flex items-center justify-center h-96">Loading analytics...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Company Analytics</h1>
          <p className="text-muted-foreground">Track spending, usage patterns, and procurement insights</p>
        </div>
        <div className="flex space-x-2">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7_DAYS">Last 7 days</SelectItem>
              <SelectItem value="30_DAYS">Last 30 days</SelectItem>
              <SelectItem value="90_DAYS">Last 90 days</SelectItem>
              <SelectItem value="1_YEAR">Last year</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline">
            <RefreshCcw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {analyticsMetrics.map((metric, index) => {
          const Icon = metric.icon
          return (
            <Card key={index}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{metric.title}</CardTitle>
                <Icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{metric.value}</div>
                <div className="flex items-center space-x-2 text-xs">
                  {getTrendIcon(metric.trend)}
                  <span className={getTrendColor(metric.trend)}>
                    {metric.change} from last period
                  </span>
                </div>
                {metric.description && (
                  <p className="text-xs text-muted-foreground mt-1">
                    {metric.description}
                  </p>
                )}
              </CardContent>
            </Card>
          )
        })}
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="spending">Spending Analysis</TabsTrigger>
          <TabsTrigger value="products">Product Insights</TabsTrigger>
          <TabsTrigger value="users">User Activity</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Spending by Category */}
            <Card>
              <CardHeader>
                <CardTitle>Spending by Category</CardTitle>
                <CardDescription>
                  Breakdown of procurement spending by product category
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {spendingByCategory.map((item, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                        <span className="font-medium">{item.category}</span>
                        {getTrendIcon(item.trend)}
                      </div>
                      <div className="text-right">
                        <div className="font-bold">${item.amount.toLocaleString()}</div>
                        <div className="text-sm text-muted-foreground">{item.percentage}%</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Monthly Trends */}
            <Card>
              <CardHeader>
                <CardTitle>Monthly Spending Trend</CardTitle>
                <CardDescription>
                  Spending trends over the last 6 months
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {monthlySpending.map((item, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-12 text-sm font-medium">{item.period}</div>
                      </div>
                      <div className="flex items-center space-x-4">
                        <div className="w-32 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-500 h-2 rounded-full"
                            style={{ width: `${(item.value / 55000) * 100}%` }}
                          ></div>
                        </div>
                        <div className="font-bold text-sm w-20 text-right">
                          ${(item.value / 1000).toFixed(0)}k
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="spending" className="space-y-4">
          <div className="grid grid-cols-1 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Detailed Spending Analysis</CardTitle>
                <CardDescription>
                  Comprehensive view of company procurement spending patterns
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <BarChart3 className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">Advanced Analytics</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Detailed spending analysis and cost optimization insights.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="products" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Top Ordered Products</CardTitle>
              <CardDescription>
                Most frequently ordered products and their performance
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2">Product</th>
                      <th className="text-right py-2">Orders</th>
                      <th className="text-right py-2">Total Value</th>
                      <th className="text-center py-2">Trend</th>
                    </tr>
                  </thead>
                  <tbody>
                    {topProducts.map((product, index) => (
                      <tr key={index} className="border-b">
                        <td className="py-3 font-medium">{product.name}</td>
                        <td className="text-right py-3">{product.orders}</td>
                        <td className="text-right py-3 font-bold">${product.value.toLocaleString()}</td>
                        <td className="text-center py-3">{getTrendIcon(product.trend)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="users" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>User Activity & Spending</CardTitle>
              <CardDescription>
                Team member procurement activity and spending patterns
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2">User</th>
                      <th className="text-left py-2">Role</th>
                      <th className="text-right py-2">Orders</th>
                      <th className="text-right py-2">Total Spending</th>
                    </tr>
                  </thead>
                  <tbody>
                    {userActivity.map((user, index) => (
                      <tr key={index} className="border-b">
                        <td className="py-3">
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
                              {user.name.split(' ').map(n => n[0]).join('')}
                            </div>
                            <span className="font-medium">{user.name}</span>
                          </div>
                        </td>
                        <td className="py-3">
                          <Badge variant="outline">{user.role}</Badge>
                        </td>
                        <td className="text-right py-3">{user.orders}</td>
                        <td className="text-right py-3 font-bold">${user.spending.toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
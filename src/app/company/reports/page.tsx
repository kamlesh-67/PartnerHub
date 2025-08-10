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
  FileText, 
  Download, 
  BarChart3,
  DollarSign,
  TrendingUp,
  Users,
  ShoppingCart,
  Package,
  Calendar,
  RefreshCcw,
  Plus,
  Eye,
  PieChart,
  LineChart,
  Target,
  Award
} from 'lucide-react'

interface CompanyReport {
  id: string
  name: string
  type: 'SPENDING' | 'ORDERS' | 'USERS' | 'PRODUCTS' | 'COMPLIANCE' | 'BUDGET'
  description: string
  lastGenerated: string
  fileSize: string
  status: 'READY' | 'GENERATING' | 'ERROR'
  category: string
  downloadUrl?: string
}

interface ReportMetric {
  title: string
  value: string
  change: string
  trend: 'up' | 'down' | 'neutral'
  icon: React.ElementType
}

export default function CompanyReportsPage() {
  const { data: session } = useSession()
  const [reports, setReports] = useState<CompanyReport[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [typeFilter, setTypeFilter] = useState<string>('ALL')
  const [dateRange, setDateRange] = useState<string>('30_DAYS')

  const mockReports: CompanyReport[] = [
    {
      id: '1',
      name: 'Monthly Spending Analysis',
      type: 'SPENDING',
      description: 'Detailed breakdown of company spending by category and department',
      lastGenerated: '2024-01-10T14:30:00Z',
      fileSize: '2.4 MB',
      status: 'READY',
      category: 'Financial',
      downloadUrl: '/api/reports/download/monthly-spending.pdf'
    },
    {
      id: '2',
      name: 'Order History Report',
      type: 'ORDERS',
      description: 'Complete order history with trends and patterns analysis',
      lastGenerated: '2024-01-10T11:15:00Z',
      fileSize: '1.9 MB',
      status: 'READY',
      category: 'Procurement',
      downloadUrl: '/api/reports/download/order-history.pdf'
    },
    {
      id: '3',
      name: 'User Activity Summary',
      type: 'USERS',
      description: 'Team member usage patterns and activity analytics',
      lastGenerated: '2024-01-10T09:45:00Z',
      fileSize: '850 KB',
      status: 'READY',
      category: 'Usage',
      downloadUrl: '/api/reports/download/user-activity.pdf'
    },
    {
      id: '4',
      name: 'Product Performance Report',
      type: 'PRODUCTS',
      description: 'Analysis of most ordered products and category preferences',
      lastGenerated: '2024-01-09T16:20:00Z',
      fileSize: '1.6 MB',
      status: 'GENERATING',
      category: 'Products'
    },
    {
      id: '5',
      name: 'Budget Compliance Report',
      type: 'BUDGET',
      description: 'Budget tracking and compliance monitoring',
      lastGenerated: '2024-01-09T13:30:00Z',
      fileSize: '1.3 MB',
      status: 'READY',
      category: 'Financial',
      downloadUrl: '/api/reports/download/budget-compliance.pdf'
    },
    {
      id: '6',
      name: 'Compliance Audit Report',
      type: 'COMPLIANCE',
      description: 'Regulatory compliance and audit trail documentation',
      lastGenerated: '2024-01-08T10:00:00Z',
      fileSize: '3.1 MB',
      status: 'READY',
      category: 'Compliance',
      downloadUrl: '/api/reports/download/compliance-audit.pdf'
    }
  ]

  const reportMetrics: ReportMetric[] = [
    {
      title: 'Total Spending',
      value: '$45,892',
      change: '+12.5%',
      trend: 'up',
      icon: DollarSign
    },
    {
      title: 'Orders This Month',
      value: '127',
      change: '+8.2%',
      trend: 'up',
      icon: ShoppingCart
    },
    {
      title: 'Cost Savings',
      value: '$8,245',
      change: '+22.1%',
      trend: 'up',
      icon: Award
    },
    {
      title: 'Budget Utilization',
      value: '68.4%',
      change: '+5.2%',
      trend: 'up',
      icon: Target
    }
  ]

  useEffect(() => {
    setTimeout(() => {
      setReports(mockReports)
      setLoading(false)
    }, 1000)
  }, [])

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'READY':
        return <Badge variant="secondary" className="bg-green-100 text-green-800">Ready</Badge>
      case 'GENERATING':
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">Generating</Badge>
      case 'ERROR':
        return <Badge variant="destructive">Error</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  const getReportTypeIcon = (type: string) => {
    switch (type) {
      case 'SPENDING':
        return <DollarSign className="h-4 w-4" />
      case 'ORDERS':
        return <ShoppingCart className="h-4 w-4" />
      case 'USERS':
        return <Users className="h-4 w-4" />
      case 'PRODUCTS':
        return <Package className="h-4 w-4" />
      case 'COMPLIANCE':
        return <FileText className="h-4 w-4" />
      case 'BUDGET':
        return <Target className="h-4 w-4" />
      default:
        return <FileText className="h-4 w-4" />
    }
  }

  const filteredReports = reports.filter(report => {
    const matchesSearch = report.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         report.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesType = typeFilter === 'ALL' || report.type === typeFilter
    return matchesSearch && matchesType
  })

  if (loading) {
    return <div className="flex items-center justify-center h-96">Loading reports...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Company Reports</h1>
          <p className="text-muted-foreground">Generate and analyze company spending, usage, and compliance reports</p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline">
            <RefreshCcw className="h-4 w-4 mr-2" />
            Refresh All
          </Button>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Custom Report
          </Button>
        </div>
      </div>

      {/* Metrics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {reportMetrics.map((metric, index) => {
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

      <Tabs defaultValue="reports" className="space-y-4">
        <TabsList>
          <TabsTrigger value="reports">Available Reports</TabsTrigger>
          <TabsTrigger value="analytics">Quick Analytics</TabsTrigger>
          <TabsTrigger value="scheduled">Scheduled Reports</TabsTrigger>
          <TabsTrigger value="custom">Custom Reports</TabsTrigger>
        </TabsList>

        <TabsContent value="reports" className="space-y-4">
          {/* Filters */}
          <Card>
            <CardHeader>
              <CardTitle>Filter Reports</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <Label htmlFor="search">Search Reports</Label>
                  <div className="relative">
                    <FileText className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="search"
                      placeholder="Search by name or description..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-8"
                    />
                  </div>
                </div>
                
                <div className="min-w-[200px]">
                  <Label>Report Type</Label>
                  <Select value={typeFilter} onValueChange={setTypeFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="All Types" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ALL">All Types</SelectItem>
                      <SelectItem value="SPENDING">Spending Analysis</SelectItem>
                      <SelectItem value="ORDERS">Order Reports</SelectItem>
                      <SelectItem value="USERS">User Activity</SelectItem>
                      <SelectItem value="PRODUCTS">Product Reports</SelectItem>
                      <SelectItem value="BUDGET">Budget Reports</SelectItem>
                      <SelectItem value="COMPLIANCE">Compliance</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="min-w-[200px]">
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

          {/* Reports Table */}
          <Card>
            <CardHeader>
              <CardTitle>Company Reports ({filteredReports.length})</CardTitle>
              <CardDescription>
                Generated reports for your company's procurement and usage analysis
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Report</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Last Generated</TableHead>
                      <TableHead>File Size</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredReports.map((report) => (
                      <TableRow key={report.id}>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            {getReportTypeIcon(report.type)}
                            <span className="font-medium">{report.name}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{report.type}</Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary">{report.category}</Badge>
                        </TableCell>
                        <TableCell className="max-w-xs">
                          <p className="text-sm text-muted-foreground truncate">
                            {report.description}
                          </p>
                        </TableCell>
                        <TableCell>{getStatusBadge(report.status)}</TableCell>
                        <TableCell>
                          {new Date(report.lastGenerated).toLocaleDateString()}
                        </TableCell>
                        <TableCell>{report.fileSize}</TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            {report.status === 'READY' && report.downloadUrl && (
                              <Button variant="outline" size="sm">
                                <Download className="h-3 w-3 mr-1" />
                                Download
                              </Button>
                            )}
                            <Button variant="outline" size="sm">
                              <Eye className="h-3 w-3" />
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

        <TabsContent value="analytics" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Spending Trends</CardTitle>
                <CardDescription>
                  Monthly spending patterns and trends
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <LineChart className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">Spending Analytics</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Interactive spending trend analysis.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Category Breakdown</CardTitle>
                <CardDescription>
                  Spending distribution by product category
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <PieChart className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">Category Analysis</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Visual breakdown of spending by category.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="scheduled" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Scheduled Reports</CardTitle>
              <CardDescription>
                Manage automatically generated reports
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <Calendar className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">Automated Reporting</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Set up automatic report generation and delivery.
                </p>
                <div className="mt-6">
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Schedule Report
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="custom" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Custom Report Builder</CardTitle>
              <CardDescription>
                Create custom reports with specific metrics and filters
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <BarChart3 className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">Report Builder</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Build custom reports with drag-and-drop interface.
                </p>
                <div className="mt-6">
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Build Custom Report
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
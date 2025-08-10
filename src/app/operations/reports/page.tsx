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
  TrendingUp,
  Package,
  Truck,
  ClipboardList,
  Users,
  DollarSign,
  Calendar,
  RefreshCcw,
  Plus,
  Eye,
  PieChart,
  LineChart,
  Filter
} from 'lucide-react'

interface OperationsReport {
  id: string
  name: string
  type: 'PRODUCTION' | 'SHIPPING' | 'QUALITY' | 'INVENTORY' | 'PERFORMANCE' | 'OPERATIONAL'
  description: string
  lastGenerated: string
  fileSize: string
  status: 'READY' | 'GENERATING' | 'ERROR'
  category: string
  downloadUrl?: string
}

interface OperationsMetric {
  title: string
  value: string
  change: string
  trend: 'up' | 'down' | 'neutral'
  icon: React.ElementType
}

export default function OperationsReportsPage() {
  const { data: session } = useSession()
  const [reports, setReports] = useState<OperationsReport[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [typeFilter, setTypeFilter] = useState<string>('ALL')
  const [dateRange, setDateRange] = useState<string>('7_DAYS')

  const mockReports: OperationsReport[] = [
    {
      id: '1',
      name: 'Production Efficiency Report',
      type: 'PRODUCTION',
      description: 'Daily production metrics, throughput analysis, and efficiency trends',
      lastGenerated: '2024-01-10T14:30:00Z',
      fileSize: '1.8 MB',
      status: 'READY',
      category: 'Operations',
      downloadUrl: '/api/reports/download/production-efficiency.pdf'
    },
    {
      id: '2',
      name: 'Shipping Performance Dashboard',
      type: 'SHIPPING',
      description: 'Delivery metrics, carrier performance, and logistics analytics',
      lastGenerated: '2024-01-10T12:15:00Z',
      fileSize: '2.3 MB',
      status: 'READY',
      category: 'Logistics',
      downloadUrl: '/api/reports/download/shipping-performance.pdf'
    },
    {
      id: '3',
      name: 'Quality Control Summary',
      type: 'QUALITY',
      description: 'Quality metrics, inspection results, and defect analysis',
      lastGenerated: '2024-01-10T10:45:00Z',
      fileSize: '1.2 MB',
      status: 'READY',
      category: 'Quality',
      downloadUrl: '/api/reports/download/quality-control.pdf'
    },
    {
      id: '4',
      name: 'Inventory Operations Report',
      type: 'INVENTORY',
      description: 'Stock movements, turnover rates, and inventory optimization',
      lastGenerated: '2024-01-10T09:20:00Z',
      fileSize: '2.1 MB',
      status: 'GENERATING',
      category: 'Inventory'
    },
    {
      id: '5',
      name: 'Operations Performance KPIs',
      type: 'PERFORMANCE',
      description: 'Key performance indicators for operational efficiency',
      lastGenerated: '2024-01-09T16:30:00Z',
      fileSize: '1.5 MB',
      status: 'READY',
      category: 'Performance',
      downloadUrl: '/api/reports/download/performance-kpis.pdf'
    },
    {
      id: '6',
      name: 'Operational Cost Analysis',
      type: 'OPERATIONAL',
      description: 'Cost breakdown, efficiency ratios, and budget analysis',
      lastGenerated: '2024-01-09T14:15:00Z',
      fileSize: '1.9 MB',
      status: 'READY',
      category: 'Finance',
      downloadUrl: '/api/reports/download/cost-analysis.pdf'
    }
  ]

  const operationsMetrics: OperationsMetric[] = [
    {
      title: 'Production Efficiency',
      value: '94.2%',
      change: '+2.3%',
      trend: 'up',
      icon: TrendingUp
    },
    {
      title: 'Quality Pass Rate',
      value: '96.8%',
      change: '+1.1%',
      trend: 'up',
      icon: ClipboardList
    },
    {
      title: 'On-Time Shipping',
      value: '92.5%',
      change: '+0.8%',
      trend: 'up',
      icon: Truck
    },
    {
      title: 'Inventory Turnover',
      value: '4.2x',
      change: '+0.3x',
      trend: 'up',
      icon: Package
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
      case 'PRODUCTION':
        return <TrendingUp className="h-4 w-4" />
      case 'SHIPPING':
        return <Truck className="h-4 w-4" />
      case 'QUALITY':
        return <ClipboardList className="h-4 w-4" />
      case 'INVENTORY':
        return <Package className="h-4 w-4" />
      case 'PERFORMANCE':
        return <BarChart3 className="h-4 w-4" />
      case 'OPERATIONAL':
        return <DollarSign className="h-4 w-4" />
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
          <h1 className="text-3xl font-bold">Operations Reports</h1>
          <p className="text-muted-foreground">Generate and analyze operational performance reports</p>
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
        {operationsMetrics.map((metric, index) => {
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
          <TabsTrigger value="reports">Operations Reports</TabsTrigger>
          <TabsTrigger value="analytics">Real-time Analytics</TabsTrigger>
          <TabsTrigger value="kpis">Performance KPIs</TabsTrigger>
          <TabsTrigger value="schedules">Scheduled Reports</TabsTrigger>
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
                      <SelectItem value="PRODUCTION">Production</SelectItem>
                      <SelectItem value="SHIPPING">Shipping</SelectItem>
                      <SelectItem value="QUALITY">Quality</SelectItem>
                      <SelectItem value="INVENTORY">Inventory</SelectItem>
                      <SelectItem value="PERFORMANCE">Performance</SelectItem>
                      <SelectItem value="OPERATIONAL">Operational</SelectItem>
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
              <CardTitle>Available Reports ({filteredReports.length})</CardTitle>
              <CardDescription>
                Download operational reports or generate new ones
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
          <Card>
            <CardHeader>
              <CardTitle>Real-time Operations Analytics</CardTitle>
              <CardDescription>
                Live operational metrics and performance dashboards
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <BarChart3 className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">Analytics Dashboard</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Real-time operational analytics and performance metrics.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="kpis" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Performance KPIs</CardTitle>
              <CardDescription>
                Key performance indicators and operational benchmarks
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <TrendingUp className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">KPI Dashboard</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Performance indicators and operational benchmarking.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="schedules" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Scheduled Reports</CardTitle>
              <CardDescription>
                Automated report generation and delivery schedules
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <Calendar className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">Scheduled Reports</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Automated report scheduling and delivery management.
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
      </Tabs>
    </div>
  )
}
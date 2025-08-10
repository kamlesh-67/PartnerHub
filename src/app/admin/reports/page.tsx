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
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { 
  FileText, 
  Download, 
  Calendar as CalendarIcon,
  TrendingUp,
  DollarSign,
  Users,
  Package,
  BarChart3,
  PieChart,
  LineChart,
  Eye,
  Filter,
  RefreshCcw
} from 'lucide-react'
import { format } from 'date-fns'

interface ReportData {
  id: string
  name: string
  type: 'SALES' | 'INVENTORY' | 'USERS' | 'ORDERS' | 'FINANCIAL' | 'ACTIVITY'
  description: string
  lastGenerated: string
  fileSize: string
  status: 'READY' | 'GENERATING' | 'ERROR'
  downloadUrl?: string
}

interface ReportMetric {
  title: string
  value: string
  change: string
  trend: 'up' | 'down' | 'neutral'
  icon: React.ElementType
}

export default function AdminReportsPage() {
  const { data: session } = useSession()
  const [reports, setReports] = useState<ReportData[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedDate, setSelectedDate] = useState<Date>()
  const [reportType, setReportType] = useState<string>('ALL')
  const [dateRange, setDateRange] = useState<string>('7_DAYS')

  // Mock reports data
  const mockReports: ReportData[] = [
    {
      id: '1',
      name: 'Sales Performance Report',
      type: 'SALES',
      description: 'Comprehensive sales analysis with revenue, trends, and top products',
      lastGenerated: '2024-01-10T14:30:00Z',
      fileSize: '2.1 MB',
      status: 'READY',
      downloadUrl: '/api/reports/download/sales-performance.pdf'
    },
    {
      id: '2',
      name: 'Inventory Status Report',
      type: 'INVENTORY',
      description: 'Current stock levels, low inventory alerts, and reorder recommendations',
      lastGenerated: '2024-01-10T10:15:00Z',
      fileSize: '1.8 MB',
      status: 'READY',
      downloadUrl: '/api/reports/download/inventory-status.pdf'
    },
    {
      id: '3',
      name: 'User Activity Report',
      type: 'USERS',
      description: 'User engagement, login patterns, and activity analytics',
      lastGenerated: '2024-01-10T09:45:00Z',
      fileSize: '950 KB',
      status: 'READY',
      downloadUrl: '/api/reports/download/user-activity.pdf'
    },
    {
      id: '4',
      name: 'Financial Summary Report',
      type: 'FINANCIAL',
      description: 'Revenue analysis, profit margins, and financial KPIs',
      lastGenerated: '2024-01-09T16:20:00Z',
      fileSize: '3.2 MB',
      status: 'GENERATING'
    },
    {
      id: '5',
      name: 'Order Analytics Report',
      type: 'ORDERS',
      description: 'Order patterns, fulfillment metrics, and customer insights',
      lastGenerated: '2024-01-09T11:30:00Z',
      fileSize: '2.7 MB',
      status: 'READY',
      downloadUrl: '/api/reports/download/order-analytics.pdf'
    }
  ]

  // Mock metrics data
  const reportMetrics: ReportMetric[] = [
    {
      title: 'Total Revenue',
      value: '$124,592',
      change: '+12.5%',
      trend: 'up',
      icon: DollarSign
    },
    {
      title: 'Orders This Month',
      value: '1,247',
      change: '+8.2%',
      trend: 'up',
      icon: Package
    },
    {
      title: 'Active Users',
      value: '892',
      change: '+3.1%',
      trend: 'up',
      icon: Users
    },
    {
      title: 'Inventory Turnover',
      value: '4.2x',
      change: '-2.1%',
      trend: 'down',
      icon: TrendingUp
    }
  ]

  useEffect(() => {
    // Simulate API call
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
      case 'SALES':
        return <BarChart3 className="h-4 w-4" />
      case 'INVENTORY':
        return <Package className="h-4 w-4" />
      case 'USERS':
        return <Users className="h-4 w-4" />
      case 'ORDERS':
        return <FileText className="h-4 w-4" />
      case 'FINANCIAL':
        return <DollarSign className="h-4 w-4" />
      case 'ACTIVITY':
        return <PieChart className="h-4 w-4" />
      default:
        return <FileText className="h-4 w-4" />
    }
  }

  const filteredReports = reports.filter(report => 
    reportType === 'ALL' || report.type === reportType
  )

  const generateReport = (reportId: string) => {
    console.log('Generating report:', reportId)
    // Implement report generation logic
  }

  if (loading) {
    return <div className="flex items-center justify-center h-96">Loading reports...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Reports & Analytics</h1>
          <p className="text-muted-foreground">Generate and download comprehensive business reports</p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline">
            <RefreshCcw className="h-4 w-4 mr-2" />
            Refresh All
          </Button>
          <Button>
            <FileText className="h-4 w-4 mr-2" />
            New Report
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
                  {metric.change} from last month
                </p>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <Tabs defaultValue="reports" className="space-y-4">
        <TabsList>
          <TabsTrigger value="reports">Available Reports</TabsTrigger>
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
                <div className="min-w-[200px]">
                  <Label>Report Type</Label>
                  <Select value={reportType} onValueChange={setReportType}>
                    <SelectTrigger>
                      <SelectValue placeholder="All Types" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ALL">All Types</SelectItem>
                      <SelectItem value="SALES">Sales</SelectItem>
                      <SelectItem value="INVENTORY">Inventory</SelectItem>
                      <SelectItem value="USERS">Users</SelectItem>
                      <SelectItem value="ORDERS">Orders</SelectItem>
                      <SelectItem value="FINANCIAL">Financial</SelectItem>
                      <SelectItem value="ACTIVITY">Activity</SelectItem>
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
                      <SelectItem value="CUSTOM">Custom range</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="min-w-[200px]">
                  <Label>Custom Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full justify-start text-left font-normal"
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {selectedDate ? format(selectedDate, "PPP") : "Pick a date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={selectedDate}
                        onSelect={setSelectedDate}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Reports Table */}
          <Card>
            <CardHeader>
              <CardTitle>Available Reports ({filteredReports.length})</CardTitle>
              <CardDescription>
                Download generated reports or generate new ones
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Report</TableHead>
                      <TableHead>Type</TableHead>
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
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => generateReport(report.id)}
                            >
                              <RefreshCcw className="h-3 w-3 mr-1" />
                              Generate
                            </Button>
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
                <FileText className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No scheduled reports</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Get started by creating a scheduled report.
                </p>
                <div className="mt-6">
                  <Button>
                    <FileText className="h-4 w-4 mr-2" />
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
                <PieChart className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">Custom Report Builder</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Build custom reports with drag-and-drop interface.
                </p>
                <div className="mt-6">
                  <Button>
                    <LineChart className="h-4 w-4 mr-2" />
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
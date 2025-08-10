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
  Server, 
  AlertTriangle, 
  CheckCircle, 
  XCircle,
  Activity,
  Database,
  Globe,
  User,
  Settings,
  Bug,
  Zap,
  Download,
  RefreshCcw,
  Search,
  Filter,
  Clock,
  Info,
  AlertCircle,
  Shield,
  Eye,
  Terminal
} from 'lucide-react'

interface SystemLog {
  id: string
  timestamp: string
  level: 'INFO' | 'WARN' | 'ERROR' | 'DEBUG' | 'FATAL'
  category: 'SERVER' | 'DATABASE' | 'AUTH' | 'API' | 'UI' | 'SYSTEM' | 'SECURITY' | 'PERFORMANCE'
  message: string
  source: string
  userId?: string
  userEmail?: string
  ipAddress?: string
  userAgent?: string
  details?: Record<string, any>
  stackTrace?: string
}

interface SystemHealth {
  cpu: number
  memory: number
  disk: number
  database: 'healthy' | 'warning' | 'critical'
  api: 'healthy' | 'warning' | 'critical'
  uptime: string
}

export default function SystemLogsPage() {
  const { data: session } = useSession()
  const [logs, setLogs] = useState<SystemLog[]>([])
  const [systemHealth, setSystemHealth] = useState<SystemHealth | null>(null)
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [levelFilter, setLevelFilter] = useState<string>('ALL')
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL')
  const [timeRange, setTimeRange] = useState<string>('1_HOUR')

  // Mock system logs data
  const mockLogs: SystemLog[] = [
    {
      id: '1',
      timestamp: '2024-01-10T15:30:25.123Z',
      level: 'ERROR',
      category: 'DATABASE',
      message: 'Connection timeout to primary database',
      source: 'DatabasePool.js:127',
      details: { 
        connectionAttempts: 3,
        timeout: 30000,
        host: 'db-primary.internal'
      }
    },
    {
      id: '2',
      timestamp: '2024-01-10T15:29:45.856Z',
      level: 'WARN',
      category: 'SECURITY',
      message: 'Multiple failed login attempts detected',
      source: 'AuthController.js:89',
      userId: 'user_123',
      userEmail: 'suspicious@example.com',
      ipAddress: '192.168.1.100',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
      details: {
        attempts: 5,
        timeWindow: '5 minutes'
      }
    },
    {
      id: '3',
      timestamp: '2024-01-10T15:28:12.445Z',
      level: 'INFO',
      category: 'AUTH',
      message: 'User successfully logged in',
      source: 'AuthService.js:156',
      userId: 'user_456',
      userEmail: 'admin@partnerhub.com',
      ipAddress: '10.0.0.50',
      userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)'
    },
    {
      id: '4',
      timestamp: '2024-01-10T15:27:38.992Z',
      level: 'ERROR',
      category: 'API',
      message: 'API rate limit exceeded',
      source: 'RateLimitMiddleware.js:45',
      ipAddress: '203.0.113.25',
      details: {
        endpoint: '/api/products',
        limit: 100,
        window: '1 hour',
        requests: 150
      }
    },
    {
      id: '5',
      timestamp: '2024-01-10T15:26:55.331Z',
      level: 'WARN',
      category: 'PERFORMANCE',
      message: 'High memory usage detected',
      source: 'HealthMonitor.js:78',
      details: {
        memoryUsage: '85%',
        threshold: '80%',
        processId: 12345
      }
    },
    {
      id: '6',
      timestamp: '2024-01-10T15:25:22.667Z',
      level: 'DEBUG',
      category: 'UI',
      message: 'Component rendered with props',
      source: 'ProductCard.tsx:23',
      details: {
        componentName: 'ProductCard',
        props: { productId: 'prod_123', variant: 'compact' }
      }
    },
    {
      id: '7',
      timestamp: '2024-01-10T15:24:15.789Z',
      level: 'FATAL',
      category: 'SYSTEM',
      message: 'Application crashed due to unhandled exception',
      source: 'app.js:15',
      stackTrace: 'TypeError: Cannot read property \'id\' of undefined\n    at processOrder (OrderService.js:89:12)\n    at handleRequest (app.js:45:8)',
      details: {
        error: 'TypeError',
        exitCode: 1
      }
    }
  ]

  // Mock system health data
  const mockSystemHealth: SystemHealth = {
    cpu: 45,
    memory: 68,
    disk: 32,
    database: 'healthy',
    api: 'warning',
    uptime: '7 days, 14 hours, 23 minutes'
  }

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setLogs(mockLogs)
      setSystemHealth(mockSystemHealth)
      setLoading(false)
    }, 1000)
  }, [])

  const getLevelBadge = (level: string) => {
    switch (level) {
      case 'INFO':
        return <Badge variant="secondary" className="bg-blue-100 text-blue-800">INFO</Badge>
      case 'WARN':
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">WARN</Badge>
      case 'ERROR':
        return <Badge variant="destructive">ERROR</Badge>
      case 'DEBUG':
        return <Badge variant="secondary" className="bg-gray-100 text-gray-800">DEBUG</Badge>
      case 'FATAL':
        return <Badge variant="destructive" className="bg-red-600">FATAL</Badge>
      default:
        return <Badge variant="secondary">{level}</Badge>
    }
  }

  const getLevelIcon = (level: string) => {
    switch (level) {
      case 'INFO':
        return <Info className="h-4 w-4 text-blue-500" />
      case 'WARN':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />
      case 'ERROR':
        return <XCircle className="h-4 w-4 text-red-500" />
      case 'DEBUG':
        return <Bug className="h-4 w-4 text-gray-500" />
      case 'FATAL':
        return <AlertCircle className="h-4 w-4 text-red-600" />
      default:
        return <Activity className="h-4 w-4" />
    }
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'SERVER':
        return <Server className="h-4 w-4" />
      case 'DATABASE':
        return <Database className="h-4 w-4" />
      case 'AUTH':
        return <Shield className="h-4 w-4" />
      case 'API':
        return <Globe className="h-4 w-4" />
      case 'UI':
        return <Eye className="h-4 w-4" />
      case 'SYSTEM':
        return <Settings className="h-4 w-4" />
      case 'SECURITY':
        return <Shield className="h-4 w-4" />
      case 'PERFORMANCE':
        return <Zap className="h-4 w-4" />
      default:
        return <Activity className="h-4 w-4" />
    }
  }

  const getHealthBadge = (status: string) => {
    switch (status) {
      case 'healthy':
        return <Badge variant="secondary" className="bg-green-100 text-green-800">Healthy</Badge>
      case 'warning':
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">Warning</Badge>
      case 'critical':
        return <Badge variant="destructive">Critical</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  const filteredLogs = logs.filter(log => {
    const matchesSearch = log.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         log.source.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (log.userEmail && log.userEmail.toLowerCase().includes(searchTerm.toLowerCase()))
    const matchesLevel = levelFilter === 'ALL' || log.level === levelFilter
    const matchesCategory = categoryFilter === 'ALL' || log.category === categoryFilter
    return matchesSearch && matchesLevel && matchesCategory
  })

  if (loading) {
    return <div className="flex items-center justify-center h-96">Loading system logs...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">System Logs & Monitoring</h1>
          <p className="text-muted-foreground">Monitor system health, logs, and error reports</p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export Logs
          </Button>
          <Button>
            <RefreshCcw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* System Health Overview */}
      {systemHealth && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">CPU Usage</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{systemHealth.cpu}%</div>
              <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                <div 
                  className={`h-2 rounded-full ${systemHealth.cpu > 80 ? 'bg-red-500' : systemHealth.cpu > 60 ? 'bg-yellow-500' : 'bg-green-500'}`}
                  style={{ width: `${systemHealth.cpu}%` }}
                ></div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Memory Usage</CardTitle>
              <Server className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{systemHealth.memory}%</div>
              <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                <div 
                  className={`h-2 rounded-full ${systemHealth.memory > 80 ? 'bg-red-500' : systemHealth.memory > 60 ? 'bg-yellow-500' : 'bg-green-500'}`}
                  style={{ width: `${systemHealth.memory}%` }}
                ></div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Database</CardTitle>
              <Database className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-2">
                {getHealthBadge(systemHealth.database)}
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Primary & replica healthy
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Uptime</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-sm font-bold">{systemHealth.uptime}</div>
              <p className="text-xs text-muted-foreground mt-2">
                Last restart: Jan 3, 2024
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      <Tabs defaultValue="logs" className="space-y-4">
        <TabsList>
          <TabsTrigger value="logs">System Logs</TabsTrigger>
          <TabsTrigger value="errors">Error Reports</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="security">Security Events</TabsTrigger>
        </TabsList>

        <TabsContent value="logs" className="space-y-4">
          {/* Filters */}
          <Card>
            <CardHeader>
              <CardTitle>Log Filters</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <Label htmlFor="search">Search Logs</Label>
                  <div className="relative">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="search"
                      placeholder="Search messages, sources, users..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-8"
                    />
                  </div>
                </div>
                
                <div className="min-w-[150px]">
                  <Label>Log Level</Label>
                  <Select value={levelFilter} onValueChange={setLevelFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="All Levels" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ALL">All Levels</SelectItem>
                      <SelectItem value="FATAL">Fatal</SelectItem>
                      <SelectItem value="ERROR">Error</SelectItem>
                      <SelectItem value="WARN">Warning</SelectItem>
                      <SelectItem value="INFO">Info</SelectItem>
                      <SelectItem value="DEBUG">Debug</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="min-w-[150px]">
                  <Label>Category</Label>
                  <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="All Categories" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ALL">All Categories</SelectItem>
                      <SelectItem value="SERVER">Server</SelectItem>
                      <SelectItem value="DATABASE">Database</SelectItem>
                      <SelectItem value="AUTH">Authentication</SelectItem>
                      <SelectItem value="API">API</SelectItem>
                      <SelectItem value="UI">User Interface</SelectItem>
                      <SelectItem value="SYSTEM">System</SelectItem>
                      <SelectItem value="SECURITY">Security</SelectItem>
                      <SelectItem value="PERFORMANCE">Performance</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="min-w-[150px]">
                  <Label>Time Range</Label>
                  <Select value={timeRange} onValueChange={setTimeRange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select range" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1_HOUR">Last hour</SelectItem>
                      <SelectItem value="24_HOURS">Last 24 hours</SelectItem>
                      <SelectItem value="7_DAYS">Last 7 days</SelectItem>
                      <SelectItem value="30_DAYS">Last 30 days</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Logs Table */}
          <Card>
            <CardHeader>
              <CardTitle>System Logs ({filteredLogs.length})</CardTitle>
              <CardDescription>
                Real-time system events, errors, and activity logs
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Timestamp</TableHead>
                      <TableHead>Level</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Message</TableHead>
                      <TableHead>Source</TableHead>
                      <TableHead>User</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredLogs.map((log) => (
                      <TableRow key={log.id} className={log.level === 'ERROR' || log.level === 'FATAL' ? 'bg-red-50' : ''}>
                        <TableCell className="font-mono text-xs">
                          {new Date(log.timestamp).toLocaleString()}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            {getLevelIcon(log.level)}
                            {getLevelBadge(log.level)}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            {getCategoryIcon(log.category)}
                            <span className="text-sm">{log.category}</span>
                          </div>
                        </TableCell>
                        <TableCell className="max-w-md">
                          <p className="text-sm truncate" title={log.message}>
                            {log.message}
                          </p>
                        </TableCell>
                        <TableCell className="font-mono text-xs text-muted-foreground">
                          {log.source}
                        </TableCell>
                        <TableCell>
                          {log.userEmail && (
                            <div className="text-sm">
                              <div>{log.userEmail}</div>
                              {log.ipAddress && (
                                <div className="text-xs text-muted-foreground">{log.ipAddress}</div>
                              )}
                            </div>
                          )}
                        </TableCell>
                        <TableCell>
                          <Button variant="outline" size="sm">
                            <Eye className="h-3 w-3" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="errors" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Error Reports & Stack Traces</CardTitle>
              <CardDescription>
                Detailed error information with stack traces and debugging data
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <Terminal className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">Error Tracking</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Detailed error reports and stack traces will appear here.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Performance Monitoring</CardTitle>
              <CardDescription>
                System performance metrics and optimization insights
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <Zap className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">Performance Analytics</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Performance metrics and bottleneck analysis will appear here.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Security Events</CardTitle>
              <CardDescription>
                Authentication attempts, security alerts, and access logs
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <Shield className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">Security Monitoring</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Security events and access logs will appear here.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
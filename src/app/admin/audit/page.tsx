'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { 
  Activity,
  Search,
  Filter,
  Download,
  Calendar,
  User,
  Database,
  Shield,
  AlertTriangle,
  CheckCircle,
  Settings,
  Eye,
  Edit,
  Trash2,
  UserPlus,
  UserMinus,
  Lock,
  Unlock,
  FileText,
  Package,
  ShoppingCart,
  Building2
} from 'lucide-react'

interface AuditLogEntry {
  id: string
  timestamp: string
  action: string
  resource: string
  resourceId: string
  userId: string
  userEmail: string
  userName: string
  ipAddress: string
  userAgent: string
  details: {
    oldValues?: Record<string, unknown>
    newValues?: Record<string, unknown>
    metadata?: Record<string, unknown>
  }
  severity: 'info' | 'warning' | 'error' | 'critical'
  category: 'authentication' | 'user_management' | 'system' | 'data' | 'security'
}

export default function AuditLogPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [selectedSeverity, setSelectedSeverity] = useState('all')
  const [dateRange, setDateRange] = useState('7d')

  // Mock audit log data (in a real app, this would come from an API)
  const mockAuditLogs: AuditLogEntry[] = [
    {
      id: '1',
      timestamp: '2024-01-20T15:30:00Z',
      action: 'user.login',
      resource: 'user',
      resourceId: 'user_123',
      userId: 'admin_001',
      userEmail: 'admin@company.com',
      userName: 'John Admin',
      ipAddress: '192.168.1.100',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      details: {
        metadata: { loginMethod: 'credentials', success: true }
      },
      severity: 'info',
      category: 'authentication'
    },
    {
      id: '2',
      timestamp: '2024-01-20T14:45:00Z',
      action: 'user.update',
      resource: 'user',
      resourceId: 'user_456',
      userId: 'admin_001',
      userEmail: 'admin@company.com',
      userName: 'John Admin',
      ipAddress: '192.168.1.100',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      details: {
        oldValues: { role: 'BUYER', isActive: true },
        newValues: { role: 'ACCOUNT_ADMIN', isActive: true },
        metadata: { reason: 'Role promotion' }
      },
      severity: 'warning',
      category: 'user_management'
    },
    {
      id: '3',
      timestamp: '2024-01-20T13:20:00Z',
      action: 'company.create',
      resource: 'company',
      resourceId: 'company_789',
      userId: 'admin_001',
      userEmail: 'admin@company.com',
      userName: 'John Admin',
      ipAddress: '192.168.1.100',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      details: {
        newValues: {
          name: 'Nike Inc',
          email: 'b2b@nike.com',
          status: 'pending'
        }
      },
      severity: 'info',
      category: 'data'
    },
    {
      id: '4',
      timestamp: '2024-01-20T12:15:00Z',
      action: 'security.login_failed',
      resource: 'authentication',
      resourceId: 'auth_session',
      userId: 'unknown',
      userEmail: 'attacker@malicious.com',
      userName: 'Unknown User',
      ipAddress: '10.0.0.1',
      userAgent: 'curl/7.68.0',
      details: {
        metadata: { 
          attempts: 5,
          reason: 'Invalid credentials',
          blocked: true
        }
      },
      severity: 'critical',
      category: 'security'
    },
    {
      id: '5',
      timestamp: '2024-01-20T11:30:00Z',
      action: 'system.settings_update',
      resource: 'system_settings',
      resourceId: 'settings_001',
      userId: 'admin_001',
      userEmail: 'admin@company.com',
      userName: 'John Admin',
      ipAddress: '192.168.1.100',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      details: {
        oldValues: { maintenanceMode: false },
        newValues: { maintenanceMode: true },
        metadata: { reason: 'System maintenance' }
      },
      severity: 'warning',
      category: 'system'
    },
    {
      id: '6',
      timestamp: '2024-01-20T10:45:00Z',
      action: 'user.delete',
      resource: 'user',
      resourceId: 'user_999',
      userId: 'admin_001',
      userEmail: 'admin@company.com',
      userName: 'John Admin',
      ipAddress: '192.168.1.100',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      details: {
        oldValues: {
          email: 'deleted.user@company.com',
          name: 'Deleted User',
          role: 'BUYER'
        },
        metadata: { reason: 'Account violation' }
      },
      severity: 'error',
      category: 'user_management'
    },
    {
      id: '7',
      timestamp: '2024-01-20T09:15:00Z',
      action: 'order.create',
      resource: 'order',
      resourceId: 'order_123',
      userId: 'user_456',
      userEmail: 'buyer@adidas.com',
      userName: 'Mike Buyer',
      ipAddress: '203.0.113.1',
      userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
      details: {
        newValues: {
          total: 2500.00,
          items: 5,
          status: 'pending'
        }
      },
      severity: 'info',
      category: 'data'
    }
  ]

  // Handle authentication
  useEffect(() => {
    if (status === 'loading') return
    
    if (!session) {
      router.push('/auth/signin')
      return
    }

    // Only Super Admins can access audit logs
    if (session.user.role !== 'SUPER_ADMIN') {
      router.push('/')
      return
    }
  }, [session, status, router])

  useEffect(() => {
    // Fetch audit logs
    const fetchAuditLogs = async () => {
      setLoading(true)
      try {
        // In a real app, this would be an API call with filters
        await new Promise(resolve => setTimeout(resolve, 1000))
        setAuditLogs(mockAuditLogs)
      } catch (error) {
        console.error('Error fetching audit logs:', error)
        setAuditLogs(mockAuditLogs)
      } finally {
        setLoading(false)
      }
    }

    if (session?.user.role === 'SUPER_ADMIN') {
      fetchAuditLogs()
    }
  }, [session, searchQuery, selectedCategory, selectedSeverity, dateRange])

  // Show loading state
  if (status === 'loading' || loading) {
    return (
      <div className="container mx-auto py-8">
        <div className="space-y-4">
          {[...Array(10)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-2">
                    <div className="h-4 bg-muted rounded w-1/4"></div>
                    <div className="h-3 bg-muted rounded w-1/2"></div>
                  </div>
                  <div className="h-6 bg-muted rounded w-16"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  if (!session) {
    return null
  }

  const categories = [
    { value: 'all', label: 'All Categories' },
    { value: 'authentication', label: 'Authentication' },
    { value: 'user_management', label: 'User Management' },
    { value: 'system', label: 'System' },
    { value: 'data', label: 'Data' },
    { value: 'security', label: 'Security' }
  ]

  const severityLevels = [
    { value: 'all', label: 'All Severities' },
    { value: 'info', label: 'Info' },
    { value: 'warning', label: 'Warning' },
    { value: 'error', label: 'Error' },
    { value: 'critical', label: 'Critical' }
  ]

  const dateRanges = [
    { value: '1d', label: 'Last 24 hours' },
    { value: '7d', label: 'Last 7 days' },
    { value: '30d', label: 'Last 30 days' },
    { value: '90d', label: 'Last 90 days' }
  ]

  const filteredLogs = auditLogs.filter(log => {
    const matchesSearch = log.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         log.userEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         log.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         log.resource.toLowerCase().includes(searchQuery.toLowerCase())
    
    const matchesCategory = selectedCategory === 'all' || log.category === selectedCategory
    const matchesSeverity = selectedSeverity === 'all' || log.severity === selectedSeverity
    
    return matchesSearch && matchesCategory && matchesSeverity
  })

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    })
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'info': return 'bg-blue-500'
      case 'warning': return 'bg-yellow-500'
      case 'error': return 'bg-red-500'
      case 'critical': return 'bg-purple-500'
      default: return 'bg-gray-500'
    }
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'authentication': return Shield
      case 'user_management': return User
      case 'system': return Settings
      case 'data': return Database
      case 'security': return Lock
      default: return Activity
    }
  }

  const getActionIcon = (action: string) => {
    if (action.includes('login')) return Lock
    if (action.includes('create')) return UserPlus
    if (action.includes('delete')) return Trash2
    if (action.includes('update')) return Edit
    if (action.includes('view')) return Eye
    return Activity
  }

  return (
    <div className="container mx-auto py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center space-x-4">
          <Activity className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold">Audit Log</h1>
            <p className="text-muted-foreground">
              Track all system activities and user actions
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col lg:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search activities..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger className="w-full lg:w-48">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {categories.map((category) => (
              <SelectItem key={category.value} value={category.value}>
                {category.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={selectedSeverity} onValueChange={setSelectedSeverity}>
          <SelectTrigger className="w-full lg:w-48">
            <AlertTriangle className="h-4 w-4 mr-2" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {severityLevels.map((severity) => (
              <SelectItem key={severity.value} value={severity.value}>
                {severity.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={dateRange} onValueChange={setDateRange}>
          <SelectTrigger className="w-full lg:w-48">
            <Calendar className="h-4 w-4 mr-2" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {dateRanges.map((range) => (
              <SelectItem key={range.value} value={range.value}>
                {range.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Audit Log Entries */}
      <div className="space-y-4">
        {filteredLogs.map((log) => {
          const CategoryIcon = getCategoryIcon(log.category)
          const ActionIcon = getActionIcon(log.action)
          
          return (
            <Card key={log.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3">
                    <div className="w-10 h-10 bg-muted rounded-full flex items-center justify-center">
                      <ActionIcon className="h-5 w-5" />
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <h3 className="text-sm font-medium">{log.action}</h3>
                        <Badge className={getSeverityColor(log.severity)}>
                          {log.severity}
                        </Badge>
                        <Badge variant="outline" className="flex items-center">
                          <CategoryIcon className="h-3 w-3 mr-1" />
                          {log.category.replace('_', ' ')}
                        </Badge>
                      </div>
                      
                      <div className="text-sm text-muted-foreground space-y-1">
                        <div>
                          <strong>{log.userName}</strong> ({log.userEmail}) performed action on{' '}
                          <strong>{log.resource}</strong>
                        </div>
                        
                        <div className="flex items-center space-x-4 text-xs">
                          <span>{formatDate(log.timestamp)}</span>
                          <span>IP: {log.ipAddress}</span>
                          <span>ID: {log.resourceId}</span>
                        </div>
                        
                        {log.details.metadata && (
                          <div className="mt-2 p-2 bg-muted rounded text-xs">
                            {Object.entries(log.details.metadata).map(([key, value]) => (
                              <div key={key}>
                                <strong>{key}:</strong> {String(value)}
                              </div>
                            ))}
                          </div>
                        )}
                        
                        {log.details.oldValues && log.details.newValues && (
                          <div className="mt-2 grid grid-cols-2 gap-2 text-xs">
                            <div className="p-2 bg-red-50 dark:bg-red-950 rounded">
                              <strong>Before:</strong>
                              <pre className="mt-1 text-xs overflow-auto">
                                {JSON.stringify(log.details.oldValues, null, 2)}
                              </pre>
                            </div>
                            <div className="p-2 bg-green-50 dark:bg-green-950 rounded">
                              <strong>After:</strong>
                              <pre className="mt-1 text-xs overflow-auto">
                                {JSON.stringify(log.details.newValues, null, 2)}
                              </pre>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {filteredLogs.length === 0 && (
        <div className="text-center py-12">
          <Activity className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No audit logs found</h3>
          <p className="text-muted-foreground">
            Try adjusting your search criteria or date range.
          </p>
        </div>
      )}

      {/* Summary Stats */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Activity Summary</CardTitle>
          <CardDescription>Audit log statistics for the selected period</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{filteredLogs.length}</div>
              <p className="text-sm text-muted-foreground">Total Activities</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">
                {filteredLogs.filter(log => log.severity === 'critical' || log.severity === 'error').length}
              </div>
              <p className="text-sm text-muted-foreground">Critical/Errors</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {filteredLogs.filter(log => log.category === 'authentication').length}
              </div>
              <p className="text-sm text-muted-foreground">Auth Events</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {new Set(filteredLogs.map(log => log.userId)).size}
              </div>
              <p className="text-sm text-muted-foreground">Unique Users</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
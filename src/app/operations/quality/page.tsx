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
  AlertTriangle, 
  CheckCircle, 
  XCircle,
  Shield,
  ClipboardList,
  Search,
  Plus,
  Eye,
  Edit,
  Star,
  TrendingUp,
  Users,
  Package,
  RefreshCcw,
  Award,
  ThumbsUp,
  ThumbsDown,
  FileText,
  Clock
} from 'lucide-react'

interface QualityCheck {
  id: string
  checkId: string
  productName: string
  sku: string
  inspector: string
  checkDate: string
  status: 'PASSED' | 'FAILED' | 'CONDITIONAL' | 'PENDING'
  score: number
  defects: number
  category: 'INCOMING' | 'PRODUCTION' | 'OUTGOING' | 'RETURN'
  notes: string
  images?: string[]
}

interface QualityMetric {
  title: string
  value: string
  change: string
  trend: 'up' | 'down' | 'neutral'
  icon: React.ElementType
}

export default function OperationsQualityPage() {
  const { data: session } = useSession()
  const [qualityChecks, setQualityChecks] = useState<QualityCheck[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('ALL')
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL')

  const mockQualityChecks: QualityCheck[] = [
    {
      id: '1',
      checkId: 'QC-001',
      productName: 'Executive Office Chair',
      sku: 'EOC-001',
      inspector: 'John Smith',
      checkDate: '2024-01-10T14:30:00Z',
      status: 'PASSED',
      score: 92,
      defects: 0,
      category: 'INCOMING',
      notes: 'All quality standards met. Minor cosmetic imperfection within tolerance.'
    },
    {
      id: '2',
      checkId: 'QC-002',
      productName: 'Standing Desk Converter',
      sku: 'SDC-002',
      inspector: 'Sarah Johnson',
      checkDate: '2024-01-10T11:15:00Z',
      status: 'FAILED',
      score: 65,
      defects: 3,
      category: 'PRODUCTION',
      notes: 'Height adjustment mechanism defective. Requires rework before release.'
    },
    {
      id: '3',
      checkId: 'QC-003',
      productName: 'Conference Table - 8 Seater',
      sku: 'CT-003',
      inspector: 'Mike Wilson',
      checkDate: '2024-01-10T09:45:00Z',
      status: 'CONDITIONAL',
      score: 78,
      defects: 1,
      category: 'OUTGOING',
      notes: 'Minor surface scratch identified. Customer notified and accepted.'
    },
    {
      id: '4',
      checkId: 'QC-004',
      productName: 'Storage Cabinet',
      sku: 'SC-004',
      inspector: 'Lisa Chen',
      checkDate: '2024-01-09T16:20:00Z',
      status: 'PENDING',
      score: 0,
      defects: 0,
      category: 'RETURN',
      notes: 'Customer return inspection scheduled. Awaiting detailed assessment.'
    },
    {
      id: '5',
      checkId: 'QC-005',
      productName: 'Visitor Chair',
      sku: 'VC-005',
      inspector: 'David Brown',
      checkDate: '2024-01-09T13:30:00Z',
      status: 'PASSED',
      score: 95,
      defects: 0,
      category: 'INCOMING',
      notes: 'Excellent quality. Exceeds all requirements.'
    }
  ]

  const qualityMetrics: QualityMetric[] = [
    {
      title: 'Pass Rate',
      value: '89.4%',
      change: '+2.1%',
      trend: 'up',
      icon: CheckCircle
    },
    {
      title: 'Avg. Quality Score',
      value: '86.2',
      change: '+1.8',
      trend: 'up',
      icon: Star
    },
    {
      title: 'Active Inspectors',
      value: '12',
      change: '+2',
      trend: 'up',
      icon: Users
    },
    {
      title: 'Checks Today',
      value: '47',
      change: '+8',
      trend: 'up',
      icon: ClipboardList
    }
  ]

  useEffect(() => {
    setTimeout(() => {
      setQualityChecks(mockQualityChecks)
      setLoading(false)
    }, 1000)
  }, [])

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PASSED':
        return <Badge variant="secondary" className="bg-green-100 text-green-800">Passed</Badge>
      case 'FAILED':
        return <Badge variant="destructive">Failed</Badge>
      case 'CONDITIONAL':
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">Conditional</Badge>
      case 'PENDING':
        return <Badge variant="secondary" className="bg-gray-100 text-gray-800">Pending</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PASSED':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'FAILED':
        return <XCircle className="h-4 w-4 text-red-500" />
      case 'CONDITIONAL':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />
      case 'PENDING':
        return <Clock className="h-4 w-4 text-gray-500" />
      default:
        return <ClipboardList className="h-4 w-4" />
    }
  }

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600'
    if (score >= 80) return 'text-yellow-600'
    if (score >= 70) return 'text-orange-600'
    return 'text-red-600'
  }

  const filteredChecks = qualityChecks.filter(check => {
    const matchesSearch = check.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         check.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         check.inspector.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'ALL' || check.status === statusFilter
    const matchesCategory = categoryFilter === 'ALL' || check.category === categoryFilter
    return matchesSearch && matchesStatus && matchesCategory
  })

  if (loading) {
    return <div className="flex items-center justify-center h-96">Loading quality checks...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Quality Control</h1>
          <p className="text-muted-foreground">Monitor product quality, inspections, and compliance standards</p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline">
            <RefreshCcw className="h-4 w-4 mr-2" />
            Refresh Data
          </Button>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            New Inspection
          </Button>
        </div>
      </div>

      {/* Metrics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {qualityMetrics.map((metric, index) => {
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
                  {metric.change} from last week
                </p>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <Tabs defaultValue="inspections" className="space-y-4">
        <TabsList>
          <TabsTrigger value="inspections">Quality Inspections</TabsTrigger>
          <TabsTrigger value="standards">Quality Standards</TabsTrigger>
          <TabsTrigger value="reports">Quality Reports</TabsTrigger>
          <TabsTrigger value="certifications">Certifications</TabsTrigger>
        </TabsList>

        <TabsContent value="inspections" className="space-y-4">
          {/* Filters */}
          <Card>
            <CardHeader>
              <CardTitle>Filter Inspections</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <Label htmlFor="search">Search Inspections</Label>
                  <div className="relative">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="search"
                      placeholder="Search by product, SKU, or inspector..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-8"
                    />
                  </div>
                </div>
                
                <div className="min-w-[150px]">
                  <Label>Status</Label>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="All Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ALL">All Status</SelectItem>
                      <SelectItem value="PASSED">Passed</SelectItem>
                      <SelectItem value="FAILED">Failed</SelectItem>
                      <SelectItem value="CONDITIONAL">Conditional</SelectItem>
                      <SelectItem value="PENDING">Pending</SelectItem>
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
                      <SelectItem value="INCOMING">Incoming</SelectItem>
                      <SelectItem value="PRODUCTION">Production</SelectItem>
                      <SelectItem value="OUTGOING">Outgoing</SelectItem>
                      <SelectItem value="RETURN">Return</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quality Checks Table */}
          <Card>
            <CardHeader>
              <CardTitle>Quality Inspections ({filteredChecks.length})</CardTitle>
              <CardDescription>
                Track quality control inspections and compliance checks
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Check ID</TableHead>
                      <TableHead>Product</TableHead>
                      <TableHead>Inspector</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Score</TableHead>
                      <TableHead>Defects</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredChecks.map((check) => (
                      <TableRow key={check.id}>
                        <TableCell className="font-mono text-sm">
                          {check.checkId}
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">{check.productName}</div>
                            <div className="text-sm text-muted-foreground">{check.sku}</div>
                          </div>
                        </TableCell>
                        <TableCell>{check.inspector}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{check.category}</Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            {getStatusIcon(check.status)}
                            {getStatusBadge(check.status)}
                          </div>
                        </TableCell>
                        <TableCell>
                          {check.score > 0 ? (
                            <div className={`font-bold ${getScoreColor(check.score)}`}>
                              {check.score}/100
                            </div>
                          ) : (
                            <span className="text-gray-400">Pending</span>
                          )}
                        </TableCell>
                        <TableCell>
                          {check.defects > 0 ? (
                            <Badge variant="destructive">{check.defects}</Badge>
                          ) : (
                            <Badge variant="secondary" className="bg-green-100 text-green-800">0</Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          {new Date(check.checkDate).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <div className="flex space-x-1">
                            <Button variant="outline" size="sm">
                              <Eye className="h-3 w-3" />
                            </Button>
                            <Button variant="outline" size="sm">
                              <Edit className="h-3 w-3" />
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

        <TabsContent value="standards" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Quality Standards</CardTitle>
              <CardDescription>
                Define and manage quality control standards and criteria
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <Shield className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">Quality Standards</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Quality standards and criteria management interface.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reports" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Quality Reports</CardTitle>
              <CardDescription>
                Generate quality control reports and analytics
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <FileText className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">Quality Reports</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Comprehensive quality reporting and analytics dashboard.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="certifications" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Certifications & Compliance</CardTitle>
              <CardDescription>
                Manage quality certifications and compliance requirements
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <Award className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">Certifications</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Quality certifications and compliance tracking system.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
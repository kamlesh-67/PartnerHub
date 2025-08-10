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
  Package, 
  Search, 
  Filter, 
  Plus,
  Edit,
  Trash2,
  Eye,
  CheckCircle,
  XCircle,
  AlertTriangle,
  BarChart3,
  TrendingUp,
  DollarSign,
  RefreshCcw
} from 'lucide-react'

interface Product {
  id: string
  name: string
  sku: string
  category: string
  brand: string
  price: number
  cost: number
  margin: number
  stock: number
  status: 'ACTIVE' | 'INACTIVE' | 'DISCONTINUED'
  lastUpdated: string
  supplier: string
  description: string
}

interface ProductMetric {
  title: string
  value: string
  change: string
  trend: 'up' | 'down' | 'neutral'
  icon: React.ElementType
}

export default function OperationsProductsPage() {
  const { data: session } = useSession()
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL')
  const [statusFilter, setStatusFilter] = useState<string>('ALL')

  const mockProducts: Product[] = [
    {
      id: '1',
      name: 'Executive Office Chair',
      sku: 'EOC-001',
      category: 'Seating',
      brand: 'ErgoMax',
      price: 299.99,
      cost: 180.00,
      margin: 40.0,
      stock: 45,
      status: 'ACTIVE',
      lastUpdated: '2024-01-10T14:30:00Z',
      supplier: 'Furniture Plus Inc.',
      description: 'High-quality executive chair with lumbar support'
    },
    {
      id: '2',
      name: 'Standing Desk Converter',
      sku: 'SDC-002',
      category: 'Desks',
      brand: 'FlexiDesk',
      price: 199.99,
      cost: 120.00,
      margin: 40.0,
      stock: 23,
      status: 'ACTIVE',
      lastUpdated: '2024-01-10T12:15:00Z',
      supplier: 'Office Solutions Ltd.',
      description: 'Adjustable standing desk converter'
    },
    {
      id: '3',
      name: 'Conference Table - 8 Seater',
      sku: 'CT-003',
      category: 'Tables',
      brand: 'MeetMax',
      price: 899.99,
      cost: 540.00,
      margin: 40.0,
      stock: 8,
      status: 'ACTIVE',
      lastUpdated: '2024-01-10T11:45:00Z',
      supplier: 'Corporate Furniture Co.',
      description: 'Premium conference table for 8 people'
    },
    {
      id: '4',
      name: 'Storage Cabinet',
      sku: 'SC-004',
      category: 'Storage',
      brand: 'SecureStore',
      price: 149.99,
      cost: 90.00,
      margin: 40.0,
      stock: 0,
      status: 'INACTIVE',
      lastUpdated: '2024-01-09T16:20:00Z',
      supplier: 'Storage Solutions Inc.',
      description: 'Lockable office storage cabinet'
    },
    {
      id: '5',
      name: 'Visitor Chair',
      sku: 'VC-005',
      category: 'Seating',
      brand: 'ComfortMax',
      price: 79.99,
      cost: 45.00,
      margin: 43.8,
      stock: 62,
      status: 'ACTIVE',
      lastUpdated: '2024-01-09T14:30:00Z',
      supplier: 'Furniture Plus Inc.',
      description: 'Comfortable visitor chair with armrests'
    }
  ]

  const productMetrics: ProductMetric[] = [
    {
      title: 'Total Products',
      value: '1,247',
      change: '+23',
      trend: 'up',
      icon: Package
    },
    {
      title: 'Active Products',
      value: '1,189',
      change: '+15',
      trend: 'up',
      icon: CheckCircle
    },
    {
      title: 'Low Stock Items',
      value: '34',
      change: '+8',
      trend: 'up',
      icon: AlertTriangle
    },
    {
      title: 'Avg. Margin',
      value: '42.3%',
      change: '+1.2%',
      trend: 'up',
      icon: TrendingUp
    }
  ]

  useEffect(() => {
    setTimeout(() => {
      setProducts(mockProducts)
      setLoading(false)
    }, 1000)
  }, [])

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return <Badge variant="secondary" className="bg-green-100 text-green-800">Active</Badge>
      case 'INACTIVE':
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">Inactive</Badge>
      case 'DISCONTINUED':
        return <Badge variant="destructive">Discontinued</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  const getStockBadge = (stock: number) => {
    if (stock === 0) {
      return <Badge variant="destructive">Out of Stock</Badge>
    } else if (stock < 10) {
      return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">Low Stock</Badge>
    } else {
      return <Badge variant="secondary" className="bg-green-100 text-green-800">In Stock</Badge>
    }
  }

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.brand.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = categoryFilter === 'ALL' || product.category === categoryFilter
    const matchesStatus = statusFilter === 'ALL' || product.status === statusFilter
    return matchesSearch && matchesCategory && matchesStatus
  })

  if (loading) {
    return <div className="flex items-center justify-center h-96">Loading products...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Product Catalog Operations</h1>
          <p className="text-muted-foreground">Manage product inventory, pricing, and catalog operations</p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline">
            <RefreshCcw className="h-4 w-4 mr-2" />
            Sync Catalog
          </Button>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Add Product
          </Button>
        </div>
      </div>

      {/* Metrics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {productMetrics.map((metric, index) => {
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

      <Tabs defaultValue="products" className="space-y-4">
        <TabsList>
          <TabsTrigger value="products">Product Catalog</TabsTrigger>
          <TabsTrigger value="categories">Categories</TabsTrigger>
          <TabsTrigger value="suppliers">Suppliers</TabsTrigger>
          <TabsTrigger value="pricing">Pricing Rules</TabsTrigger>
        </TabsList>

        <TabsContent value="products" className="space-y-4">
          {/* Filters */}
          <Card>
            <CardHeader>
              <CardTitle>Filter Products</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <Label htmlFor="search">Search Products</Label>
                  <div className="relative">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="search"
                      placeholder="Search by name, SKU, or brand..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-8"
                    />
                  </div>
                </div>
                
                <div className="min-w-[150px]">
                  <Label>Category</Label>
                  <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="All Categories" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ALL">All Categories</SelectItem>
                      <SelectItem value="Seating">Seating</SelectItem>
                      <SelectItem value="Desks">Desks</SelectItem>
                      <SelectItem value="Tables">Tables</SelectItem>
                      <SelectItem value="Storage">Storage</SelectItem>
                      <SelectItem value="Accessories">Accessories</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="min-w-[150px]">
                  <Label>Status</Label>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="All Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ALL">All Status</SelectItem>
                      <SelectItem value="ACTIVE">Active</SelectItem>
                      <SelectItem value="INACTIVE">Inactive</SelectItem>
                      <SelectItem value="DISCONTINUED">Discontinued</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Products Table */}
          <Card>
            <CardHeader>
              <CardTitle>Products ({filteredProducts.length})</CardTitle>
              <CardDescription>
                Manage product catalog with pricing, inventory, and operations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Product</TableHead>
                      <TableHead>SKU</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead>Margin</TableHead>
                      <TableHead>Stock</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Supplier</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredProducts.map((product) => (
                      <TableRow key={product.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{product.name}</div>
                            <div className="text-sm text-muted-foreground">{product.brand}</div>
                          </div>
                        </TableCell>
                        <TableCell className="font-mono text-sm">{product.sku}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{product.category}</Badge>
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">${product.price}</div>
                            <div className="text-xs text-muted-foreground">Cost: ${product.cost}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-green-600 font-medium">{product.margin}%</div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <div className="font-medium">{product.stock}</div>
                            {getStockBadge(product.stock)}
                          </div>
                        </TableCell>
                        <TableCell>{getStatusBadge(product.status)}</TableCell>
                        <TableCell className="text-sm">{product.supplier}</TableCell>
                        <TableCell>
                          <div className="flex space-x-1">
                            <Button variant="outline" size="sm">
                              <Eye className="h-3 w-3" />
                            </Button>
                            <Button variant="outline" size="sm">
                              <Edit className="h-3 w-3" />
                            </Button>
                            <Button variant="outline" size="sm">
                              <BarChart3 className="h-3 w-3" />
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

        <TabsContent value="categories" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Product Categories</CardTitle>
              <CardDescription>
                Manage product categories and hierarchies
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <Package className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">Category Management</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Product category management interface coming soon.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="suppliers" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Supplier Management</CardTitle>
              <CardDescription>
                Manage product suppliers and vendor relationships
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <Package className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">Supplier Management</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Supplier management interface coming soon.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="pricing" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Pricing Rules</CardTitle>
              <CardDescription>
                Configure automated pricing rules and margin controls
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <DollarSign className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">Pricing Management</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Automated pricing rules interface coming soon.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
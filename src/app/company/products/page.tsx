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
  Heart,
  ShoppingCart,
  Eye,
  Star,
  TrendingUp,
  DollarSign,
  Target,
  Award,
  RefreshCcw,
  Download,
  BarChart3
} from 'lucide-react'

interface CompanyProduct {
  id: string
  name: string
  sku: string
  category: string
  brand: string
  price: number
  companyPrice: number
  discount: number
  lastOrdered?: string
  totalOrdered: number
  inWishlist: boolean
  rating: number
  availability: 'IN_STOCK' | 'LOW_STOCK' | 'OUT_OF_STOCK'
  description: string
  supplier: string
}

interface ProductMetric {
  title: string
  value: string
  change: string
  trend: 'up' | 'down' | 'neutral'
  icon: React.ElementType
}

export default function CompanyProductsPage() {
  const { data: session } = useSession()
  const [products, setProducts] = useState<CompanyProduct[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL')
  const [availabilityFilter, setAvailabilityFilter] = useState<string>('ALL')

  const mockProducts: CompanyProduct[] = [
    {
      id: '1',
      name: 'Executive Office Chair',
      sku: 'EOC-001',
      category: 'Seating',
      brand: 'ErgoMax',
      price: 399.99,
      companyPrice: 299.99,
      discount: 25,
      lastOrdered: '2024-01-05T10:00:00Z',
      totalOrdered: 45,
      inWishlist: true,
      rating: 4.8,
      availability: 'IN_STOCK',
      description: 'Premium executive chair with advanced lumbar support and adjustable features',
      supplier: 'Furniture Plus Inc.'
    },
    {
      id: '2',
      name: 'Standing Desk Converter',
      sku: 'SDC-002',
      category: 'Desks',
      brand: 'FlexiDesk',
      price: 249.99,
      companyPrice: 199.99,
      discount: 20,
      lastOrdered: '2024-01-08T14:30:00Z',
      totalOrdered: 32,
      inWishlist: false,
      rating: 4.6,
      availability: 'LOW_STOCK',
      description: 'Height-adjustable standing desk converter with keyboard tray',
      supplier: 'Office Solutions Ltd.'
    },
    {
      id: '3',
      name: 'Conference Table - 8 Seater',
      sku: 'CT-003',
      category: 'Tables',
      brand: 'MeetMax',
      price: 1199.99,
      companyPrice: 899.99,
      discount: 25,
      lastOrdered: '2023-12-20T09:15:00Z',
      totalOrdered: 12,
      inWishlist: true,
      rating: 4.9,
      availability: 'IN_STOCK',
      description: 'Premium conference table with cable management and modern design',
      supplier: 'Corporate Furniture Co.'
    },
    {
      id: '4',
      name: 'Storage Cabinet',
      sku: 'SC-004',
      category: 'Storage',
      brand: 'SecureStore',
      price: 199.99,
      companyPrice: 149.99,
      discount: 25,
      totalOrdered: 28,
      inWishlist: false,
      rating: 4.4,
      availability: 'OUT_OF_STOCK',
      description: 'Lockable office storage cabinet with adjustable shelves',
      supplier: 'Storage Solutions Inc.'
    },
    {
      id: '5',
      name: 'Visitor Chair',
      sku: 'VC-005',
      category: 'Seating',
      brand: 'ComfortMax',
      price: 99.99,
      companyPrice: 79.99,
      discount: 20,
      lastOrdered: '2024-01-10T11:45:00Z',
      totalOrdered: 67,
      inWishlist: true,
      rating: 4.5,
      availability: 'IN_STOCK',
      description: 'Comfortable visitor chair with padded armrests',
      supplier: 'Furniture Plus Inc.'
    }
  ]

  const productMetrics: ProductMetric[] = [
    {
      title: 'Available Products',
      value: '1,247',
      change: '+23',
      trend: 'up',
      icon: Package
    },
    {
      title: 'Avg. Discount',
      value: '22.5%',
      change: '+1.2%',
      trend: 'up',
      icon: Award
    },
    {
      title: 'Cost Savings',
      value: '$8,245',
      change: '+15.3%',
      trend: 'up',
      icon: DollarSign
    },
    {
      title: 'Wishlist Items',
      value: '89',
      change: '+12',
      trend: 'up',
      icon: Heart
    }
  ]

  useEffect(() => {
    setTimeout(() => {
      setProducts(mockProducts)
      setLoading(false)
    }, 1000)
  }, [])

  const getAvailabilityBadge = (availability: string) => {
    switch (availability) {
      case 'IN_STOCK':
        return <Badge variant="secondary" className="bg-green-100 text-green-800">In Stock</Badge>
      case 'LOW_STOCK':
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">Low Stock</Badge>
      case 'OUT_OF_STOCK':
        return <Badge variant="destructive">Out of Stock</Badge>
      default:
        return <Badge variant="secondary">{availability}</Badge>
    }
  }

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-4 w-4 ${star <= rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
          />
        ))}
        <span className="text-sm text-muted-foreground ml-1">({rating})</span>
      </div>
    )
  }

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.brand.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = categoryFilter === 'ALL' || product.category === categoryFilter
    const matchesAvailability = availabilityFilter === 'ALL' || product.availability === availabilityFilter
    return matchesSearch && matchesCategory && matchesAvailability
  })

  if (loading) {
    return <div className="flex items-center justify-center h-96">Loading products...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Company Products</h1>
          <p className="text-muted-foreground">Browse and manage your company's product catalog with special pricing</p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline">
            <RefreshCcw className="h-4 w-4 mr-2" />
            Refresh Catalog
          </Button>
          <Button>
            <Download className="h-4 w-4 mr-2" />
            Export List
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

      <Tabs defaultValue="catalog" className="space-y-4">
        <TabsList>
          <TabsTrigger value="catalog">Product Catalog</TabsTrigger>
          <TabsTrigger value="frequently-ordered">Frequently Ordered</TabsTrigger>
          <TabsTrigger value="wishlist">Wishlist</TabsTrigger>
          <TabsTrigger value="analytics">Product Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="catalog" className="space-y-4">
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
                  <Label>Availability</Label>
                  <Select value={availabilityFilter} onValueChange={setAvailabilityFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="All Stock" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ALL">All Stock</SelectItem>
                      <SelectItem value="IN_STOCK">In Stock</SelectItem>
                      <SelectItem value="LOW_STOCK">Low Stock</SelectItem>
                      <SelectItem value="OUT_OF_STOCK">Out of Stock</SelectItem>
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
                Your company's negotiated product catalog with special pricing
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Product</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Pricing</TableHead>
                      <TableHead>Rating</TableHead>
                      <TableHead>Availability</TableHead>
                      <TableHead>Last Ordered</TableHead>
                      <TableHead>Total Orders</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredProducts.map((product) => (
                      <TableRow key={product.id}>
                        <TableCell>
                          <div className="flex items-center space-x-3">
                            <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                              <Package className="h-6 w-6 text-gray-500" />
                            </div>
                            <div>
                              <div className="font-medium">{product.name}</div>
                              <div className="text-sm text-muted-foreground">{product.brand} • {product.sku}</div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{product.category}</Badge>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <div className="flex items-center space-x-2">
                              <span className="font-bold text-green-600">${product.companyPrice}</span>
                              <Badge variant="secondary" className="bg-green-100 text-green-800">
                                -{product.discount}%
                              </Badge>
                            </div>
                            <div className="text-sm text-muted-foreground line-through">
                              Regular: ${product.price}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>{renderStars(product.rating)}</TableCell>
                        <TableCell>{getAvailabilityBadge(product.availability)}</TableCell>
                        <TableCell>
                          {product.lastOrdered ? (
                            new Date(product.lastOrdered).toLocaleDateString()
                          ) : (
                            <span className="text-gray-400">Never</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="font-medium">{product.totalOrdered}</div>
                        </TableCell>
                        <TableCell>
                          <div className="flex space-x-1">
                            <Button variant="outline" size="sm">
                              <Eye className="h-3 w-3" />
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm"
                              className={product.inWishlist ? 'text-red-500' : ''}
                            >
                              <Heart className={`h-3 w-3 ${product.inWishlist ? 'fill-current' : ''}`} />
                            </Button>
                            <Button variant="outline" size="sm" disabled={product.availability === 'OUT_OF_STOCK'}>
                              <ShoppingCart className="h-3 w-3" />
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

        <TabsContent value="frequently-ordered" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Frequently Ordered Products</CardTitle>
              <CardDescription>
                Products most commonly ordered by your company
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <Target className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">Ordering Patterns</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Analyze your company's most frequently ordered products.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="wishlist" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Company Wishlist</CardTitle>
              <CardDescription>
                Products saved for future orders by team members
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <Heart className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">Wishlist Management</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Manage products saved by your team members.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Product Analytics</CardTitle>
              <CardDescription>
                Insights and trends for your company's product usage
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <BarChart3 className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">Product Insights</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Analytics on product performance and usage patterns.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
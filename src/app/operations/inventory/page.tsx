'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { 
  Package,
  Search, 
  Filter,
  AlertTriangle,
  TrendingDown,
  TrendingUp,
  Plus,
  Minus,
  Edit,
  BarChart3,
  RefreshCw,
  Download,
  Archive,
  CheckCircle,
  XCircle
} from 'lucide-react'
import { type UserRole } from '@/lib/permissions'

interface Product {
  id: string
  name: string
  sku: string
  price: number
  stock: number
  minStock: number
  status: 'ACTIVE' | 'INACTIVE' | 'OUT_OF_STOCK'
  category: {
    name: string
  }
  inventoryTransactions: {
    id: string
    type: 'in' | 'out' | 'adjustment'
    quantity: number
    reason: string
    createdAt: string
  }[]
}

interface InventoryTransaction {
  id: string
  type: 'in' | 'out' | 'adjustment'
  quantity: number
  reason: string
  reference?: string
  product: {
    name: string
    sku: string
  }
  user: {
    name: string
  }
  createdAt: string
}

export default function OperationsInventoryPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [products, setProducts] = useState<Product[]>([])
  const [transactions, setTransactions] = useState<InventoryTransaction[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [stockFilter, setStockFilter] = useState<string>('all')
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [showAdjustmentDialog, setShowAdjustmentDialog] = useState(false)
  const [adjustmentData, setAdjustmentData] = useState({
    type: 'adjustment' as 'in' | 'out' | 'adjustment',
    quantity: 0,
    reason: ''
  })

  const userRole = session?.user?.role as UserRole

  useEffect(() => {
    if (status === 'loading') return

    if (!session) {
      router.push('/auth/signin')
      return
    }

    if (userRole !== 'OPERATION' && userRole !== 'SUPER_ADMIN') {
      router.push('/unauthorized')
      return
    }

    fetchInventory()
    fetchTransactions()
  }, [session, status, userRole, router])

  const fetchInventory = async () => {
    try {
      const response = await fetch('/api/operations/inventory')
      if (response.ok) {
        const data = await response.json()
        setProducts(data.products)
      }
    } catch (error) {
      console.error('Failed to fetch inventory:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchTransactions = async () => {
    try {
      const response = await fetch('/api/operations/inventory/transactions')
      if (response.ok) {
        const data = await response.json()
        setTransactions(data.transactions)
      }
    } catch (error) {
      console.error('Failed to fetch transactions:', error)
    }
  }

  const handleStockAdjustment = async () => {
    if (!selectedProduct || adjustmentData.quantity === 0) return

    try {
      const response = await fetch('/api/operations/inventory/adjust', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: selectedProduct.id,
          type: adjustmentData.type,
          quantity: Math.abs(adjustmentData.quantity),
          reason: adjustmentData.reason
        })
      })

      if (response.ok) {
        fetchInventory()
        fetchTransactions()
        setShowAdjustmentDialog(false)
        setAdjustmentData({ type: 'adjustment', quantity: 0, reason: '' })
      }
    } catch (error) {
      console.error('Failed to adjust stock:', error)
    }
  }

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.sku.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesCategory = selectedCategory === 'all' || product.category.name === selectedCategory

    let matchesStock = true
    if (stockFilter === 'low') {
      matchesStock = product.stock <= product.minStock
    } else if (stockFilter === 'out') {
      matchesStock = product.stock === 0
    } else if (stockFilter === 'overstock') {
      matchesStock = product.stock > product.minStock * 3
    }

    return matchesSearch && matchesCategory && matchesStock
  })

  const getStockStatus = (product: Product) => {
    if (product.stock === 0) return { status: 'out', color: 'bg-red-100 text-red-800', label: 'Out of Stock' }
    if (product.stock <= product.minStock) return { status: 'low', color: 'bg-yellow-100 text-yellow-800', label: 'Low Stock' }
    if (product.stock > product.minStock * 3) return { status: 'overstock', color: 'bg-blue-100 text-blue-800', label: 'Overstock' }
    return { status: 'normal', color: 'bg-green-100 text-green-800', label: 'Normal' }
  }

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'in': return TrendingUp
      case 'out': return TrendingDown
      case 'adjustment': return Edit
      default: return Package
    }
  }

  const getTransactionColor = (type: string) => {
    switch (type) {
      case 'in': return 'text-green-600'
      case 'out': return 'text-red-600'
      case 'adjustment': return 'text-blue-600'
      default: return 'text-gray-600'
    }
  }

  if (status === 'loading' || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  if (!session || (userRole !== 'OPERATION' && userRole !== 'SUPER_ADMIN')) {
    return null
  }

  const categories = [...new Set(products.map(p => p.category.name))]

  return (
    <div className="flex-1 space-y-6 p-8 pt-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Inventory Management</h2>
          <p className="text-muted-foreground">
            Monitor stock levels, track movements, and manage inventory
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
            {filteredProducts.length} products
          </Badge>
          <Button variant="outline" onClick={() => { fetchInventory(); fetchTransactions(); }}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Inventory Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Products</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{products.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Out of Stock</CardTitle>
            <XCircle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {products.filter(p => p.stock === 0).length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Low Stock</CardTitle>
            <AlertTriangle className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {products.filter(p => p.stock > 0 && p.stock <= p.minStock).length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Normal Stock</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {products.filter(p => p.stock > p.minStock && p.stock <= p.minStock * 3).length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overstock</CardTitle>
            <TrendingUp className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {products.filter(p => p.stock > p.minStock * 3).length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Label htmlFor="search">Search Products</Label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder="Product name, SKU..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="category">Category</Label>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger id="category">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="stock">Stock Level</Label>
              <Select value={stockFilter} onValueChange={setStockFilter}>
                <SelectTrigger id="stock">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Levels</SelectItem>
                  <SelectItem value="out">Out of Stock</SelectItem>
                  <SelectItem value="low">Low Stock</SelectItem>
                  <SelectItem value="overstock">Overstock</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-end">
              <Button variant="outline" onClick={() => {
                setSearchTerm('')
                setSelectedCategory('all')
                setStockFilter('all')
              }}>
                <Filter className="mr-2 h-4 w-4" />
                Clear Filters
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Products Table */}
      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Product Inventory</CardTitle>
            <CardDescription>
              Current stock levels and product information
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Current Stock</TableHead>
                  <TableHead>Min Stock</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProducts.map((product) => {
                  const stockInfo = getStockStatus(product)
                  return (
                    <TableRow key={product.id} className={stockInfo.status === 'out' ? 'bg-red-50' : stockInfo.status === 'low' ? 'bg-yellow-50' : ''}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{product.name}</div>
                          <div className="text-sm text-muted-foreground">
                            SKU: {product.sku}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            ${product.price.toFixed(2)}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{product.category.name}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="text-lg font-semibold">
                          {product.stock}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm text-muted-foreground">
                          {product.minStock}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={stockInfo.color}>
                          {stockInfo.label}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedProduct(product)
                            setShowAdjustmentDialog(true)
                          }}
                        >
                          <Edit className="mr-1 h-3 w-3" />
                          Adjust
                        </Button>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>

            {filteredProducts.length === 0 && (
              <div className="text-center py-8">
                <Package className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No products found</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Try adjusting your search filters.
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Transactions */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Movements</CardTitle>
            <CardDescription>
              Latest inventory transactions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {transactions.slice(0, 10).map((transaction) => {
                const Icon = getTransactionIcon(transaction.type)
                const colorClass = getTransactionColor(transaction.type)
                return (
                  <div key={transaction.id} className="flex items-center space-x-3 text-sm">
                    <Icon className={`h-4 w-4 ${colorClass}`} />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{transaction.product.name}</p>
                      <p className="text-muted-foreground">
                        {transaction.type === 'in' ? '+' : transaction.type === 'out' ? '-' : '±'}
                        {transaction.quantity} units
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {transaction.reason} • {new Date(transaction.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                )
              })}
              
              {transactions.length === 0 && (
                <div className="text-center py-4 text-muted-foreground">
                  <BarChart3 className="mx-auto h-8 w-8 mb-2" />
                  <p className="text-sm">No recent transactions</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Stock Adjustment Dialog */}
      <Dialog open={showAdjustmentDialog} onOpenChange={setShowAdjustmentDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Adjust Stock Level</DialogTitle>
            <DialogDescription>
              {selectedProduct?.name} (SKU: {selectedProduct?.sku})
              <br />
              Current Stock: {selectedProduct?.stock} units
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="adjustmentType">Transaction Type</Label>
              <Select
                value={adjustmentData.type}
                onValueChange={(value: 'in' | 'out' | 'adjustment') => 
                  setAdjustmentData({ ...adjustmentData, type: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="in">Stock In (Add)</SelectItem>
                  <SelectItem value="out">Stock Out (Remove)</SelectItem>
                  <SelectItem value="adjustment">Stock Adjustment</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="quantity">Quantity</Label>
              <Input
                id="quantity"
                type="number"
                min="1"
                value={adjustmentData.quantity || ''}
                onChange={(e) => setAdjustmentData({
                  ...adjustmentData,
                  quantity: parseInt(e.target.value) || 0
                })}
                placeholder="Enter quantity"
              />
            </div>

            <div>
              <Label htmlFor="reason">Reason</Label>
              <Select
                value={adjustmentData.reason}
                onValueChange={(value) => setAdjustmentData({ ...adjustmentData, reason: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select reason" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="purchase">New Purchase</SelectItem>
                  <SelectItem value="sale">Sale/Order</SelectItem>
                  <SelectItem value="damage">Damaged Items</SelectItem>
                  <SelectItem value="return">Customer Return</SelectItem>
                  <SelectItem value="theft">Theft/Loss</SelectItem>
                  <SelectItem value="correction">Stock Count Correction</SelectItem>
                  <SelectItem value="promotion">Promotional Use</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {selectedProduct && (
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-sm">
                  <span className="font-medium">Current Stock:</span> {selectedProduct.stock} units
                </p>
                <p className="text-sm">
                  <span className="font-medium">After Adjustment:</span> {
                    adjustmentData.type === 'in' 
                      ? selectedProduct.stock + (adjustmentData.quantity || 0)
                      : adjustmentData.type === 'out'
                      ? Math.max(0, selectedProduct.stock - (adjustmentData.quantity || 0))
                      : adjustmentData.quantity || selectedProduct.stock
                  } units
                </p>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowAdjustmentDialog(false)
                setAdjustmentData({ type: 'adjustment', quantity: 0, reason: '' })
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleStockAdjustment}
              disabled={!adjustmentData.quantity || !adjustmentData.reason}
            >
              Apply Adjustment
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
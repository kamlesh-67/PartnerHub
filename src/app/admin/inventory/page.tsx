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
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Package, 
  TrendingDown, 
  TrendingUp, 
  AlertTriangle, 
  Plus, 
  Minus, 
  Edit, 
  Search,
  Download,
  Archive,
  RefreshCcw,
  BarChart3,
  Filter
} from 'lucide-react'

interface InventoryItem {
  id: string
  productId: string
  productName: string
  sku: string
  category: string
  currentStock: number
  minStock: number
  maxStock: number
  reorderPoint: number
  unitCost: number
  totalValue: number
  location: string
  supplier: string
  lastUpdated: string
  status: 'IN_STOCK' | 'LOW_STOCK' | 'OUT_OF_STOCK' | 'OVERSTOCK'
}

export default function AdminInventoryPage() {
  const { data: session } = useSession()
  const [inventory, setInventory] = useState<InventoryItem[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('ALL')
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL')

  // Mock data - replace with real API call
  const mockInventory: InventoryItem[] = [
    {
      id: '1',
      productId: 'PROD-001',
      productName: 'Performance Sports Jersey',
      sku: 'JERSEY-001',
      category: 'Sportswear',
      currentStock: 75,
      minStock: 10,
      maxStock: 200,
      reorderPoint: 25,
      unitCost: 25.00,
      totalValue: 1875.00,
      location: 'Warehouse A-1',
      supplier: 'SportsCorp Inc.',
      lastUpdated: '2024-01-10T10:30:00Z',
      status: 'IN_STOCK'
    },
    {
      id: '2',
      productId: 'PROD-002',
      productName: 'Athletic Running Shoes',
      sku: 'SHOES-001',
      category: 'Footwear',
      currentStock: 5,
      minStock: 15,
      maxStock: 100,
      reorderPoint: 20,
      unitCost: 45.00,
      totalValue: 225.00,
      location: 'Warehouse B-2',
      supplier: 'Footwear Solutions',
      lastUpdated: '2024-01-09T15:45:00Z',
      status: 'LOW_STOCK'
    },
    {
      id: '3',
      productId: 'PROD-003',
      productName: 'Luxury Leather Handbag',
      sku: 'BAG-001',
      category: 'Accessories',
      currentStock: 0,
      minStock: 5,
      maxStock: 50,
      reorderPoint: 10,
      unitCost: 85.00,
      totalValue: 0.00,
      location: 'Warehouse C-1',
      supplier: 'Leather Crafts Ltd.',
      lastUpdated: '2024-01-08T09:15:00Z',
      status: 'OUT_OF_STOCK'
    }
  ]

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setInventory(mockInventory)
      setLoading(false)
    }, 1000)
  }, [])

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'IN_STOCK':
        return <Badge variant="secondary" className="bg-green-100 text-green-800">In Stock</Badge>
      case 'LOW_STOCK':
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">Low Stock</Badge>
      case 'OUT_OF_STOCK':
        return <Badge variant="destructive">Out of Stock</Badge>
      case 'OVERSTOCK':
        return <Badge variant="secondary" className="bg-blue-100 text-blue-800">Overstock</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  const getStockIcon = (item: InventoryItem) => {
    if (item.currentStock === 0) {
      return <AlertTriangle className="h-4 w-4 text-red-500" />
    } else if (item.currentStock <= item.reorderPoint) {
      return <TrendingDown className="h-4 w-4 text-yellow-500" />
    } else {
      return <TrendingUp className="h-4 w-4 text-green-500" />
    }
  }

  const filteredInventory = inventory.filter(item => {
    const matchesSearch = item.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.sku.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'ALL' || item.status === statusFilter
    const matchesCategory = categoryFilter === 'ALL' || item.category === categoryFilter
    return matchesSearch && matchesStatus && matchesCategory
  })

  const inventoryStats = {
    totalItems: inventory.length,
    inStock: inventory.filter(item => item.status === 'IN_STOCK').length,
    lowStock: inventory.filter(item => item.status === 'LOW_STOCK').length,
    outOfStock: inventory.filter(item => item.status === 'OUT_OF_STOCK').length,
    totalValue: inventory.reduce((sum, item) => sum + item.totalValue, 0)
  }

  if (loading) {
    return <div className="flex items-center justify-center h-96">Loading inventory...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Inventory Management</h1>
          <p className="text-muted-foreground">Monitor and manage your product inventory</p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button>
            <RefreshCcw className="h-4 w-4 mr-2" />
            Sync Inventory
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Items</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{inventoryStats.totalItems}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">In Stock</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{inventoryStats.inStock}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Low Stock</CardTitle>
            <TrendingDown className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{inventoryStats.lowStock}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Out of Stock</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{inventoryStats.outOfStock}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Value</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${inventoryStats.totalValue.toFixed(2)}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <Label htmlFor="search">Search Products</Label>
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder="Search by name or SKU..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>
            
            <div className="min-w-[200px]">
              <Label>Status</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All Statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Statuses</SelectItem>
                  <SelectItem value="IN_STOCK">In Stock</SelectItem>
                  <SelectItem value="LOW_STOCK">Low Stock</SelectItem>
                  <SelectItem value="OUT_OF_STOCK">Out of Stock</SelectItem>
                  <SelectItem value="OVERSTOCK">Overstock</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="min-w-[200px]">
              <Label>Category</Label>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Categories</SelectItem>
                  <SelectItem value="Sportswear">Sportswear</SelectItem>
                  <SelectItem value="Footwear">Footwear</SelectItem>
                  <SelectItem value="Accessories">Accessories</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Inventory Table */}
      <Card>
        <CardHeader>
          <CardTitle>Inventory Items ({filteredInventory.length})</CardTitle>
          <CardDescription>
            Manage your product inventory levels and stock information
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
                  <TableHead>Current Stock</TableHead>
                  <TableHead>Min/Max</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Value</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredInventory.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        {getStockIcon(item)}
                        <span className="font-medium">{item.productName}</span>
                      </div>
                    </TableCell>
                    <TableCell className="font-mono text-sm">{item.sku}</TableCell>
                    <TableCell>{item.category}</TableCell>
                    <TableCell>
                      <div className="text-center">
                        <div className="font-bold">{item.currentStock}</div>
                        <div className="text-xs text-muted-foreground">units</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-center">
                        <div className="text-sm">{item.minStock} - {item.maxStock}</div>
                        <div className="text-xs text-muted-foreground">Reorder: {item.reorderPoint}</div>
                      </div>
                    </TableCell>
                    <TableCell>{getStatusBadge(item.status)}</TableCell>
                    <TableCell>
                      <div className="text-right">
                        <div className="font-bold">${item.totalValue.toFixed(2)}</div>
                        <div className="text-xs text-muted-foreground">${item.unitCost}/unit</div>
                      </div>
                    </TableCell>
                    <TableCell>{item.location}</TableCell>
                    <TableCell>
                      <div className="flex space-x-1">
                        <Button variant="outline" size="sm">
                          <Edit className="h-3 w-3" />
                        </Button>
                        <Button variant="outline" size="sm">
                          <Plus className="h-3 w-3" />
                        </Button>
                        <Button variant="outline" size="sm">
                          <Minus className="h-3 w-3" />
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
    </div>
  )
}
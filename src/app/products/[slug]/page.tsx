'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useAppDispatch } from '@/lib/store'
import { addToCart } from '@/lib/features/cart/cartSlice'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { 
  ArrowLeft,
  Package,
  Star,
  Truck,
  Shield,
  RotateCcw,
  Heart,
  Share2,
  Eye,
  Info,
  ShoppingCart,
  Plus,
  Minus,
  ChevronLeft,
  ChevronRight
} from 'lucide-react'

interface Product {
  id: string
  name: string
  slug: string
  description?: string
  shortDescription?: string
  sku: string
  price: number
  comparePrice?: number
  stock: number
  status: 'ACTIVE' | 'INACTIVE' | 'OUT_OF_STOCK'
  images?: string[]
  tags?: string[]
  category: {
    id: string
    name: string
    slug: string
  }
}

interface ProductDetailPageProps {
  params: {
    slug: string
  }
}

export default function ProductDetailPage({ params }: ProductDetailPageProps) {
  const { data: session, status } = useSession()
  const router = useRouter()
  const dispatch = useAppDispatch()
  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedImage, setSelectedImage] = useState(0)
  const [quantity, setQuantity] = useState(1)

  // Handle authentication
  useEffect(() => {
    if (status === 'loading') return // Still loading
    
    if (!session) {
      router.push('/auth/signin')
      return
    }
  }, [session, status, router])

  // Fetch product from API
  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true)
      try {
        // Use the specific slug API route
        const response = await fetch(`/api/products/slug/${params.slug}`)
        if (response.ok) {
          const data = await response.json()
          setProduct(data.product || null)
        } else if (response.status === 404) {
          setProduct(null)
        } else {
          console.error('Failed to fetch product:', response.statusText)
          setProduct(null)
        }
      } catch (error) {
        console.error('Error fetching product:', error)
        setProduct(null)
      } finally {
        setLoading(false)
      }
    }

    if (session) {
      fetchProduct()
    }
  }, [params.slug, session])

  const handleAddToCart = () => {
    if (!product) return

    dispatch(addToCart({
      id: product.id,
      productId: product.id,
      name: product.name,
      price: 0, // Price not needed for B2B
      quantity: quantity,
      image: product.images?.[0] || '/placeholder-product.jpg',
      sku: product.sku,
      stock: product.stock
    }))
  }

  const handleQuantityChange = (delta: number) => {
    const newQuantity = quantity + delta
    if (newQuantity >= 1 && newQuantity <= (product?.stock || 0)) {
      setQuantity(newQuantity)
    }
  }

  const handleNextImage = () => {
    if (product?.images && product.images.length > 1) {
      setSelectedImage((prev) => (prev + 1) % product.images.length)
    }
  }

  const handlePrevImage = () => {
    if (product?.images && product.images.length > 1) {
      setSelectedImage((prev) => (prev - 1 + product.images.length) % product.images.length)
    }
  }


  // Show loading state
  if (status === 'loading' || loading) {
    return (
      <div className="container mx-auto py-8">
        <div className="grid md:grid-cols-2 gap-8">
          <div className="space-y-4">
            <div className="aspect-square bg-muted rounded-lg animate-pulse"></div>
            <div className="grid grid-cols-4 gap-2">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="aspect-square bg-muted rounded animate-pulse"></div>
              ))}
            </div>
          </div>
          <div className="space-y-6">
            <div className="h-8 bg-muted rounded animate-pulse"></div>
            <div className="h-4 bg-muted rounded w-1/3 animate-pulse"></div>
            <div className="space-y-2">
              <div className="h-4 bg-muted rounded animate-pulse"></div>
              <div className="h-4 bg-muted rounded animate-pulse"></div>
              <div className="h-4 bg-muted rounded w-3/4 animate-pulse"></div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!session) {
    return null // Will redirect via useEffect
  }

  if (!product) {
    return (
      <div className="container mx-auto py-8 text-center">
        <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
        <h1 className="text-2xl font-bold mb-2">Product Not Found</h1>
        <p className="text-muted-foreground mb-6">The product you're looking for doesn't exist.</p>
        <Button onClick={() => router.push('/products')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Products
        </Button>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8">
      {/* Breadcrumb */}
      <div className="flex items-center space-x-2 text-sm text-muted-foreground mb-6">
        <Button variant="ghost" size="sm" onClick={() => router.push('/products')}>
          <ArrowLeft className="h-4 w-4 mr-1" />
          Products
        </Button>
        <span>/</span>
        <span>{product.category.name}</span>
        <span>/</span>
        <span className="text-foreground">{product.name}</span>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Product Images */}
        <div className="space-y-4">
          <div className="aspect-square bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg flex items-center justify-center relative overflow-hidden">
            {product.images && product.images.length > 0 ? (
              <>
                <img 
                  src={product.images[selectedImage]} 
                  alt={product.name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none'
                    e.currentTarget.nextElementSibling?.classList.remove('hidden')
                  }}
                />
                <Package className="h-24 w-24 text-gray-400 hidden" />
                
                {/* Navigation Buttons */}
                {product.images.length > 1 && (
                  <>
                    <Button
                      variant="secondary"
                      size="icon"
                      className="absolute left-2 top-1/2 transform -translate-y-1/2 opacity-80 hover:opacity-100"
                      onClick={handlePrevImage}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="secondary"
                      size="icon"
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 opacity-80 hover:opacity-100"
                      onClick={handleNextImage}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </>
                )}
              </>
            ) : (
              <Package className="h-24 w-24 text-gray-400" />
            )}
          </div>

          {/* Thumbnail Images */}
          {product.images && product.images.length > 1 && (
            <div className="grid grid-cols-4 gap-2">
              {product.images.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImage(index)}
                  className={`aspect-square bg-gray-100 rounded border-2 transition-colors overflow-hidden ${
                    selectedImage === index ? 'border-primary' : 'border-transparent hover:border-gray-300'
                  }`}
                >
                  <img 
                    src={image} 
                    alt={`${product.name} ${index + 1}`}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none'
                      e.currentTarget.nextElementSibling?.classList.remove('hidden')
                    }}
                  />
                  <Package className="h-8 w-8 text-gray-400 mx-auto hidden" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product Details */}
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold mb-2">{product.name}</h1>
            <p className="text-muted-foreground">SKU: {product.sku}</p>
            
            <div className="flex items-center space-x-2 mt-2">
              <Badge variant="outline">{product.category.name}</Badge>
              <Badge className={product.stock > 0 ? 'bg-green-500' : 'bg-red-500'}>
                {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
              </Badge>
              <Badge variant="secondary" className={
                product.status === 'ACTIVE' ? 'bg-green-100 text-green-800' : 
                product.status === 'INACTIVE' ? 'bg-gray-100 text-gray-800' :
                'bg-red-100 text-red-800'
              }>
                {product.status.replace('_', ' ')}
              </Badge>
            </div>
          </div>


          {/* Rating */}
          <div className="flex items-center space-x-1">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
            ))}
            <span className="text-sm text-muted-foreground ml-1">(4.8)</span>
          </div>

          {/* Description */}
          <div>
            <h3 className="font-semibold mb-2">Description</h3>
            <p className="text-muted-foreground leading-relaxed">
              {product.description || product.shortDescription || 'No description available.'}
            </p>
          </div>

          <Separator />

          {/* Quantity and Add to Cart */}
          <div className="space-y-4">
            <div className="flex items-center space-x-4">
              <span className="font-medium">Quantity:</span>
              <div className="flex items-center border rounded-lg">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleQuantityChange(-1)}
                  disabled={quantity <= 1}
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <span className="px-4 py-2 min-w-[3rem] text-center">{quantity}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleQuantityChange(1)}
                  disabled={quantity >= product.stock}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="flex space-x-3">
              <Button 
                className="flex-1" 
                onClick={handleAddToCart}
                disabled={product.stock === 0 || product.status !== 'ACTIVE'}
                size="lg"
              >
                <ShoppingCart className="h-4 w-4 mr-2" />
                {product.stock > 0 && product.status === 'ACTIVE' ? 'Add to Cart' : 'Unavailable'}
              </Button>
              <Button variant="outline" size="lg">
                <Heart className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="lg">
                <Share2 className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Features */}
          <div className="grid grid-cols-1 gap-3 pt-4">
            <div className="flex items-center space-x-3 text-sm">
              <Truck className="h-4 w-4 text-green-600" />
              <span>Free shipping available</span>
            </div>
            <div className="flex items-center space-x-3 text-sm">
              <Shield className="h-4 w-4 text-blue-600" />
              <span>1 year warranty included</span>
            </div>
            <div className="flex items-center space-x-3 text-sm">
              <RotateCcw className="h-4 w-4 text-orange-600" />
              <span>30-day return policy</span>
            </div>
          </div>

          {/* Tags */}
          {product.tags && product.tags.length > 0 && (
            <div>
              <h3 className="font-semibold mb-2">Tags</h3>
              <div className="flex flex-wrap gap-2">
                {product.tags.map((tag, index) => (
                  <Badge key={index} variant="secondary">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

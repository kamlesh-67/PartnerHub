'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { 
  Building2, 
  Search, 
  Plus,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Users,
  Package,
  MoreVertical,
  Edit,
  Trash2,
  Globe
} from 'lucide-react'

interface Company {
  id: string
  name: string
  email: string
  phone?: string
  website?: string
  address: {
    street: string
    city: string
    state: string
    country: string
    zipCode: string
  }
  status: 'ACTIVE' | 'INACTIVE'
  userCount: number
  orderCount: number
  createdAt: string
  industry?: string
}

export default function CompaniesPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [companies, setCompanies] = useState<Company[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')

  // Mock companies data (in a real app, this would come from an API)
  const mockCompanies: Company[] = [
    {
      id: '1',
      name: 'PUMS',
      email: 'contact@pums.com',
      phone: '+1-555-1000',
      website: 'https://pums.com',
      address: {
        street: '123 Business Ave',
        city: 'New York',
        state: 'NY',
        country: 'USA',
        zipCode: '10001'
      },
      status: 'ACTIVE',
      userCount: 25,
      orderCount: 150,
      createdAt: '2024-01-01T00:00:00Z',
      industry: 'Technology'
    },
    {
      id: '2',
      name: 'Prada',
      email: 'business@prada.com',
      phone: '+1-555-2000',
      website: 'https://prada.com',
      address: {
        street: '456 Fashion St',
        city: 'Milan',
        state: 'MI',
        country: 'Italy',
        zipCode: '20121'
      },
      status: 'ACTIVE',
      userCount: 45,
      orderCount: 320,
      createdAt: '2024-01-05T00:00:00Z',
      industry: 'Fashion'
    },
    {
      id: '3',
      name: 'Chanel',
      email: 'corporate@chanel.com',
      phone: '+33-1-5555-3000',
      website: 'https://chanel.com',
      address: {
        street: '31 Rue Cambon',
        city: 'Paris',
        state: 'IDF',
        country: 'France',
        zipCode: '75001'
      },
      status: 'ACTIVE',
      userCount: 60,
      orderCount: 450,
      createdAt: '2024-01-10T00:00:00Z',
      industry: 'Luxury Goods'
    },
    {
      id: '4',
      name: 'Adidas',
      email: 'b2b@adidas.com',
      phone: '+49-9132-84-0',
      website: 'https://adidas.com',
      address: {
        street: 'Adi-Dassler-Strasse 1',
        city: 'Herzogenaurach',
        state: 'Bavaria',
        country: 'Germany',
        zipCode: '91074'
      },
      status: 'ACTIVE',
      userCount: 120,
      orderCount: 850,
      createdAt: '2024-01-15T00:00:00Z',
      industry: 'Sportswear'
    }
  ]

  // Handle authentication
  useEffect(() => {
    if (status === 'loading') return
    
    if (!session) {
      router.push('/auth/signin')
      return
    }

    // Check if user has permission to view companies (only Super Admin)
    if (session.user.role !== 'SUPER_ADMIN') {
      router.push('/')
      return
    }
  }, [session, status, router])

  useEffect(() => {
    // Simulate API call to fetch companies
    const fetchCompanies = () => {
      setLoading(true)
      setTimeout(() => {
        setCompanies(mockCompanies)
        setLoading(false)
      }, 1000)
    }

    if (session?.user.role === 'SUPER_ADMIN') {
      fetchCompanies()
    }
  }, [session])

  // Show loading state
  if (status === 'loading' || loading) {
    return (
      <div className="container mx-auto py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-6 bg-gray-200 rounded w-3/4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="h-4 bg-gray-200 rounded"></div>
                  <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
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

  const filteredCompanies = companies.filter(company => {
    const matchesSearch = company.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         company.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         company.industry?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         company.address.city.toLowerCase().includes(searchQuery.toLowerCase())
    
    return matchesSearch
  })

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  return (
    <div className="container mx-auto py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center space-x-4">
          <Building2 className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold">Company Management</h1>
            <p className="text-muted-foreground">
              Manage companies and their business relationships
            </p>
          </div>
        </div>
        
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Add Company
        </Button>
      </div>

      {/* Search */}
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search companies..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Companies Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCompanies.map((company) => (
          <Card key={company.id} className="group hover:shadow-lg transition-shadow">
            <CardHeader className="pb-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-xl">{company.name}</CardTitle>
                  <CardDescription className="flex items-center mt-1">
                    <Mail className="h-3 w-3 mr-1" />
                    {company.email}
                  </CardDescription>
                </div>
                <Button variant="ghost" size="sm">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </div>
              
              <div className="flex items-center space-x-2 mt-2">
                {company.industry && (
                  <Badge variant="outline">{company.industry}</Badge>
                )}
                <Badge variant={company.status === 'ACTIVE' ? 'default' : 'secondary'}>
                  {company.status}
                </Badge>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-3">
              {company.phone && (
                <div className="flex items-center text-sm text-muted-foreground">
                  <Phone className="h-4 w-4 mr-2" />
                  {company.phone}
                </div>
              )}
              
              {company.website && (
                <div className="flex items-center text-sm text-muted-foreground">
                  <Globe className="h-4 w-4 mr-2" />
                  <a 
                    href={company.website} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="hover:text-primary hover:underline"
                  >
                    {company.website.replace('https://', '')}
                  </a>
                </div>
              )}
              
              <div className="flex items-start text-sm text-muted-foreground">
                <MapPin className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" />
                <span>
                  {company.address.city}, {company.address.state}, {company.address.country}
                </span>
              </div>
              
              <div className="flex items-center text-sm text-muted-foreground">
                <Calendar className="h-4 w-4 mr-2" />
                Joined {formatDate(company.createdAt)}
              </div>
              
              {/* Stats */}
              <div className="grid grid-cols-2 gap-4 pt-3 border-t">
                <div className="text-center">
                  <div className="flex items-center justify-center text-sm text-muted-foreground mb-1">
                    <Users className="h-4 w-4 mr-1" />
                    Users
                  </div>
                  <div className="text-lg font-semibold">{company.userCount}</div>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center text-sm text-muted-foreground mb-1">
                    <Package className="h-4 w-4 mr-1" />
                    Orders
                  </div>
                  <div className="text-lg font-semibold">{company.orderCount}</div>
                </div>
              </div>
              
              <div className="flex space-x-2 pt-2">
                <Button variant="outline" size="sm" className="flex-1">
                  <Edit className="h-3 w-3 mr-1" />
                  Edit
                </Button>
                <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredCompanies.length === 0 && (
        <div className="text-center py-12">
          <Building2 className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No companies found</h3>
          <p className="text-muted-foreground">
            Try adjusting your search criteria or add new companies.
          </p>
        </div>
      )}
    </div>
  )
}

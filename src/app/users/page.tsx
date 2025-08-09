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
  Users, 
  Search, 
  Filter, 
  Plus,
  Mail,
  Phone,
  Building2,
  Calendar,
  MoreVertical,
  Edit,
  Trash2
} from 'lucide-react'

interface User {
  id: string
  name: string
  email: string
  role: 'SUPER_ADMIN' | 'ACCOUNT_ADMIN' | 'BUYER' | 'OPERATION'
  company: {
    id: string
    name: string
  }
  phone?: string
  status: 'ACTIVE' | 'INACTIVE'
  createdAt: string
  lastLogin?: string
}

export default function UsersPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedRole, setSelectedRole] = useState('all')
  const [selectedCompany, setSelectedCompany] = useState('all')

  // Mock users data (in a real app, this would come from an API)
  const mockUsers: User[] = [
    {
      id: '1',
      name: 'John Admin',
      email: 'admin@pums.com',
      role: 'SUPER_ADMIN',
      company: { id: '1', name: 'PUMS' },
      phone: '+1-555-0101',
      status: 'ACTIVE',
      createdAt: '2024-01-15T10:00:00Z',
      lastLogin: '2024-01-20T14:30:00Z'
    },
    {
      id: '2',
      name: 'Sarah Manager',
      email: 'accountadmin@prada.com',
      role: 'ACCOUNT_ADMIN',
      company: { id: '2', name: 'Prada' },
      phone: '+1-555-0102',
      status: 'ACTIVE',
      createdAt: '2024-01-16T09:00:00Z',
      lastLogin: '2024-01-20T11:15:00Z'
    },
    {
      id: '3',
      name: 'Mike Buyer',
      email: 'buyer@chanel.com',
      role: 'BUYER',
      company: { id: '3', name: 'Chanel' },
      phone: '+1-555-0103',
      status: 'ACTIVE',
      createdAt: '2024-01-17T11:00:00Z',
      lastLogin: '2024-01-19T16:45:00Z'
    },
    {
      id: '4',
      name: 'Lisa Operations',
      email: 'ops@adidas.com',
      role: 'OPERATION',
      company: { id: '4', name: 'Adidas' },
      phone: '+1-555-0104',
      status: 'ACTIVE',
      createdAt: '2024-01-18T08:00:00Z',
      lastLogin: '2024-01-20T09:30:00Z'
    },
    {
      id: '5',
      name: 'Tom Buyer',
      email: 'buyer2@pums.com',
      role: 'BUYER',
      company: { id: '1', name: 'PUMS' },
      phone: '+1-555-0105',
      status: 'INACTIVE',
      createdAt: '2024-01-19T12:00:00Z'
    }
  ]

  // Handle authentication
  useEffect(() => {
    if (status === 'loading') return
    
    if (!session) {
      router.push('/auth/signin')
      return
    }

    // Check if user has permission to view users
    if (session.user.role !== 'SUPER_ADMIN' && session.user.role !== 'ACCOUNT_ADMIN') {
      router.push('/')
      return
    }
  }, [session, status, router])

  useEffect(() => {
    // Simulate API call to fetch users
    const fetchUsers = () => {
      setLoading(true)
      setTimeout(() => {
        let filteredUsers = mockUsers

        // Filter by company if user is ACCOUNT_ADMIN
        if (session?.user.role === 'ACCOUNT_ADMIN') {
          filteredUsers = mockUsers.filter(user => user.company.name === session.user.company)
        }

        setUsers(filteredUsers)
        setLoading(false)
      }, 1000)
    }

    if (session) {
      fetchUsers()
    }
  }, [session])

  // Show loading state
  if (status === 'loading' || loading) {
    return (
      <div className="container mx-auto py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="h-3 bg-gray-200 rounded"></div>
                  <div className="h-3 bg-gray-200 rounded w-2/3"></div>
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

  const roles = [
    { value: 'all', label: 'All Roles' },
    { value: 'SUPER_ADMIN', label: 'Super Admin' },
    { value: 'ACCOUNT_ADMIN', label: 'Account Admin' },
    { value: 'BUYER', label: 'Buyer' },
    { value: 'OPERATION', label: 'Operation' }
  ]

  const companies = [
    { value: 'all', label: 'All Companies' },
    { value: 'PUMS', label: 'PUMS' },
    { value: 'Prada', label: 'Prada' },
    { value: 'Chanel', label: 'Chanel' },
    { value: 'Adidas', label: 'Adidas' }
  ]

  const filteredUsers = mockUsers.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         user.company.name.toLowerCase().includes(searchQuery.toLowerCase())
    
    const matchesRole = selectedRole === 'all' || user.role === selectedRole
    const matchesCompany = selectedCompany === 'all' || user.company.name === selectedCompany
    
    return matchesSearch && matchesRole && matchesCompany
  })

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'SUPER_ADMIN': return 'bg-purple-500'
      case 'ACCOUNT_ADMIN': return 'bg-blue-500'
      case 'BUYER': return 'bg-green-500'
      case 'OPERATION': return 'bg-orange-500'
      default: return 'bg-gray-500'
    }
  }

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
          <Users className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold">User Management</h1>
            <p className="text-muted-foreground">
              Manage users and their roles across your organization
            </p>
          </div>
        </div>
        
        {session.user.role === 'SUPER_ADMIN' && (
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Add User
          </Button>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search users..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <Select value={selectedRole} onValueChange={setSelectedRole}>
          <SelectTrigger className="w-full sm:w-48">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {roles.map((role) => (
              <SelectItem key={role.value} value={role.value}>
                {role.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {session.user.role === 'SUPER_ADMIN' && (
          <Select value={selectedCompany} onValueChange={setSelectedCompany}>
            <SelectTrigger className="w-full sm:w-48">
              <Building2 className="h-4 w-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {companies.map((company) => (
                <SelectItem key={company.value} value={company.value}>
                  {company.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>

      {/* Users Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredUsers.map((user) => (
          <Card key={user.id} className="group hover:shadow-lg transition-shadow">
            <CardHeader className="pb-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-lg">{user.name}</CardTitle>
                  <CardDescription className="flex items-center mt-1">
                    <Mail className="h-3 w-3 mr-1" />
                    {user.email}
                  </CardDescription>
                </div>
                <Button variant="ghost" size="sm">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </div>
              
              <div className="flex items-center space-x-2 mt-2">
                <Badge className={getRoleBadgeColor(user.role)}>
                  {user.role.replace('_', ' ')}
                </Badge>
                <Badge variant={user.status === 'ACTIVE' ? 'default' : 'secondary'}>
                  {user.status}
                </Badge>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-3">
              <div className="flex items-center text-sm text-muted-foreground">
                <Building2 className="h-4 w-4 mr-2" />
                {user.company.name}
              </div>
              
              {user.phone && (
                <div className="flex items-center text-sm text-muted-foreground">
                  <Phone className="h-4 w-4 mr-2" />
                  {user.phone}
                </div>
              )}
              
              <div className="flex items-center text-sm text-muted-foreground">
                <Calendar className="h-4 w-4 mr-2" />
                Joined {formatDate(user.createdAt)}
              </div>
              
              {user.lastLogin && (
                <div className="text-sm text-muted-foreground">
                  Last login: {formatDate(user.lastLogin)}
                </div>
              )}
              
              <div className="flex space-x-2 pt-2">
                <Button variant="outline" size="sm" className="flex-1">
                  <Edit className="h-3 w-3 mr-1" />
                  Edit
                </Button>
                {session.user.role === 'SUPER_ADMIN' && (
                  <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
                    <Trash2 className="h-3 w-3" />
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredUsers.length === 0 && (
        <div className="text-center py-12">
          <Users className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No users found</h3>
          <p className="text-muted-foreground">
            Try adjusting your search criteria or add new users.
          </p>
        </div>
      )}
    </div>
  )
}

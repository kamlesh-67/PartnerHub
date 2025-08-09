'use client'

import { useSession } from 'next-auth/react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { hasPermission, canAccessPage, type UserRole } from '@/lib/permissions'
import {
  BarChart3,
  Building2,
  FileText,
  Package,
  Settings,
  Shield,
  ShoppingCart,
  Users,
  Home,
  Search,
  Heart,
  Clock,
  Truck,
  AlertTriangle,
  Warehouse,
  ClipboardList
} from 'lucide-react'

interface NavItem {
  title: string
  href: string
  icon: React.ComponentType<{ className?: string }>
  permission?: keyof import('@/lib/permissions').RolePermissions
  roles: UserRole[]
  badge?: boolean
}

export function RoleBasedNav() {
  const { data: session } = useSession()
  const pathname = usePathname()
  const userRole = session?.user?.role as UserRole

  if (!session || !userRole) return null

  const navigationItems: NavItem[] = [
    // Super Admin Navigation
    {
      title: 'Admin Dashboard',
      href: '/admin/dashboard',
      icon: Home,
      permission: 'canAccessAdminPanel',
      roles: ['SUPER_ADMIN']
    },
    {
      title: 'Analytics',
      href: '/admin/analytics',
      icon: BarChart3,
      permission: 'canAccessAnalytics',
      roles: ['SUPER_ADMIN', 'ACCOUNT_ADMIN']
    },
    {
      title: 'User Management',
      href: '/admin/users',
      icon: Users,
      permission: 'canAccessUserManagement',
      roles: ['SUPER_ADMIN', 'ACCOUNT_ADMIN']
    },
    {
      title: 'Company Management',
      href: '/admin/companies',
      icon: Building2,
      permission: 'canAccessCompanyManagement',
      roles: ['SUPER_ADMIN']
    },
    {
      title: 'Product Management',
      href: '/admin/products',
      icon: Package,
      permission: 'canAccessProductManagement',
      roles: ['SUPER_ADMIN', 'ACCOUNT_ADMIN', 'OPERATION']
    },
    {
      title: 'Order Management',
      href: '/admin/orders',
      icon: ShoppingCart,
      permission: 'canAccessOrderManagement',
      roles: ['SUPER_ADMIN', 'ACCOUNT_ADMIN', 'OPERATION']
    },
    {
      title: 'Inventory',
      href: '/admin/inventory',
      icon: Warehouse,
      permission: 'canAccessInventoryManagement',
      roles: ['SUPER_ADMIN', 'ACCOUNT_ADMIN', 'OPERATION']
    },
    {
      title: 'Audit Logs',
      href: '/admin/audit',
      icon: Shield,
      permission: 'canAccessAuditLogs',
      roles: ['SUPER_ADMIN']
    },
    {
      title: 'System Settings',
      href: '/admin/settings',
      icon: Settings,
      permission: 'canAccessSystemSettings',
      roles: ['SUPER_ADMIN']
    },
    {
      title: 'Reports',
      href: '/admin/reports',
      icon: FileText,
      permission: 'canAccessReports',
      roles: ['SUPER_ADMIN', 'ACCOUNT_ADMIN', 'OPERATION']
    },

    // Company Admin Navigation
    {
      title: 'Company Dashboard',
      href: '/company/dashboard',
      icon: Home,
      roles: ['ACCOUNT_ADMIN']
    },
    {
      title: 'Team Management',
      href: '/company/users',
      icon: Users,
      permission: 'canAccessUserManagement',
      roles: ['ACCOUNT_ADMIN']
    },
    {
      title: 'Company Analytics',
      href: '/company/analytics',
      icon: BarChart3,
      permission: 'canAccessAnalytics',
      roles: ['ACCOUNT_ADMIN']
    },
    {
      title: 'Company Products',
      href: '/company/products',
      icon: Package,
      permission: 'canAccessProductManagement',
      roles: ['ACCOUNT_ADMIN']
    },
    {
      title: 'Company Orders',
      href: '/company/orders',
      icon: ShoppingCart,
      permission: 'canAccessOrderManagement',
      roles: ['ACCOUNT_ADMIN']
    },
    {
      title: 'Company Reports',
      href: '/company/reports',
      icon: FileText,
      permission: 'canAccessReports',
      roles: ['ACCOUNT_ADMIN']
    },

    // Buyer Navigation
    {
      title: 'Shopping Dashboard',
      href: '/shop/dashboard',
      icon: Home,
      roles: ['BUYER']
    },
    {
      title: 'Browse Products',
      href: '/products',
      icon: Package,
      roles: ['BUYER', 'ACCOUNT_ADMIN']
    },
    {
      title: 'Search',
      href: '/search',
      icon: Search,
      roles: ['BUYER', 'ACCOUNT_ADMIN']
    },
    {
      title: 'My Cart',
      href: '/cart',
      icon: ShoppingCart,
      permission: 'canAddToCart',
      roles: ['BUYER', 'ACCOUNT_ADMIN'],
      badge: true
    },
    {
      title: 'My Orders',
      href: '/orders',
      icon: ClipboardList,
      permission: 'canViewOwnOrders',
      roles: ['BUYER', 'ACCOUNT_ADMIN']
    },
    {
      title: 'Bulk Orders',
      href: '/bulk-orders',
      icon: Package,
      permission: 'canCreateBulkOrders',
      roles: ['BUYER', 'ACCOUNT_ADMIN']
    },
    {
      title: 'Wishlist',
      href: '/wishlist',
      icon: Heart,
      roles: ['BUYER', 'ACCOUNT_ADMIN']
    },

    // Operations Navigation
    {
      title: 'Operations Dashboard',
      href: '/operations/dashboard',
      icon: Home,
      roles: ['OPERATION']
    },
    {
      title: 'Order Processing',
      href: '/operations/orders',
      icon: ShoppingCart,
      permission: 'canAccessOrderManagement',
      roles: ['OPERATION']
    },
    {
      title: 'Inventory Management',
      href: '/operations/inventory',
      icon: Warehouse,
      permission: 'canAccessInventoryManagement',
      roles: ['OPERATION']
    },
    {
      title: 'Product Catalog',
      href: '/operations/products',
      icon: Package,
      permission: 'canAccessProductManagement',
      roles: ['OPERATION']
    },
    {
      title: 'Shipping',
      href: '/operations/shipping',
      icon: Truck,
      roles: ['OPERATION']
    },
    {
      title: 'Quality Control',
      href: '/operations/quality',
      icon: AlertTriangle,
      roles: ['OPERATION']
    },
    {
      title: 'Operations Reports',
      href: '/operations/reports',
      icon: FileText,
      permission: 'canAccessReports',
      roles: ['OPERATION']
    }
  ]

  const filteredNavItems = navigationItems.filter(item => {
    // Check if user role is allowed
    if (!item.roles.includes(userRole)) return false
    
    // Check specific permission if required
    if (item.permission && !hasPermission(userRole, item.permission)) return false
    
    // Check if user can access the page
    if (!canAccessPage(userRole, item.href)) return false
    
    return true
  })

  const getDashboardPath = (role: UserRole): string => {
    switch (role) {
      case 'SUPER_ADMIN':
        return '/admin/dashboard'
      case 'ACCOUNT_ADMIN':
        return '/company/dashboard'
      case 'BUYER':
        return '/shop/dashboard'
      case 'OPERATION':
        return '/operations/dashboard'
      default:
        return '/'
    }
  }

  if (filteredNavItems.length === 0) return null

  return (
    <nav className="flex-1 space-y-1 px-2 py-4">
      {/* Role Badge */}
      <div className="mb-4">
        <div className={cn(
          "inline-flex items-center px-3 py-1 rounded-full text-xs font-medium",
          userRole === 'SUPER_ADMIN' && "bg-red-100 text-red-800",
          userRole === 'ACCOUNT_ADMIN' && "bg-blue-100 text-blue-800",
          userRole === 'BUYER' && "bg-purple-100 text-purple-800",
          userRole === 'OPERATION' && "bg-green-100 text-green-800"
        )}>
          {userRole.replace('_', ' ')}
        </div>
      </div>

      {/* Navigation Items */}
      {filteredNavItems.map((item) => {
        const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
        const Icon = item.icon

        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              'group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors duration-200',
              isActive
                ? 'bg-gray-100 text-gray-900'
                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
            )}
          >
            <Icon
              className={cn(
                'mr-3 h-5 w-5 flex-shrink-0',
                isActive ? 'text-gray-500' : 'text-gray-400 group-hover:text-gray-500'
              )}
            />
            <span className="flex-1">{item.title}</span>
            {item.badge && (
              <span className="ml-auto inline-block h-2 w-2 bg-blue-600 rounded-full"></span>
            )}
          </Link>
        )
      })}

      {/* Quick Dashboard Link */}
      <div className="pt-4 mt-4 border-t border-gray-200">
        <Link
          href={getDashboardPath(userRole)}
          className="group flex items-center px-2 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900 rounded-md"
        >
          <Home className="mr-3 h-4 w-4 text-gray-400 group-hover:text-gray-500" />
          <span>Dashboard</span>
        </Link>
      </div>
    </nav>
  )
}
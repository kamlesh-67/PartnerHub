'use client'

import { useSession } from 'next-auth/react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { hasPermission, canAccessPage, type UserRole } from '@/lib/permissions'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
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

interface RoleBasedNavProps {
  collapsed?: boolean
}

export function RoleBasedNav({ collapsed = false }: RoleBasedNavProps) {
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
      title: 'Inventory Management',
      href: '/admin/inventory',
      icon: Warehouse,
      permission: 'canAccessInventoryManagement',
      roles: ['SUPER_ADMIN', 'ACCOUNT_ADMIN', 'OPERATION']
    },
    {
      title: 'Reports & Analytics',
      href: '/admin/reports',
      icon: FileText,
      permission: 'canAccessReports',
      roles: ['SUPER_ADMIN', 'ACCOUNT_ADMIN', 'OPERATION']
    },
    {
      title: 'System Logs',
      href: '/admin/system-logs',
      icon: Shield,
      permission: 'canAccessAuditLogs',
      roles: ['SUPER_ADMIN']
    },
    {
      title: 'Audit Logs',
      href: '/admin/audit',
      icon: ClipboardList,
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

    // Operations Pages (Available to Super Admin)
    {
      title: 'Operations Dashboard',
      href: '/operations/dashboard',
      icon: Home,
      roles: ['SUPER_ADMIN', 'OPERATION']
    },
    {
      title: 'Order Processing',
      href: '/operations/orders',
      icon: ShoppingCart,
      permission: 'canAccessOrderManagement',
      roles: ['SUPER_ADMIN', 'OPERATION']
    },
    {
      title: 'Operations Inventory',
      href: '/operations/inventory',
      icon: Warehouse,
      permission: 'canAccessInventoryManagement',
      roles: ['SUPER_ADMIN', 'OPERATION']
    },
    {
      title: 'Product Catalog Ops',
      href: '/operations/products',
      icon: Package,
      permission: 'canAccessProductManagement',
      roles: ['SUPER_ADMIN', 'OPERATION']
    },
    {
      title: 'Shipping Management',
      href: '/operations/shipping',
      icon: Truck,
      roles: ['SUPER_ADMIN', 'OPERATION']
    },
    {
      title: 'Quality Control',
      href: '/operations/quality',
      icon: AlertTriangle,
      roles: ['SUPER_ADMIN', 'OPERATION']
    },
    {
      title: 'Operations Reports',
      href: '/operations/reports',
      icon: FileText,
      permission: 'canAccessReports',
      roles: ['SUPER_ADMIN', 'OPERATION']
    },

    // Company Admin Navigation (Available to Super Admin)
    {
      title: 'Company Dashboard',
      href: '/company/dashboard',
      icon: Home,
      roles: ['SUPER_ADMIN', 'ACCOUNT_ADMIN']
    },
    {
      title: 'Team Management',
      href: '/company/users',
      icon: Users,
      permission: 'canAccessUserManagement',
      roles: ['SUPER_ADMIN', 'ACCOUNT_ADMIN']
    },
    {
      title: 'Company Analytics',
      href: '/company/analytics',
      icon: BarChart3,
      permission: 'canAccessAnalytics',
      roles: ['SUPER_ADMIN', 'ACCOUNT_ADMIN']
    },
    {
      title: 'Company Products',
      href: '/company/products',
      icon: Package,
      permission: 'canAccessProductManagement',
      roles: ['SUPER_ADMIN', 'ACCOUNT_ADMIN']
    },
    {
      title: 'Company Orders',
      href: '/company/orders',
      icon: ShoppingCart,
      permission: 'canAccessOrderManagement',
      roles: ['SUPER_ADMIN', 'ACCOUNT_ADMIN']
    },
    {
      title: 'Company Reports',
      href: '/company/reports',
      icon: FileText,
      permission: 'canAccessReports',
      roles: ['SUPER_ADMIN', 'ACCOUNT_ADMIN']
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
    <TooltipProvider>
      <nav className={cn("flex-1 space-y-1", collapsed ? "px-1" : "px-2")}>
        {/* Role Badge - Hidden when collapsed */}
        {!collapsed && (
          <div className="mb-4">
            <div className={cn(
              "inline-flex items-center px-3 py-1 rounded-full text-xs font-medium",
              userRole === 'SUPER_ADMIN' && "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300",
              userRole === 'ACCOUNT_ADMIN' && "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300",
              userRole === 'BUYER' && "bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-300",
              userRole === 'OPERATION' && "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300"
            )}>
              {userRole.replace('_', ' ')}
            </div>
          </div>
        )}

        {/* Navigation Items */}
        {filteredNavItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
          const Icon = item.icon

          const linkContent = (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'group flex items-center text-sm font-medium rounded-md transition-colors duration-200',
                collapsed ? 'px-2 py-3 justify-center' : 'px-2 py-2',
                isActive
                  ? 'bg-secondary text-secondary-foreground'
                  : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
              )}
            >
              <Icon
                className={cn(
                  'h-5 w-5 flex-shrink-0',
                  collapsed ? '' : 'mr-3',
                  isActive ? 'text-secondary-foreground' : 'text-muted-foreground group-hover:text-accent-foreground'
                )}
              />
              {!collapsed && (
                <>
                  <span className="flex-1">{item.title}</span>
                  {item.badge && (
                    <span className="ml-auto inline-block h-2 w-2 bg-primary rounded-full"></span>
                  )}
                </>
              )}
            </Link>
          )

          return collapsed ? (
            <Tooltip key={item.href}>
              <TooltipTrigger asChild>
                {linkContent}
              </TooltipTrigger>
              <TooltipContent side="right">
                <p>{item.title}</p>
              </TooltipContent>
            </Tooltip>
          ) : linkContent
        })}

        {/* Quick Dashboard Link */}
        <div className={cn("pt-4 mt-4 border-t border-border")}>
          {collapsed ? (
            <Tooltip>
              <TooltipTrigger asChild>
                <Link
                  href={getDashboardPath(userRole)}
                  className={cn(
                    'group flex items-center text-sm font-medium text-muted-foreground hover:bg-accent hover:text-accent-foreground rounded-md',
                    collapsed ? 'px-2 py-3 justify-center' : 'px-2 py-2'
                  )}
                >
                  <Home className={cn(
                    'h-4 w-4 text-muted-foreground group-hover:text-accent-foreground',
                    collapsed ? '' : 'mr-3'
                  )} />
                  {!collapsed && <span>Dashboard</span>}
                </Link>
              </TooltipTrigger>
              <TooltipContent side="right">
                <p>Dashboard</p>
              </TooltipContent>
            </Tooltip>
          ) : (
            <Link
              href={getDashboardPath(userRole)}
              className={cn(
                'group flex items-center text-sm font-medium text-muted-foreground hover:bg-accent hover:text-accent-foreground rounded-md',
                collapsed ? 'px-2 py-3 justify-center' : 'px-2 py-2'
              )}
            >
              <Home className={cn(
                'h-4 w-4 text-muted-foreground group-hover:text-accent-foreground',
                collapsed ? '' : 'mr-3'
              )} />
              {!collapsed && <span>Dashboard</span>}
            </Link>
          )}
        </div>
      </nav>
    </TooltipProvider>
  )
}
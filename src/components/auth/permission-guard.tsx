'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, ReactNode } from 'react'
import { hasPermission, canAccessPage, type UserRole, type RolePermissions } from '@/lib/permissions'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Shield, AlertCircle, Home } from 'lucide-react'
import { validateRedirectUrl } from '@/lib/security'

interface PermissionGuardProps {
  children: ReactNode
  permission?: keyof RolePermissions
  page?: string
  roles?: UserRole[]
  fallback?: ReactNode
  redirectTo?: string
  showFallback?: boolean
}

export function PermissionGuard({
  children,
  permission,
  page,
  roles,
  fallback,
  redirectTo,
  showFallback = true
}: PermissionGuardProps) {
  const { data: session, status } = useSession()
  const router = useRouter()
  const userRole = session?.user?.role as UserRole

  useEffect(() => {
    if (status === 'loading') return

    if (!session) {
      router.push('/auth/signin')
      return
    }

    // Check role-based access
    if (roles && !roles.includes(userRole)) {
      if (redirectTo) {
        router.push(validateRedirectUrl(redirectTo))
        return
      }
    }

    // Check page access
    if (page && !canAccessPage(userRole, page)) {
      if (redirectTo) {
        router.push(validateRedirectUrl(redirectTo))
        return
      }
    }

    // Check specific permission
    if (permission && !hasPermission(userRole, permission)) {
      if (redirectTo) {
        router.push(validateRedirectUrl(redirectTo))
        return
      }
    }
  }, [session, status, userRole, permission, page, roles, redirectTo, router])

  // Loading state
  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  // Not authenticated
  if (!session) {
    return null
  }

  // Check role-based access
  if (roles && !roles.includes(userRole)) {
    if (!showFallback) return null

    return fallback || (
      <UnauthorizedFallback
        message={`This page requires ${roles.join(' or ')} role`}
        userRole={userRole}
      />
    )
  }

  // Check page access
  if (page && !canAccessPage(userRole, page)) {
    if (!showFallback) return null

    return fallback || (
      <UnauthorizedFallback
        message="You don't have permission to access this page"
        userRole={userRole}
      />
    )
  }

  // Check specific permission
  if (permission && !hasPermission(userRole, permission)) {
    if (!showFallback) return null

    return fallback || (
      <UnauthorizedFallback
        message={`This action requires '${permission}' permission`}
        userRole={userRole}
      />
    )
  }

  // All checks passed, render children
  return <>{children}</>
}

function UnauthorizedFallback({
  message,
  userRole
}: {
  message: string
  userRole: UserRole
}) {
  const router = useRouter()

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

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="max-w-md w-full">
        <CardHeader className="text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
            <Shield className="h-6 w-6 text-red-600" />
          </div>
          <CardTitle className="mt-4 text-xl font-semibold text-gray-900">
            Access Denied
          </CardTitle>
          <CardDescription className="text-gray-600">
            {message}
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3">
            <div className="flex items-center">
              <AlertCircle className="h-5 w-5 text-yellow-400 mr-2" />
              <div className="text-left">
                <p className="text-sm font-medium text-yellow-800">
                  Your Role: {userRole.replace('_', ' ')}
                </p>
                <p className="text-xs text-yellow-700">
                  Contact your administrator if you believe this is an error.
                </p>
              </div>
            </div>
          </div>

          <div className="flex space-x-3">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => router.back()}
            >
              Go Back
            </Button>
            <Button
              className="flex-1"
              onClick={() => router.push(getDashboardPath(userRole))}
            >
              <Home className="mr-2 h-4 w-4" />
              Dashboard
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// Convenient wrapper components for specific use cases
export function AdminOnly({ children, fallback }: { children: ReactNode, fallback?: ReactNode }) {
  return (
    <PermissionGuard roles={['SUPER_ADMIN']} fallback={fallback}>
      {children}
    </PermissionGuard>
  )
}

export function CompanyAdminOnly({ children, fallback }: { children: ReactNode, fallback?: ReactNode }) {
  return (
    <PermissionGuard roles={['ACCOUNT_ADMIN']} fallback={fallback}>
      {children}
    </PermissionGuard>
  )
}

export function BuyerOnly({ children, fallback }: { children: ReactNode, fallback?: ReactNode }) {
  return (
    <PermissionGuard roles={['BUYER']} fallback={fallback}>
      {children}
    </PermissionGuard>
  )
}

export function OperationOnly({ children, fallback }: { children: ReactNode, fallback?: ReactNode }) {
  return (
    <PermissionGuard roles={['OPERATION']} fallback={fallback}>
      {children}
    </PermissionGuard>
  )
}

export function AdminOrCompanyAdmin({ children, fallback }: { children: ReactNode, fallback?: ReactNode }) {
  return (
    <PermissionGuard roles={['SUPER_ADMIN', 'ACCOUNT_ADMIN']} fallback={fallback}>
      {children}
    </PermissionGuard>
  )
}

export function ShopperRoles({ children, fallback }: { children: ReactNode, fallback?: ReactNode }) {
  return (
    <PermissionGuard roles={['BUYER', 'ACCOUNT_ADMIN']} fallback={fallback}>
      {children}
    </PermissionGuard>
  )
}

// Component-level permission checks
interface ConditionalRenderProps {
  children: ReactNode
  permission?: keyof RolePermissions
  roles?: UserRole[]
  showOnlyFor?: UserRole[]
  hideFor?: UserRole[]
}

export function ConditionalRender({
  children,
  permission,
  roles,
  showOnlyFor,
  hideFor
}: ConditionalRenderProps) {
  const { data: session } = useSession()
  const userRole = session?.user?.role as UserRole

  if (!session || !userRole) return null

  // Hide for specific roles
  if (hideFor && hideFor.includes(userRole)) return null

  // Show only for specific roles
  if (showOnlyFor && !showOnlyFor.includes(userRole)) return null

  // Check role-based access
  if (roles && !roles.includes(userRole)) return null

  // Check specific permission
  if (permission && !hasPermission(userRole, permission)) return null

  return <>{children}</>
}
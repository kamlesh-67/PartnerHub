'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Shield, AlertCircle, Home, ArrowLeft } from 'lucide-react'
import { type UserRole } from '@/lib/permissions'

export default function UnauthorizedPage() {
  const { data: session } = useSession()
  const router = useRouter()
  
  const userRole = session?.user?.role as UserRole

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

  const getRoleDescription = (role: UserRole): string => {
    switch (role) {
      case 'SUPER_ADMIN':
        return 'You have full administrative access to the system'
      case 'ACCOUNT_ADMIN':
        return 'You can manage your company and team members'
      case 'BUYER':
        return 'You can browse products and place orders'
      case 'OPERATION':
        return 'You can manage operations, inventory, and order processing'
      default:
        return 'Please contact your administrator for role assignment'
    }
  }

  const getRoleColor = (role: UserRole) => {
    switch (role) {
      case 'SUPER_ADMIN':
        return 'bg-red-50 text-red-700 border-red-200'
      case 'ACCOUNT_ADMIN':
        return 'bg-blue-50 text-blue-700 border-blue-200'
      case 'BUYER':
        return 'bg-purple-50 text-purple-700 border-purple-200'
      case 'OPERATION':
        return 'bg-green-50 text-green-700 border-green-200'
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200'
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <Card>
          <CardHeader className="text-center">
            <div className="mx-auto flex items-center justify-center h-20 w-20 rounded-full bg-red-100">
              <Shield className="h-10 w-10 text-red-600" />
            </div>
            <CardTitle className="mt-6 text-2xl font-bold text-gray-900">
              Access Denied
            </CardTitle>
            <CardDescription className="text-gray-600">
              You don&apos;t have permission to access the requested page
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {session && userRole && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start">
                  <AlertCircle className="h-5 w-5 text-blue-400 mt-0.5 mr-3 flex-shrink-0" />
                  <div className="flex-1">
                    <h4 className="text-sm font-medium text-blue-800 mb-2">
                      Your Account Information
                    </h4>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-blue-700">Role:</span>
                        <Badge className={`${getRoleColor(userRole)} border`}>
                          {userRole.replace('_', ' ')}
                        </Badge>
                      </div>
                      <div className="flex items-start">
                        <span className="text-sm text-blue-700 mr-2">Access:</span>
                        <span className="text-xs text-blue-600 flex-1">
                          {getRoleDescription(userRole)}
                        </span>
                      </div>
                      {session.user?.company && (
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-blue-700">Company:</span>
                          <span className="text-sm text-blue-800 font-medium">
                            {typeof session.user.company === 'string' ? session.user.company : session.user.company?.name || 'N/A'}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex">
                <AlertCircle className="h-5 w-5 text-yellow-400 mr-2 flex-shrink-0" />
                <div className="text-sm text-yellow-700">
                  <p className="font-medium mb-1">Need different access?</p>
                  <p>Contact your system administrator or account manager to request additional permissions or role changes.</p>
                </div>
              </div>
            </div>
            
            <div className="flex space-x-3">
              <Button 
                variant="outline" 
                className="flex-1"
                onClick={() => router.back()}
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Go Back
              </Button>
              <Button 
                className="flex-1"
                onClick={() => router.push(session && userRole ? getDashboardPath(userRole) : '/')}
              >
                <Home className="mr-2 h-4 w-4" />
                {session ? 'Dashboard' : 'Home'}
              </Button>
            </div>

            {session && (
              <div className="text-center">
                <Button 
                  variant="link" 
                  className="text-sm text-gray-500 hover:text-gray-700"
                  onClick={() => router.push('/account/settings')}
                >
                  Account Settings
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="text-center">
          <p className="text-xs text-gray-500">
            If you believe this is an error, please contact support with error code: ROLE_ACCESS_DENIED
          </p>
        </div>
      </div>
    </div>
  )
}
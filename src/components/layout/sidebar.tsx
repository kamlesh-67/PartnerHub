'use client'

import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { RoleBasedNav } from '@/components/navigation/role-based-nav'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu'
import { Badge } from '@/components/ui/badge'
import { 
  User, 
  Settings, 
  LogOut, 
  ChevronDown,
  Building2,
  Menu,
  X
} from 'lucide-react'
import { useState } from 'react'
import { cn } from '@/lib/utils'
import { type UserRole } from '@/lib/permissions'

export function Sidebar() {
  const { data: session } = useSession()
  const router = useRouter()
  const [isCollapsed, setIsCollapsed] = useState(false)

  if (!session) return null

  const userRole = session.user?.role as UserRole
  const userName = session.user?.name || 'User'
  const userEmail = session.user?.email || ''
  const userCompany = session.user?.company || 'No Company'

  const handleSignOut = async () => {
    await signOut({ redirect: false })
    router.push('/')
  }

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase()
  }

  const getRoleColor = (role: UserRole) => {
    switch (role) {
      case 'SUPER_ADMIN':
        return 'bg-red-100 text-red-800'
      case 'ACCOUNT_ADMIN':
        return 'bg-blue-100 text-blue-800'
      case 'BUYER':
        return 'bg-purple-100 text-purple-800'
      case 'OPERATION':
        return 'bg-green-100 text-green-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <>
      {/* Mobile sidebar toggle */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsCollapsed(!isCollapsed)}
        >
          {isCollapsed ? <Menu className="h-4 w-4" /> : <X className="h-4 w-4" />}
        </Button>
      </div>

      {/* Sidebar */}
      <div
        className={cn(
          "fixed inset-y-0 left-0 z-40 w-64 bg-white border-r border-gray-200 transition-transform duration-300 lg:relative lg:translate-x-0",
          isCollapsed ? "-translate-x-full lg:w-16" : "translate-x-0"
        )}
      >
        <div className="flex h-full flex-col">
          {/* Logo/Brand */}
          <div className="flex h-16 items-center justify-center border-b border-gray-200 px-4">
            {!isCollapsed ? (
              <div className="flex items-center space-x-3">
                <div className="h-8 w-8 bg-blue-600 rounded-lg flex items-center justify-center">
                  <Building2 className="h-5 w-5 text-white" />
                </div>
                <span className="font-semibold text-lg text-gray-900">B2B Commerce</span>
              </div>
            ) : (
              <div className="h-8 w-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <Building2 className="h-5 w-5 text-white" />
              </div>
            )}
          </div>

          {/* Navigation */}
          <div className="flex-1 overflow-y-auto">
            {!isCollapsed && <RoleBasedNav />}
            {isCollapsed && (
              <div className="p-2 space-y-2">
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full justify-center p-2"
                  onClick={() => setIsCollapsed(false)}
                >
                  <Menu className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>

          {/* User Profile */}
          <div className="border-t border-gray-200 p-4">
            {!isCollapsed ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="w-full justify-start p-2">
                    <div className="flex items-center space-x-3">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback>
                          {getInitials(userName)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 text-left">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {userName}
                        </p>
                        <p className="text-xs text-gray-500 truncate">
                          {userEmail}
                        </p>
                      </div>
                      <ChevronDown className="h-4 w-4 text-gray-400" />
                    </div>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel className="flex flex-col space-y-1">
                    <span className="font-medium">{userName}</span>
                    <span className="text-xs text-muted-foreground">{userEmail}</span>
                    <div className="flex items-center space-x-2 mt-2">
                      <Badge className={`text-xs ${getRoleColor(userRole)}`}>
                        {userRole.replace('_', ' ')}
                      </Badge>
                      {userCompany !== 'No Company' && (
                        <Badge variant="outline" className="text-xs">
                          {userCompany}
                        </Badge>
                      )}
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => router.push('/profile')}>
                    <User className="mr-2 h-4 w-4" />
                    <span>Profile</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => router.push('/account/settings')}>
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Settings</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    onClick={handleSignOut}
                    className="text-red-600 focus:text-red-600"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Sign out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="flex justify-center">
                <Avatar className="h-8 w-8">
                  <AvatarFallback>
                    {getInitials(userName)}
                  </AvatarFallback>
                </Avatar>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile backdrop */}
      {!isCollapsed && (
        <div
          className="fixed inset-0 z-30 bg-black bg-opacity-50 lg:hidden"
          onClick={() => setIsCollapsed(true)}
        />
      )}
    </>
  )
}
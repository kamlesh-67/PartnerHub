'use client'

import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import { cn } from '@/lib/utils'
import { type UserRole } from '@/lib/permissions'

// Shadcn UI Components
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { ThemeToggle } from '@/components/ui/theme-toggle'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from '@/components/ui/sheet'

// Icons
import {
  User,
  Settings,
  LogOut,
  ChevronDown,
  Menu,
} from 'lucide-react'

// Navigation Components
import { RoleBasedNav } from '@/components/navigation/role-based-nav'

interface ModernSidebarProps {
  className?: string
  onToggle?: (collapsed: boolean) => void
}

export function ModernSidebar({ className, onToggle }: ModernSidebarProps) {
  const { data: session } = useSession()
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)
  const [isCollapsed, setIsCollapsed] = useState(true) // Default to collapsed

  // Notify parent when collapsed state changes
  useEffect(() => {
    onToggle?.(isCollapsed)
  }, [isCollapsed, onToggle])

  // Handle hover expand/collapse
  const handleMouseEnter = () => {
    if (window.innerWidth >= 1024) { // Only on desktop
      setIsCollapsed(false)
    }
  }

  const handleMouseLeave = () => {
    if (window.innerWidth >= 1024) { // Only on desktop
      setIsCollapsed(true)
    }
  }

  if (!session) return null

  const userRole = session.user?.role as UserRole
  const userName = session.user?.name || 'User'
  const userEmail = session.user?.email || ''
  const userCompany = session.user?.company?.name || 'No Company'

  const handleSignOut = async () => {
    await signOut({ redirect: false })
    router.push('/')
  }

  // Mobile Sidebar using Sheet
  const MobileSidebar = () => (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className="lg:hidden fixed top-4 left-4 z-50"
        >
          <Menu className="h-4 w-4" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-80 p-0">
        <div className="flex flex-col h-full">
          {/* Navigation */}
          <ScrollArea className="flex-1 px-6 pt-6">
            <RoleBasedNav />
          </ScrollArea>
          
          <Separator />
          
          {/* User Profile & Settings */}
          <div className="p-6 pt-4">
            <div className="flex items-center space-x-3 mb-4">
              <Avatar className="h-10 w-10">
                <AvatarFallback className="bg-primary text-primary-foreground">
                  {userName.split(' ').map(n => n[0]).join('').toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{userName}</p>
                <p className="text-xs text-muted-foreground truncate">{userEmail}</p>
                <Badge variant="secondary" className="text-xs mt-1">
                  {userRole}
                </Badge>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <ThemeToggle />
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Settings className="h-4 w-4 mr-2" />
                    Settings
                    <ChevronDown className="h-4 w-4 ml-2" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>My Account</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => router.push('/profile')}>
                    <User className="mr-2 h-4 w-4" />
                    Profile
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => router.push('/settings')}>
                    <Settings className="mr-2 h-4 w-4" />
                    Settings
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleSignOut}>
                    <LogOut className="mr-2 h-4 w-4" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )

  // Desktop Sidebar with hover functionality
  const DesktopSidebar = () => (
    <div
      className={cn(
        "hidden lg:flex flex-col fixed inset-y-0 left-0 z-50 bg-background border-r sidebar-hover",
        isCollapsed ? "w-16" : "w-80",
        className
      )}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Header - Empty for clean look */}
      <div className="border-b min-h-[20px]">
      </div>

      {/* Navigation */}
      <ScrollArea className="flex-1 px-4">
        <div className="py-4">
          <RoleBasedNav collapsed={isCollapsed} />
        </div>
      </ScrollArea>

      {/* Footer with User Info and Theme Toggle */}
      <div className="border-t p-4">
        {!isCollapsed ? (
          <div className="space-y-4">
            {/* Theme Toggle */}
            <div className="flex justify-center">
              <ThemeToggle />
            </div>
            
            <Separator />
            
            {/* User Profile */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="w-full justify-start p-2 h-auto">
                  <Avatar className="h-8 w-8 mr-3">
                    <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                      {userName.split(' ').map(n => n[0]).join('').toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="text-left flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{userName}</p>
                    <p className="text-xs text-muted-foreground truncate">{userCompany}</p>
                  </div>
                  <Badge variant="secondary" className="text-xs">
                    {userRole}
                  </Badge>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-64">
                <DropdownMenuLabel>
                  <div>
                    <p className="font-medium">{userName}</p>
                    <p className="text-xs text-muted-foreground">{userEmail}</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => router.push('/profile')}>
                  <User className="mr-2 h-4 w-4" />
                  Profile
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => router.push('/settings')}>
                  <Settings className="mr-2 h-4 w-4" />
                  Settings
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSignOut}>
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        ) : (
          <div className="space-y-2">
            {/* Collapsed Theme Toggle */}
            <div className="flex justify-center">
              <ThemeToggle />
            </div>
            
            {/* Collapsed User Avatar */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="w-8 h-8 mx-auto">
                  <Avatar className="h-6 w-6">
                    <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                      {userName.split(' ').map(n => n[0]).join('').toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-64">
                <DropdownMenuLabel>
                  <div>
                    <p className="font-medium">{userName}</p>
                    <p className="text-xs text-muted-foreground">{userEmail}</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => router.push('/profile')}>
                  <User className="mr-2 h-4 w-4" />
                  Profile
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => router.push('/settings')}>
                  <Settings className="mr-2 h-4 w-4" />
                  Settings
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSignOut}>
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )}
      </div>
    </div>
  )

  return (
    <>
      <MobileSidebar />
      <DesktopSidebar />
    </>
  )
}
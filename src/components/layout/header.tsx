'use client'

import Link from 'next/link'
import { useState } from 'react'
import { useSession, signOut } from 'next-auth/react'
import { Button } from '@/components/ui/button'
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
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { ThemeToggle } from '@/components/ui/theme-toggle'
import { SlidingCart } from '@/components/cart/sliding-cart'
import {
  ShoppingCart,
  User,
  Settings,
  LogOut,
  Package,
  Users,
  BarChart3,
  Building2,
  Shield,
  Database,
  Menu
} from 'lucide-react'

export function Header() {
  const { data: session } = useSession()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'SUPER_ADMIN':
        return 'bg-red-100 text-red-800'
      case 'ACCOUNT_ADMIN':
        return 'bg-blue-100 text-blue-800'
      case 'OPERATION':
        return 'bg-green-100 text-green-800'
      case 'BUYER':
        return 'bg-purple-100 text-purple-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getNavItems = (role: string) => {
    const baseItems = [
      { href: '/products', label: 'Products', icon: Package },
    ]

    switch (role) {
      case 'SUPER_ADMIN':
        return [
          { href: '/admin', label: 'Admin Dashboard', icon: Shield },
          ...baseItems,
          { href: '/admin/products', label: 'Manage Products', icon: Package },
          { href: '/admin/users', label: 'Users', icon: Users },
          { href: '/admin/companies', label: 'Companies', icon: Building2 },
          { href: '/admin/analytics', label: 'Analytics', icon: BarChart3 },
        ]
      case 'ACCOUNT_ADMIN':
        return [
          ...baseItems,
          { href: '/admin/products', label: 'Manage Products', icon: Package },
          { href: '/admin/company-users', label: 'Company Users', icon: Users },
          { href: '/admin/orders', label: 'Orders', icon: ShoppingCart },
        ]
      case 'OPERATION':
        return [
          ...baseItems,
          { href: '/admin/products', label: 'Manage Products', icon: Package },
          { href: '/operations/orders', label: 'Order Management', icon: ShoppingCart },
          { href: '/operations/inventory', label: 'Inventory', icon: BarChart3 },
        ]
      default:
        return baseItems
    }
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center max-w-full px-4 lg:px-6 xl:px-8 2xl:px-12">
        <div className="mr-4 flex md:mr-6 lg:mr-8">
          <Link href="/" className="mr-6 flex items-center space-x-2 lg:mr-8">
            <Building2 className="h-6 w-6 lg:h-7 lg:w-7" />
            <span className="hidden font-bold sm:inline-block lg:text-lg xl:text-xl">
              PartnerHub
            </span>
          </Link>
        </div>

        {session && (
          <nav className="hidden lg:flex items-center space-x-4 xl:space-x-6 2xl:space-x-8 text-sm xl:text-base font-medium">
            {getNavItems(session.user.role).map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="relative flex items-center space-x-1.5 xl:space-x-2 px-2 py-1.5 rounded-md transition-all duration-200 hover:text-foreground hover:bg-accent/50 text-foreground/70"
              >
                <item.icon className="h-4 w-4 xl:h-5 xl:w-5" />
                <span className="whitespace-nowrap">{item.label}</span>
                {(item as any).badge && (item as any).badge > 0 && (
                  <Badge variant="secondary" className="ml-1 h-5 w-5 rounded-full p-0 text-xs xl:h-6 xl:w-6 xl:text-sm">
                    {(item as any).badge}
                  </Badge>
                )}
              </Link>
            ))}
          </nav>
        )}

        <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end lg:space-x-4">
          <div className="flex items-center space-x-2 lg:space-x-3 xl:space-x-4">
            {/* Mobile Menu Trigger */}
            {session && (
              <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="sm" className="lg:hidden">
                    <Menu className="h-5 w-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-80">
                  <SheetHeader>
                    <SheetTitle className="flex items-center space-x-2">
                      <Building2 className="h-6 w-6" />
                      <span>PartnerHub</span>
                    </SheetTitle>
                  </SheetHeader>
                  <div className="mt-8 space-y-4">
                    {getNavItems(session.user.role).map((item) => (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setMobileMenuOpen(false)}
                        className="flex items-center space-x-3 px-3 py-2 rounded-md text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground"
                      >
                        <item.icon className="h-5 w-5" />
                        <span>{item.label}</span>
                        {(item as any).badge && (item as any).badge > 0 && (
                          <Badge variant="secondary" className="ml-auto">
                            {(item as any).badge}
                          </Badge>
                        )}
                      </Link>
                    ))}
                  </div>
                </SheetContent>
              </Sheet>
            )}
            <SlidingCart />
            <ThemeToggle />
          </div>
          {session ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 lg:h-10 lg:w-10 xl:h-12 xl:w-12 rounded-full">
                  <Avatar className="h-8 w-8 lg:h-10 lg:w-10 xl:h-12 xl:w-12">
                    <AvatarImage src="" alt={session.user.name || ''} />
                    <AvatarFallback className="lg:text-sm xl:text-base font-semibold">
                      {session.user.name?.charAt(0).toUpperCase() || 'U'}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56 lg:w-64 xl:w-72" align="end" forceMount>
                <DropdownMenuLabel className="font-normal lg:p-4">
                  <div className="flex flex-col space-y-1 lg:space-y-2">
                    <p className="text-sm lg:text-base font-medium leading-none">
                      {session.user.name}
                    </p>
                    <p className="text-xs lg:text-sm leading-none text-muted-foreground">
                      {session.user.email}
                    </p>
                    <Badge className={`w-fit text-xs lg:text-sm ${getRoleColor(session.user.role)}`}>
                      {session.user.role.replace('_', ' ')}
                    </Badge>
                    {session.user.company && (
                      <p className="text-xs lg:text-sm leading-none text-muted-foreground">
                        {session.user.company.name}
                      </p>
                    )}
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/profile" className="flex items-center">
                    <User className="mr-2 h-4 w-4" />
                    Profile
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/settings" className="flex items-center">
                    <Settings className="mr-2 h-4 w-4" />
                    Settings
                  </Link>
                </DropdownMenuItem>
                
                {session.user.role === 'SUPER_ADMIN' && (
                  <>
                    <DropdownMenuItem asChild>
                      <Link href="/admin/settings" className="flex items-center">
                        <Database className="mr-2 h-4 w-4" />
                        System Settings
                      </Link>
                    </DropdownMenuItem>
                  </>
                )}
                
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="cursor-pointer"
                  onSelect={() => signOut()}
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="flex items-center space-x-2">
              <Button variant="ghost" asChild>
                <Link href="/auth/signin">Sign In</Link>
              </Button>
              <Button asChild>
                <Link href="/auth/signup">Sign Up</Link>
              </Button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}

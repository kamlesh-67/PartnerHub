'use client'

import { useSession } from 'next-auth/react'
import { usePathname } from 'next/navigation'
import { Header } from './header'
import { Footer } from './footer'
import { Sidebar } from './sidebar'
import { Toaster } from '@/components/ui/sonner'

interface MainLayoutProps {
  children: React.ReactNode
}

export function MainLayout({ children }: MainLayoutProps) {
  const { data: session } = useSession()
  const pathname = usePathname()

  // Determine if we should show sidebar based on user role and current path
  const shouldShowSidebar = session && (
    pathname.startsWith('/admin') ||
    pathname.startsWith('/company') ||
    pathname.startsWith('/shop') ||
    pathname.startsWith('/operations') ||
    pathname.startsWith('/products') ||
    pathname.startsWith('/orders') ||
    pathname.startsWith('/cart') ||
    pathname.startsWith('/bulk-orders')
  )

  // Public routes that don't need sidebar
  const publicRoutes = ['/auth/signin', '/auth/signup', '/', '/unauthorized']
  const isPublicRoute = publicRoutes.includes(pathname)

  if (isPublicRoute || !session) {
    // Simple layout for public pages and auth pages
    return (
      <div className="relative flex min-h-screen flex-col">
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
        <Toaster />
      </div>
    )
  }

  if (shouldShowSidebar) {
    // Layout with sidebar for authenticated dashboard pages
    return (
      <div className="relative flex min-h-screen">
        <Sidebar />
        <div className="flex flex-1 flex-col">
          <Header />
          <main className="flex-1 overflow-auto">{children}</main>
        </div>
        <Toaster />
      </div>
    )
  }

  // Default layout for other authenticated pages
  return (
    <div className="relative flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
      <Toaster />
    </div>
  )
}

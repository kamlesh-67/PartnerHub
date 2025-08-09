'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { type UserRole } from '@/lib/permissions'

export default function DashboardRouter() {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === 'loading') return

    if (!session) {
      router.push('/auth/signin')
      return
    }

    const userRole = session.user?.role as UserRole

    // Redirect to appropriate dashboard based on user role
    switch (userRole) {
      case 'SUPER_ADMIN':
        router.push('/admin/dashboard')
        break
      case 'ACCOUNT_ADMIN':
        router.push('/company/dashboard')
        break
      case 'BUYER':
        router.push('/shop/dashboard')
        break
      case 'OPERATION':
        router.push('/operations/dashboard')
        break
      default:
        router.push('/shop/dashboard') // Fallback to buyer dashboard
    }
  }, [session, status, router])

  // Loading state
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
    </div>
  )
}
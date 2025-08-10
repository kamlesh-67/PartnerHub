'use client'

import { useSession } from 'next-auth/react'
import { useState, useEffect } from 'react'
import { cn } from '@/lib/utils'
import { type UserRole } from '@/lib/permissions'

// Shadcn UI Components
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from '@/components/ui/sheet'

// Icons
import {
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
          {/* Navigation with enhanced mobile scrolling */}
          <ScrollArea className="flex-1 px-6 pt-6 pb-6 mobile-sidebar-scroll sidebar-nav" style={{ height: '100vh' }}>
            <div className="space-y-1">
              <RoleBasedNav />
            </div>
          </ScrollArea>
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

      {/* Navigation with enhanced scrolling */}
      <ScrollArea className="flex-1 px-4 sidebar-scroll sidebar-nav" style={{ maxHeight: 'calc(100vh - 40px)' }}>
        <div className="py-4 space-y-1">
          <RoleBasedNav collapsed={isCollapsed} />
        </div>
      </ScrollArea>

    </div>
  )

  return (
    <>
      <MobileSidebar />
      <DesktopSidebar />
    </>
  )
}
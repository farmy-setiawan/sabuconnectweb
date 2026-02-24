'use client'

import { BottomNav } from '@/components/layout/BottomNav'

interface MobileLayoutProps {
  children: React.ReactNode
}

export function MobileLayout({ children }: MobileLayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50 pb-16 md:pb-0">
      {children}
      <BottomNav />
    </div>
  )
}

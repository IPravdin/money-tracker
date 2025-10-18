"use client"

import { MainLayout } from "./main-layout"
import { MobileNav } from "./mobile-nav"

interface AuthenticatedLayoutProps {
  children: React.ReactNode
}

export function AuthenticatedLayout({ children }: AuthenticatedLayoutProps) {
  return (
    <>
      <MainLayout>{children}</MainLayout>
      <MobileNav />
      {/* Add padding bottom for mobile nav */}
      <div className="h-16 md:hidden" />
    </>
  )
}
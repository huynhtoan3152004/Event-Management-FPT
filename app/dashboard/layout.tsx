import type React from "react"
/* ============================================
   Student Dashboard Layout
   Wraps all dashboard pages with sidebar and header
   Using shadcn SidebarProvider for collapsible sidebar
   ============================================ */

import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { DashboardSidebar } from "@/components/dashboard/sidebar"
import { DashboardHeader } from "@/components/dashboard/header"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <SidebarProvider>
      <DashboardSidebar />
      <SidebarInset>
        <DashboardHeader />
        <main className="flex-1 p-4 lg:p-6 bg-muted/30">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  )
}

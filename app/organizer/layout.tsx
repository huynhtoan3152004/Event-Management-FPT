import type React from "react"
/* ============================================
   Organizer Dashboard Layout
   Wraps all organizer pages with sidebar
   Using shadcn SidebarProvider for collapsible sidebar
   ============================================ */

import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { OrganizerSidebar } from "@/components/organizer/sidebar"

export default function OrganizerLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <SidebarProvider>
      <OrganizerSidebar />
      <SidebarInset className="bg-muted/30">{children}</SidebarInset>
    </SidebarProvider>
  )
}

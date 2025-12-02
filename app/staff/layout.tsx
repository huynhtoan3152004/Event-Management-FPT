import type React from "react"
/* ============================================
   Staff Portal Layout
   Minimal layout for check-in operations
   ============================================ */

import { StaffHeader } from "@/components/staff/header"

export default function StaffLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-muted/30 flex flex-col">
      <StaffHeader />
      <main className="flex-1 p-4 lg:p-6">{children}</main>
    </div>
  )
}

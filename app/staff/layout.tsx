import type React from "react"
/* ============================================
   Staff Portal Layout
   Minimal layout for check-in operations
   ============================================ */

import { StaffHeader } from "@/components/staff/header"
import { RoleGuard } from "@/components/shared/role-guard"

export default function StaffLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <RoleGuard allowedRoles={["staff"]}>
      <div className="min-h-screen bg-muted/30 flex flex-col">
        <StaffHeader />
        <main className="flex-1 p-4 lg:p-6">{children}</main>
      </div>
    </RoleGuard>
  )
}

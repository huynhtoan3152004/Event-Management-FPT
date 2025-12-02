/* ============================================
   Staff Portal Header Component
   Compact header with user info and logout
   ============================================ */

"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { Zap } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { MOCK_STAFF_USER } from "@/lib/constants"

export function StaffHeader() {
  const router = useRouter()
  const user = MOCK_STAFF_USER

  return (
    <header className="h-14 bg-card border-b px-4 lg:px-6 flex items-center justify-between">
      {/* Logo */}
      <Link href="/staff" className="flex items-center gap-2">
        <div className="w-7 h-7 bg-primary rounded-lg flex items-center justify-center">
          <Zap className="h-4 w-4 text-primary-foreground" />
        </div>
        <span className="font-semibold text-sm text-foreground">FPTU Event Check-in</span>
      </Link>

      {/* User Section */}
      <div className="flex items-center gap-3">
        <span className="text-sm text-muted-foreground hidden sm:block">{user.name}</span>
        <Avatar className="h-7 w-7">
          <AvatarImage src="/male-asian-staff-avatar.jpg" alt={user.name} />
          <AvatarFallback className="text-xs">{user.name.charAt(0)}</AvatarFallback>
        </Avatar>
        <Button variant="default" size="sm" className="rounded-full h-8 text-xs" onClick={() => router.push("/login")}>
          Logout
        </Button>
      </div>
    </header>
  )
}

/* ============================================
   Staff Portal Header Component
   Compact header with user info and logout
   ============================================ */

"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { Zap, LogOut } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useUser } from "@/hooks/use-user"
import { useLogout } from "@/hooks/use-auth"
import { Skeleton } from "@/components/ui/skeleton"

export function StaffHeader() {
  const router = useRouter()
  const { user, isLoading } = useUser()
  const { logout } = useLogout()

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
        {isLoading ? (
          <Skeleton className="h-8 w-24" />
        ) : user ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 px-2 gap-2">
                <Avatar className="h-6 w-6">
                  <AvatarImage src={user.avatar || "/placeholder-user.jpg"} alt={user.name} />
                  <AvatarFallback className="text-xs">{user.name.charAt(0).toUpperCase()}</AvatarFallback>
                </Avatar>
                <span className="text-sm font-medium hidden sm:block">{user.name}</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <div className="px-2 py-1.5 text-xs text-muted-foreground">
                <div className="font-medium text-foreground">{user.name || user.email}</div>
                <div className="truncate">{user.email}</div>
                <div className="capitalize mt-1">{user.roleName || user.roleId || 'Staff'}</div>
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/dashboard/settings">Profile Settings</Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={logout} className="text-destructive">
                <LogOut className="mr-2 h-4 w-4" />
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <Button variant="default" size="sm" className="rounded-full h-8 text-xs" asChild>
            <Link href="/login">Đăng nhập</Link>
          </Button>
        )}
      </div>
    </header>
  )
}

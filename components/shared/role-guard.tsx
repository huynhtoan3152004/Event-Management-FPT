"use client"

/* ============================================
   Role Guard Component
   Bảo vệ route theo role của user
   ============================================ */

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useUser } from "@/hooks/use-user"
import { authService } from "@/lib/services/auth.service"

interface RoleGuardProps {
  children: React.ReactNode
  allowedRoles: string[]
  redirectTo?: string
}

/**
 * Component bảo vệ route theo role
 * Chỉ cho phép user có role trong allowedRoles truy cập
 */
export function RoleGuard({ 
  children, 
  allowedRoles, 
  redirectTo 
}: RoleGuardProps) {
  const router = useRouter()
  const { user, isLoading, isAuthenticated } = useUser()

  useEffect(() => {
    // Chờ load xong user data
    if (isLoading) return

    // Nếu chưa đăng nhập, redirect về login
    if (!isAuthenticated || !user) {
      router.push("/login")
      return
    }

    // Lấy role từ user (có thể là roleId hoặc roleName)
    const userRole = (user.roleId || user.roleName || "").toLowerCase()
    
    // Kiểm tra role có trong danh sách allowedRoles không
    const normalizedAllowedRoles = allowedRoles.map(role => role.toLowerCase())
    const hasAccess = normalizedAllowedRoles.includes(userRole)

    if (!hasAccess) {
      // Nếu không có quyền, redirect về dashboard phù hợp với role
      const roleRedirectMap: Record<string, string> = {
        student: "/dashboard",
        organizer: "/organizer",
        staff: "/staff",
      }

      const defaultRedirect = roleRedirectMap[userRole] || "/dashboard"
      const finalRedirect = redirectTo || defaultRedirect

      router.push(finalRedirect)
    }
  }, [user, isLoading, isAuthenticated, allowedRoles, redirectTo, router])

  // Hiển thị loading khi đang kiểm tra
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Đang kiểm tra quyền truy cập...</p>
        </div>
      </div>
    )
  }

  // Nếu chưa đăng nhập hoặc không có user, không render children
  if (!isAuthenticated || !user) {
    return null
  }

  // Kiểm tra role một lần nữa trước khi render
  const userRole = (user.roleId || user.roleName || "").toLowerCase()
  const normalizedAllowedRoles = allowedRoles.map(role => role.toLowerCase())
  const hasAccess = normalizedAllowedRoles.includes(userRole)

  if (!hasAccess) {
    return null
  }

  // Render children nếu có quyền
  return <>{children}</>
}



/* ============================================
   Shared Header Component
   Glass liquid effect header with navigation
   Used across all public pages
   ============================================ */

"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Menu, X, User, LogOut } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"
import { useScrollHeader } from "@/hooks/use-scroll-header"
import { useUser } from "@/hooks/use-user"
import { useLogout } from "@/hooks/use-auth"
import { PUBLIC_NAV_LINKS } from "@/lib/constants"

export function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const isScrolled = useScrollHeader(50)
  const pathname = usePathname()
  const { user, isLoading, isAuthenticated } = useUser()
  const { logout } = useLogout()

  // Xác định dashboard link dựa trên role
  const getDashboardLink = () => {
    if (!user) return "/dashboard"
    const roleId = (user.roleId || "").toLowerCase()
    switch (roleId) {
      case "organizer":
        return "/organizer"
      case "staff":
        return "/staff"
      case "student":
      default:
        return "/dashboard"
    }
  }

  // Xác định settings link - tất cả đều dùng /dashboard/settings (route đã tồn tại)
  const getSettingsLink = () => {
    return "/dashboard/settings"
  }

  // Xác định tickets link dựa trên role (chỉ student có)
  const getTicketsLink = () => {
    if (!user) return "/dashboard/tickets"
    const roleId = (user.roleId || "").toLowerCase()
    if (roleId === "student") {
      return "/dashboard/tickets"
    }
    return null
  }

  // Kiểm tra role có cần hiển thị Settings không
  const shouldShowSettings = () => {
    if (!user) return true
    const roleId = (user.roleId || "").toLowerCase()
    // Staff không có settings trong header của họ, nhưng vẫn hiển thị để đồng bộ
    return true
  }

  // Kiểm tra có đang ở trang chủ không
  const isHomePage = pathname === "/"

  // Kiểm tra role có cần hiển thị tên user bên cạnh avatar không
  const shouldShowUserName = () => {
    if (!user) return false
    const roleId = (user.roleId || "").toLowerCase()
    // Staff và Organizer luôn hiển thị tên, Student chỉ hiển thị trên màn hình lớn
    return roleId === "staff" || roleId === "organizer"
  }

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-500",
        isScrolled ? "glass-header py-3" : "bg-transparent py-4",
      )}
    >
      {/* Liquid blob decoration - visible when scrolled */}
      {isScrolled && (
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-primary/5 rounded-full liquid-blob blur-2xl" />
          <div
            className="absolute -bottom-10 -left-10 w-32 h-32 bg-accent/10 rounded-full liquid-blob blur-xl"
            style={{ animationDelay: "-4s" }}
          />
        </div>
      )}

      <div className="container mx-auto px-4 relative">
        <nav className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center transition-transform group-hover:scale-110">
              <span className="text-primary-foreground font-bold text-sm">F</span>
            </div>
            <span className="font-semibold text-lg text-foreground">FPTU Event Hub</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            {PUBLIC_NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "text-sm font-medium transition-colors relative",
                  pathname === link.href ? "text-primary" : "text-muted-foreground hover:text-foreground",
                  // Underline animation
                  "after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-0 after:bg-primary after:transition-all hover:after:w-full",
                )}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Auth Buttons */}
          <div className="hidden md:flex items-center gap-3">
            {isLoading ? (
              <div className="h-9 w-24 bg-muted animate-pulse rounded-md" />
            ) : isAuthenticated && user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="gap-2 h-9 px-3 rounded-full">
                    <Avatar className="h-6 w-6">
                      <AvatarImage src={user.avatar || "/placeholder-user.jpg"} alt={user.name} />
                      <AvatarFallback className="text-xs">
                        {user.name?.charAt(0).toUpperCase() || "U"}
                      </AvatarFallback>
                    </Avatar>
                    <span className={`text-sm font-medium ${shouldShowUserName() ? "block" : "hidden lg:block"} max-w-[100px] truncate`}>
                      {user.name || user.email}
                    </span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <div className="px-2 py-1.5 text-xs text-muted-foreground">
                    <div className="font-medium text-foreground">{user.name || user.email}</div>
                    <div className="truncate">{user.email}</div>
                    <div className="capitalize mt-1">{user.roleName || user.roleId || "User"}</div>
                  </div>
                  <DropdownMenuSeparator />
                  {isHomePage && (
                    <DropdownMenuItem asChild>
                      <Link href={getDashboardLink()}>Vào Dashboard</Link>
                    </DropdownMenuItem>
                  )}
                  {shouldShowSettings() && (
                    <DropdownMenuItem asChild>
                      <Link href={getSettingsLink()}>Profile Settings</Link>
                    </DropdownMenuItem>
                  )}
                  {getTicketsLink() && (
                    <DropdownMenuItem asChild>
                      <Link href={getTicketsLink()!}>My Tickets</Link>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={logout} className="text-destructive">
                    <LogOut className="mr-2 h-4 w-4" />
                    Đăng xuất
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <>
                <Link href="/login">
                  <Button variant="ghost" className="text-primary hover:text-primary/80">
                    Đăng nhập
                  </Button>
                </Link>
                <Link href="/login">
                  <Button variant="outline" size="icon" className="rounded-full bg-transparent">
                    <User className="h-4 w-4" />
                  </Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 rounded-lg hover:bg-accent transition-colors"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label={isMobileMenuOpen ? "Đóng menu" : "Mở menu"}
          >
            {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </nav>

        {/* Mobile Menu */}
        <div
          className={cn(
            "md:hidden overflow-hidden transition-all duration-300",
            isMobileMenuOpen ? "max-h-96 opacity-100 mt-4" : "max-h-0 opacity-0",
          )}
        >
          <div className="bg-card rounded-xl p-4 shadow-lg border">
            <div className="flex flex-col gap-2">
              {PUBLIC_NAV_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "px-4 py-3 rounded-lg transition-colors",
                    pathname === link.href ? "bg-primary/10 text-primary" : "hover:bg-accent",
                  )}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
              <hr className="my-2" />
              {isLoading ? (
                <div className="px-4 py-3 rounded-lg bg-muted animate-pulse h-12" />
              ) : isAuthenticated && user ? (
                <>
                  <div className="px-4 py-3 space-y-1">
                    <div className="text-sm font-medium">{user.name || user.email}</div>
                    <div className="text-xs text-muted-foreground truncate">{user.email}</div>
                    <div className="text-xs text-muted-foreground capitalize">
                      {user.roleName || user.roleId || "User"}
                    </div>
                  </div>
                  {isHomePage && (
                    <Link
                      href={getDashboardLink()}
                      className="px-4 py-3 rounded-lg bg-primary text-primary-foreground text-center font-medium"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      Vào Dashboard
                    </Link>
                  )}
                  {shouldShowSettings() && (
                    <Link
                      href={getSettingsLink()}
                      className="px-4 py-3 rounded-lg hover:bg-accent text-center font-medium"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      Profile Settings
                    </Link>
                  )}
                  {getTicketsLink() && (
                    <Link
                      href={getTicketsLink()!}
                      className="px-4 py-3 rounded-lg hover:bg-accent text-center font-medium"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      My Tickets
                    </Link>
                  )}
                  <button
                    onClick={() => {
                      logout()
                      setIsMobileMenuOpen(false)
                    }}
                    className="px-4 py-3 rounded-lg border border-destructive text-destructive text-center font-medium w-full"
                  >
                    Đăng xuất
                  </button>
                </>
              ) : (
                <Link
                  href="/login"
                  className="px-4 py-3 rounded-lg bg-primary text-primary-foreground text-center font-medium"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Đăng nhập
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}

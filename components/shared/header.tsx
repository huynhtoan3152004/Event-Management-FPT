/* ============================================
   Shared Header Component
   Glass liquid effect header with navigation
   Used across all public pages
   ============================================ */

"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Menu, X, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { useScrollHeader } from "@/hooks/use-scroll-header"
import { PUBLIC_NAV_LINKS } from "@/lib/constants"

export function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const isScrolled = useScrollHeader(50)
  const pathname = usePathname()

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
              <Link
                href="/login"
                className="px-4 py-3 rounded-lg bg-primary text-primary-foreground text-center font-medium"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Đăng nhập
              </Link>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}

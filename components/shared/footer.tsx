/* ============================================
   Shared Footer Component
   Used across all public pages
   ============================================ */

import Link from "next/link"
import { Facebook, Instagram, Linkedin, Youtube, Calendar, Home, Users, Newspaper } from "lucide-react"

const discoverLinks = [
  { label: "Home", href: "/", icon: Home },
  { label: "Events Calendar", href: "/events", icon: Calendar },
  { label: "Student Clubs", href: "/clubs", icon: Users },
  { label: "News & Blog", href: "/blog", icon: Newspaper },
]

const supportLinks = [
  { label: "Contact Us", href: "/contact" },
  { label: "FAQ", href: "/faq" },
  { label: "Privacy Policy", href: "/privacy" },
  { label: "Terms of Service", href: "/terms" },
]

const socialLinks = [
  { icon: Facebook, href: "https://facebook.com", label: "Facebook" },
  { icon: Instagram, href: "https://instagram.com", label: "Instagram" },
  { icon: Linkedin, href: "https://linkedin.com", label: "LinkedIn" },
  { icon: Youtube, href: "https://youtube.com", label: "YouTube" },
]

export function Footer() {
  return (
    <footer className="bg-secondary/30 border-t">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          
          {/* Brand Section */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Calendar className="h-6 w-6 text-primary" />
              <h3 className="text-xl font-bold">FPTU Events</h3>
            </div>
            <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
              Connecting students with campus life. Discover clubs, join workshops, and never miss an event happening at FPT University.
            </p>
            
            {/* Social Links */}
            <div className="flex gap-3">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-lg hover:bg-accent transition-colors border"
                  aria-label={social.label}
                >
                  <social.icon className="h-4 w-4 text-muted-foreground hover:text-foreground" />
                </a>
              ))}
            </div>
          </div>

          {/* Discover Section */}
          <div>
            <h4 className="font-semibold mb-4 text-sm uppercase tracking-wider">
              DISCOVER
            </h4>
            <nav className="space-y-3">
              {discoverLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors group"
                >
                  <link.icon className="h-4 w-4 group-hover:text-primary" />
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>

          {/* Support Section */}
          <div>
            <h4 className="font-semibold mb-4 text-sm uppercase tracking-wider">
              SUPPORT
            </h4>
            <nav className="space-y-3">
              {supportLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="block text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-12 pt-8 border-t">
          <p className="text-center text-sm text-muted-foreground">
            © {new Date().getFullYear()} FPTU Event System. All Rights Reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}

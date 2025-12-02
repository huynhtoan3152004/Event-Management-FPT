/* ============================================
   Shared Footer Component
   Used across all public pages
   ============================================ */

import Link from "next/link"
import { Facebook, Instagram, Linkedin } from "lucide-react"

const footerLinks = [
  { label: "Home", href: "/" },
  { label: "Events", href: "/events" },
  { label: "Clubs", href: "/clubs" },
  { label: "Contact", href: "/contact" },
  { label: "Privacy Policy", href: "/privacy" },
]

const socialLinks = [
  { icon: Facebook, href: "https://facebook.com", label: "Facebook" },
  { icon: Instagram, href: "https://instagram.com", label: "Instagram" },
  { icon: Linkedin, href: "https://linkedin.com", label: "LinkedIn" },
]

export function Footer() {
  return (
    <footer className="bg-secondary/50 py-16">
      <div className="container mx-auto px-4">
        {/* Meet Our Clubs CTA */}
        <div className="text-center mb-12">
          <h3 className="text-2xl font-bold text-foreground mb-2">Meet Our Clubs</h3>
          <p className="text-muted-foreground">Find your community and passion.</p>
        </div>

        {/* Navigation Links */}
        <nav className="flex flex-wrap justify-center gap-6 mb-8">
          {footerLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Social Links */}
        <div className="flex justify-center gap-4 mb-8">
          {socialLinks.map((social) => (
            <a
              key={social.label}
              href={social.href}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-full hover:bg-accent transition-colors"
              aria-label={social.label}
            >
              <social.icon className="h-5 w-5 text-muted-foreground" />
            </a>
          ))}
        </div>

        {/* Copyright */}
        <p className="text-center text-sm text-muted-foreground">
          © {new Date().getFullYear()} FPTU Event System. All Rights Reserved.
        </p>
      </div>
    </footer>
  )
}

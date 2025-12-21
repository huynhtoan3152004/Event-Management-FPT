/* ============================================
   Shared Footer Component
   Used across all public pages
   ============================================ */

import Link from "next/link"
import { Facebook, Instagram, Linkedin, Youtube, Calendar, Home } from "lucide-react"

const discoverLinks = [
  { label: "Trang chủ", href: "/", icon: Home },
  { label: "Lịch sự kiện", href: "/login?redirect=/dashboard/events", icon: Calendar },
]

const supportLinks = [
  { label: "Liên hệ", href: "/contact" },
  { label: "Câu hỏi thường gặp", href: "/faq" },
  { label: "Chính sách bảo mật", href: "/privacy" },
  { label: "Điều khoản dịch vụ", href: "/terms" },
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
              Kết nối sinh viên với đời sống học đường. Khám phá câu lạc bộ, tham gia workshop và không bỏ lỡ sự kiện nào tại Đại học FPT.
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
              KHÁM PHÁ
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
              HỖ TRỢ
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
            © {new Date().getFullYear()} Hệ thống sự kiện FPTU. Bảo lưu mọi quyền.
          </p>
        </div>
      </div>
    </footer>
  )
}

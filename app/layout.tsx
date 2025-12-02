import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import "./globals.css"

// Font configuration - Single unified font across all pages
const inter = Inter({
  subsets: ["vietnamese", "latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-sans",
  display: "swap",
})

export const metadata: Metadata = {
  title: "FPTU Event Hub - Khám phá sự kiện sinh viên",
  description: "Nền tảng chính thức để tìm kiếm, đăng ký và tham gia các sự kiện tại FPT University",
  keywords: ["FPTU", "Event", "Sự kiện", "Sinh viên", "FPT University"],
    generator: 'v0.app'
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="vi">
      <body className={`${inter.variable} font-sans antialiased`}>
        {children}
        <Analytics />
      </body>
    </html>
  )
}

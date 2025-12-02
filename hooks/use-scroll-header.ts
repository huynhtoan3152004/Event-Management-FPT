/* ============================================
   Custom Hook for Header Scroll Behavior
   Handles sticky header with glass effect on scroll
   ============================================ */

"use client"

import { useState, useEffect } from "react"

export function useScrollHeader(threshold = 50) {
  const [isScrolled, setIsScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > threshold)
    }

    // Initial check
    handleScroll()

    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => window.removeEventListener("scroll", handleScroll)
  }, [threshold])

  return isScrolled
}

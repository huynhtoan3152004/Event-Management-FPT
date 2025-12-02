/* ============================================
   Landing Page - Main Entry Point
   Combines all landing sections into one page
   ============================================ */

import { Header } from "@/components/shared/header"
import { Footer } from "@/components/shared/footer"
import { HeroSection } from "@/components/landing/hero-section"
import { UpcomingEventsSection } from "@/components/landing/upcoming-events-section"
import { ClubsSection } from "@/components/landing/clubs-section"

export default function HomePage() {
  return (
    <main className="min-h-screen">
      {/* Shared Header with Glass Effect */}
      <Header />

      {/* Hero Section */}
      <HeroSection />

      {/* Upcoming Events from Clubs */}
      <UpcomingEventsSection />

      {/* Clubs Discovery Section */}
      <ClubsSection />

      {/* Shared Footer */}
      <Footer />
    </main>
  )
}

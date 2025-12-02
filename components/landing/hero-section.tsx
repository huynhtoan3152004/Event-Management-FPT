/* ============================================
   Hero Section Component
   Main landing hero with GSAP animations
   ============================================ */

"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { useHeroAnimation } from "@/hooks/use-gsap"
import { EventCard } from "@/components/landing/event-card"
import { MOCK_EVENTS } from "@/lib/constants"

export function HeroSection() {
  const { titleRef, subtitleRef, ctaRef } = useHeroAnimation()

  // Get first 2 events for featured display
  const featuredEvents = MOCK_EVENTS.slice(0, 2)

  return (
    <section className="min-h-screen pt-24 pb-16 bg-gradient-to-br from-accent/30 via-background to-secondary/20">
      <div className="container mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Column - Hero Content */}
          <div className="space-y-8">
            <h1
              ref={titleRef}
              className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight text-foreground"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              <span className="italic">Khám phá và</span>
              <br />
              <span className="italic">tham gia sự kiện</span>
              <br />
              <span className="italic">độc quyền FPTU</span>
            </h1>

            <p ref={subtitleRef} className="text-lg text-muted-foreground max-w-xl leading-relaxed">
              Nền tảng chính thức, miễn phí dành cho sinh viên FPTU để tìm kiếm, đăng ký và trải nghiệm tất cả các sự
              kiện trong khuôn viên trường. Không bao giờ bỏ lỡ những gì đang diễn ra!
            </p>

            <div ref={ctaRef} className="flex flex-wrap gap-4">
              <Link href="/events">
                <Button size="lg" className="px-8 py-6 text-base font-medium rounded-full">
                  Khám phá sự kiện
                </Button>
              </Link>
              <Link href="/about">
                <Button
                  variant="outline"
                  size="lg"
                  className="px-8 py-6 text-base font-medium rounded-full bg-transparent"
                >
                  Tìm hiểu thêm
                </Button>
              </Link>
            </div>
          </div>

          {/* Right Column - Featured Events */}
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-foreground">Sự kiện đang diễn ra</h2>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              {featuredEvents.map((event) => (
                <EventCard
                  key={event.id}
                  event={{
                    ...event,
                    title: event.id === "1" ? "Acoustic Night" : "Hackathon 2024",
                    clubName: event.id === "1" ? "Music Club" : "Coding Club",
                    date: "Today",
                  }}
                  variant="compact"
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

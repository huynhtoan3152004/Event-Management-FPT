/* ============================================
   Upcoming Events Section
   Carousel/grid of upcoming events from clubs
   ============================================ */

"use client"

import { useRef, useState } from "react"
import Link from "next/link"
import { ChevronLeft, ChevronRight, ArrowRight } from "lucide-react"
import { EventCard } from "@/components/landing/event-card"
import { useFadeInOnScroll } from "@/hooks/use-gsap"
import { MOCK_EVENTS } from "@/lib/constants"

export function UpcomingEventsSection() {
  const sectionRef = useFadeInOnScroll<HTMLElement>()
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(true)

  const handleScroll = () => {
    const container = scrollContainerRef.current
    if (!container) return

    setCanScrollLeft(container.scrollLeft > 0)
    setCanScrollRight(container.scrollLeft < container.scrollWidth - container.clientWidth - 10)
  }

  const scroll = (direction: "left" | "right") => {
    const container = scrollContainerRef.current
    if (!container) return

    const scrollAmount = 320 // Card width + gap
    container.scrollBy({
      left: direction === "left" ? -scrollAmount : scrollAmount,
      behavior: "smooth",
    })
  }

  return (
    <section ref={sectionRef} className="py-20 bg-accent/20">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-4">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground">FPTU Event Hub</h2>
          <p className="text-muted-foreground mt-2">Discover, join, and engage with campus life.</p>
        </div>

        {/* Events Header with Navigation */}
        <div className="flex items-center justify-between mb-8 mt-12">
          <h3 className="text-xl md:text-2xl font-semibold text-foreground">Sự kiện sắp tới từ các câu lạc bộ</h3>
          <Link
            href="/events"
            className="text-primary hover:text-primary/80 flex items-center gap-1 text-sm font-medium"
          >
            Xem tất cả sự kiện
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        {/* Events Carousel */}
        <div className="relative">
          {/* Navigation Buttons */}
          <button
            onClick={() => scroll("left")}
            className={`absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 z-10 w-10 h-10 rounded-full bg-card shadow-lg border flex items-center justify-center transition-opacity ${
              canScrollLeft ? "opacity-100" : "opacity-0 pointer-events-none"
            }`}
            aria-label="Scroll left"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>

          <button
            onClick={() => scroll("right")}
            className={`absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-10 w-10 h-10 rounded-full bg-card shadow-lg border flex items-center justify-center transition-opacity ${
              canScrollRight ? "opacity-100" : "opacity-0 pointer-events-none"
            }`}
            aria-label="Scroll right"
          >
            <ChevronRight className="h-5 w-5" />
          </button>

          {/* Scrollable Container */}
          <div
            ref={scrollContainerRef}
            onScroll={handleScroll}
            className="flex gap-6 overflow-x-auto scrollbar-hide pb-4 snap-x snap-mandatory"
            style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
          >
            {MOCK_EVENTS.map((event) => (
              <div key={event.id} className="shrink-0 w-[280px] snap-start">
                <EventCard event={event} variant="default" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

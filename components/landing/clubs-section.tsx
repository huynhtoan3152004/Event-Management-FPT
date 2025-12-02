/* ============================================
   Clubs Section Component
   Grid of clubs with hover animations
   ============================================ */

"use client"

import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { useStaggerAnimation } from "@/hooks/use-gsap"
import { MOCK_CLUBS } from "@/lib/constants"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { useRef, useState } from "react"

export function ClubsSection() {
  const gridRef = useStaggerAnimation<HTMLDivElement>()
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

    const scrollAmount = 280
    container.scrollBy({
      left: direction === "left" ? -scrollAmount : scrollAmount,
      behavior: "smooth",
    })
  }

  return (
    <section className="py-20 bg-secondary/30">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2
            className="text-3xl md:text-4xl font-bold text-foreground mb-3"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            Khám Phá Các Câu Lạc Bộ Của Chúng Tôi
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Tìm hiểu và tham gia vào cộng đồng sinh viên năng động và đa dạng tại FPTU.
          </p>
        </div>

        {/* Clubs Carousel */}
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
            {MOCK_CLUBS.map((club) => (
              <div key={club.id} className="shrink-0 w-[260px] snap-start">
                <ClubCard club={club} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

// Club Card Sub-component
function ClubCard({ club }: { club: (typeof MOCK_CLUBS)[0] }) {
  return (
    <div className="bg-card rounded-2xl p-6 text-center shadow-sm border hover:shadow-md transition-all group">
      {/* Club Image - Circular */}
      <div className="relative w-32 h-32 mx-auto mb-4 rounded-full overflow-hidden">
        <Image
          src={club.imageUrl || "/placeholder.svg"}
          alt={club.name}
          fill
          className="object-cover group-hover:scale-110 transition-transform duration-500"
        />
      </div>

      {/* Club Info */}
      <h3 className="font-semibold text-lg text-foreground mb-2">{club.name}</h3>
      <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{club.description}</p>

      {/* CTA Button */}
      <Link href={`/clubs/${club.id}`}>
        <Button
          variant="outline"
          className="rounded-full border-accent bg-accent/50 text-accent-foreground hover:bg-accent"
        >
          Tìm hiểu thêm
        </Button>
      </Link>
    </div>
  )
}

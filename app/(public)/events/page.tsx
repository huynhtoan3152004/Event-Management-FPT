/* ============================================
   Events Page
   List all events with filtering options
   ============================================ */

"use client"

import { useState } from "react"
import { Header } from "@/components/shared/header"
import { Footer } from "@/components/shared/footer"
import { EventCard } from "@/components/landing/event-card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Search, Filter } from "lucide-react"
import { MOCK_EVENTS } from "@/lib/constants"
import { useFadeInOnScroll } from "@/hooks/use-gsap"

const categories = ["Tất cả", "Technology", "Culture", "Business", "Sports", "Arts"]

export default function EventsPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("Tất cả")
  const sectionRef = useFadeInOnScroll<HTMLDivElement>()

  // Filter events based on search and category
  const filteredEvents = MOCK_EVENTS.filter((event) => {
    const matchesSearch = event.title.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = selectedCategory === "Tất cả" || event.clubName.includes(selectedCategory)
    return matchesSearch && matchesCategory
  })

  return (
    <main className="min-h-screen">
      <Header />

      <div className="pt-24 pb-16">
        <div className="container mx-auto px-4">
          {/* Page Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-foreground mb-4">Khám Phá Sự Kiện</h1>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Tìm kiếm và đăng ký tham gia các sự kiện hấp dẫn tại FPTU
            </p>
          </div>

          {/* Search and Filter */}
          <div className="flex flex-col md:flex-row gap-4 mb-8">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                placeholder="Tìm kiếm sự kiện..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 rounded-full"
              />
            </div>
            <Button variant="outline" className="rounded-full bg-transparent">
              <Filter className="h-4 w-4 mr-2" />
              Bộ lọc
            </Button>
          </div>

          {/* Category Tags */}
          <div className="flex flex-wrap gap-2 mb-8">
            {categories.map((category) => (
              <Badge
                key={category}
                variant={selectedCategory === category ? "default" : "outline"}
                className="cursor-pointer px-4 py-2 rounded-full"
                onClick={() => setSelectedCategory(category)}
              >
                {category}
              </Badge>
            ))}
          </div>

          {/* Events Grid */}
          <div ref={sectionRef} className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredEvents.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>

          {/* Empty State */}
          {filteredEvents.length === 0 && (
            <div className="text-center py-12">
              <p className="text-muted-foreground">Không tìm thấy sự kiện nào phù hợp.</p>
            </div>
          )}
        </div>
      </div>

      <Footer />
    </main>
  )
}

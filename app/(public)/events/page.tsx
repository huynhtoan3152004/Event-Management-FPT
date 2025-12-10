/* ============================================
   Events Page (LIVE API)
   List all published events with filtering
============================================ */

"use client";

import { useEffect, useState } from "react";
import { Header } from "@/components/shared/header";
import { Footer } from "@/components/shared/footer";
import { EventCard } from "@/components/landing/event-card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, Filter } from "lucide-react";
import { useFadeInOnScroll } from "@/hooks/use-gsap";
import { eventService, EventListItem } from "@/lib/services/event.service";
import { toast } from "react-toastify";

const categories = [
  "Tất cả"
];

export default function EventsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Tất cả");
  const [events, setEvents] = useState<EventListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const sectionRef = useFadeInOnScroll<HTMLDivElement>();

  /* -----------------------------------------
       FETCH EVENTS FROM API
  ----------------------------------------- */
  const fetchEvents = async () => {
    try {
      setIsLoading(true);
      const response = await eventService.getAllEvents({
        pageNumber: 1,
        pageSize: 200,
        status: "published", // chỉ show event đã publish
      });

      if (response.success && Array.isArray(response.data)) {
        setEvents(response.data);
      } else {
        toast.error("Không tải được danh sách sự kiện");
      }
    } catch (error) {
      console.error("Error fetching events:", error);
      toast.error("Lỗi tải sự kiện");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  /* -----------------------------------------
       FILTER EVENTS
  ----------------------------------------- */
  const filteredEvents = events.filter((event) => {
    const matchesSearch =
      event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.description?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory =
      selectedCategory === "Tất cả" ||
      (event.tags &&
        event.tags.toLowerCase().includes(selectedCategory.toLowerCase()));

    return matchesSearch && matchesCategory;
  });

  return (
    <main className="min-h-screen">
      <Header />

      <div className="pt-24 pb-16">
        <div className="container mx-auto px-4">
          {/* Page Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-foreground mb-4">
              Khám Phá Sự Kiện
            </h1>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Tìm kiếm và đăng ký tham gia các sự kiện hấp dẫn tại FPTU
            </p>
          </div>

          {/* Search + Filter */}
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
          <div
            ref={sectionRef}
            className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
          >
            {!isLoading &&
              filteredEvents.map((event) => (
                <EventCard key={event.eventId} event={event} />
              ))}

            {/* Skeleton loading */}
            {isLoading &&
              [...Array(6)].map((_, i) => (
                <div
                  key={i}
                  className="w-full h-64 bg-muted animate-pulse rounded-lg"
                />
              ))}
          </div>

          {/* Empty State */}
          {!isLoading && filteredEvents.length === 0 && (
            <div className="text-center py-12">
              <p className="text-muted-foreground">
                Không tìm thấy sự kiện nào phù hợp.
              </p>
            </div>
          )}
        </div>
      </div>

      <Footer />
    </main>
  );
}

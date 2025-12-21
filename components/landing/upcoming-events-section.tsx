/* ============================================
   Upcoming Events Section (LIVE API VERSION)
   ONLY SHOW UPCOMING EVENTS
============================================ */

"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight, ArrowRight } from "lucide-react";
import { EventCard } from "@/components/landing/event-card";
import { useFadeInOnScroll } from "@/hooks/use-gsap";
import { eventService, EventListItem } from "@/lib/services/event.service";

export function UpcomingEventsSection() {
  const sectionRef = useFadeInOnScroll<HTMLElement>();
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const [events, setEvents] = useState<EventListItem[]>([]);
  const [loading, setLoading] = useState(true);

  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  /* ============================================
     CHECK UPCOMING EVENT (DATE >= TODAY)
  ============================================ */
  const isUpcomingEvent = (event: EventListItem) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const eventDate = new Date(event.date);
    eventDate.setHours(0, 0, 0, 0);

    return eventDate >= today;
  };

  /* ============================================
     FETCH EVENTS
  ============================================ */
  useEffect(() => {
    async function fetchEvents() {
      try {
        const res = await eventService.getAllEvents({
          pageNumber: 1,
          pageSize: 10,
        });

        if (res?.success) {
          // ✅ FILTER UPCOMING EVENTS ONLY
          const upcomingEvents = res.data.filter(isUpcomingEvent);
          setEvents(upcomingEvents);
        }
      } catch (error) {
        console.error("Failed to fetch events:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchEvents();
  }, []);

  /* ============================================
     SCROLL LOGIC
  ============================================ */
  const handleScroll = () => {
    const container = scrollContainerRef.current;
    if (!container) return;

    setCanScrollLeft(container.scrollLeft > 0);
    setCanScrollRight(
      container.scrollLeft < container.scrollWidth - container.clientWidth - 10
    );
  };

  const scroll = (direction: "left" | "right") => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const scrollAmount = 320;
    container.scrollBy({
      left: direction === "left" ? -scrollAmount : scrollAmount,
      behavior: "smooth",
    });
  };

  return (
    <section ref={sectionRef} className="py-12 bg-accent/10">
      <div className="container mx-auto px-4">
        {/* SECTION TITLE */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold text-foreground">
              Sự kiện sắp tới
            </h2>
            <p className="text-muted-foreground mt-1 text-sm">
              Khám phá và tham gia các sự kiện từ câu lạc bộ
            </p>
          </div>
          <Link
            href="/events"
            className="text-primary hover:text-primary/80 flex items-center gap-1 text-sm font-medium"
          >
            Xem tất cả
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        {/* EVENTS CAROUSEL */}
        <div className="relative">
          {/* LEFT BUTTON */}
          <button
            onClick={() => scroll("left")}
            className={`absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 z-10 w-10 h-10 rounded-full bg-card shadow-lg border flex items-center justify-center transition-opacity ${
              canScrollLeft ? "opacity-100" : "opacity-0 pointer-events-none"
            }`}
          >
            <ChevronLeft className="h-5 w-5" />
          </button>

          {/* RIGHT BUTTON */}
          <button
            onClick={() => scroll("right")}
            className={`absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-10 w-10 h-10 rounded-full bg-card shadow-lg border flex items-center justify-center transition-opacity ${
              canScrollRight ? "opacity-100" : "opacity-0 pointer-events-none"
            }`}
          >
            <ChevronRight className="h-5 w-5" />
          </button>

          {/* SCROLL CONTAINER */}
          <div
            ref={scrollContainerRef}
            onScroll={handleScroll}
            className="flex gap-6 overflow-x-auto scrollbar-hide pb-4 snap-x snap-mandatory"
          >
            {/* LOADING */}
            {loading &&
              [...Array(4)].map((_, i) => (
                <div
                  key={i}
                  className="w-[280px] h-[340px] bg-muted rounded-xl animate-pulse"
                />
              ))}

            {/* NO EVENTS */}
            {!loading && events.length === 0 && (
              <p className="text-muted-foreground">
                Không có sự kiện sắp diễn ra.
              </p>
            )}

            {/* EVENTS */}
            {!loading &&
              events.map((event) => (
                <div
                  key={event.eventId}
                  className="shrink-0 w-[280px] snap-start"
                >
                  <EventCard
                    event={{
                      id: event.eventId,
                      title: event.title,
                      date: event.date,
                      time: `${event.startTime} - ${event.endTime}`,
                      clubName: event.clubName ?? "FPTU Club",
                      imageUrl: event.imageUrl ?? "/placeholder.svg",
                    }}
                    variant="default"
                  />
                </div>
              ))}
          </div>
        </div>
      </div>
    </section>
  );
}

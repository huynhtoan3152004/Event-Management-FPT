/* ============================================
   HERO SECTION
   ============================================ */

"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { useHeroAnimation } from "@/hooks/use-gsap";
import { useUser } from "@/hooks/use-user";
import { eventService, EventListItem } from "@/lib/services/event.service";

export function HeroSection() {
  const { titleRef, subtitleRef, ctaRef } = useHeroAnimation();
  const { isAuthenticated } = useUser();

  const [featuredEvents, setFeaturedEvents] = useState<EventListItem[]>([]);

  useEffect(() => {
    loadFeaturedEvents();
  }, []);

  async function loadFeaturedEvents() {
    const today = new Date();
    const twoDaysLater = new Date();
    twoDaysLater.setDate(today.getDate() + 2);

    const dateFrom = today.toISOString().split("T")[0];
    const dateTo = twoDaysLater.toISOString().split("T")[0];

    const result = await eventService.getAllEvents({
      status: "published",
      dateFrom,
      dateTo,
      pageSize: 10,
    });

    let list = result.data;

    if (list.length === 0) {
      const fallback = await eventService.getAllEvents({
        status: "published",
        dateFrom,
      });

      fallback.data.sort(
        (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
      );

      list = fallback.data.slice(0, 2);
    }

    setFeaturedEvents(list.slice(0, 2));
  }

  return (
    <section className="min-h-[70vh] pt-24 pb-12 bg-gradient-to-br from-accent/30 via-background to-secondary/20">
      <div className="container mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* LEFT TEXT */}
          <div className="space-y-8">
            <h1
              ref={titleRef}
              className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight text-foreground"
            >
              <span className="italic">Khám phá và</span>
              <br />
              <span className="italic">tham gia sự kiện</span>
              <br />
              <span className="italic"> FPTU</span>
            </h1>

            <p
              ref={subtitleRef}
              className="text-lg text-muted-foreground max-w-xl leading-relaxed"
            >
              Nền tảng chính thức dành cho sinh viên FPTU để tìm kiếm và đăng ký
              sự kiện.
            </p>

            <div ref={ctaRef} className="flex flex-wrap gap-4">
              <Link href="/events">
                <Button size="lg" className="px-8 py-6 rounded-full">
                  Khám phá sự kiện
                </Button>
              </Link>
            </div>
          </div>

          {/* RIGHT – FEATURED EVENTS */}
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-foreground">
              Sự kiện đang diễn ra
            </h2>

            {featuredEvents.length === 0 ? (
              <p className="text-muted-foreground">Không có sự kiện nào.</p>
            ) : (
              <div className="grid sm:grid-cols-2 gap-4">
                {featuredEvents.map((event) => {
                  // Nếu đã đăng nhập thì đi thẳng đến trang chi tiết sự kiện
                  const redirectUrl = isAuthenticated 
                    ? `/dashboard/events/${event.eventId}`
                    : `/login?redirect=/dashboard/events/${event.eventId}`;

                  return (
                    <div
                      key={event.eventId}
                      className="bg-card rounded-xl overflow-hidden shadow-sm border transition-all"
                    >
                      <div className="relative h-40">
                        <img
                          src={event.imageUrl || "/placeholder.svg"}
                          className="object-cover w-full h-full"
                          alt={event.title}
                        />
                      </div>

                      <div className="p-4 space-y-3">
                        <h3 className="font-semibold text-foreground line-clamp-1">
                          {event.title}
                        </h3>

                        <p className="text-sm text-muted-foreground">
                          {event.clubName || "FPTU Club"} – {event.date}
                        </p>

                        {/* LOGIN REDIRECT */}
                        <Link href={redirectUrl}>
                          <Button
                            variant="outline"
                            className="w-full rounded-full"
                          >
                            Đăng ký
                          </Button>
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

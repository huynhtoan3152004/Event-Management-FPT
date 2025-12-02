/* ============================================
   Event Card Component
   Reusable card for displaying events
   ============================================ */

"use client"

import Image from "next/image"
import Link from "next/link"
import { Calendar, MapPin, Users } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useCardHover } from "@/hooks/use-gsap"
import type { Event } from "@/types"

interface EventCardProps {
  event: Event
  variant?: "default" | "compact" | "horizontal"
}

export function EventCard({ event, variant = "default" }: EventCardProps) {
  const cardRef = useCardHover<HTMLDivElement>()

  if (variant === "compact") {
    return (
      <div ref={cardRef} className="bg-card rounded-xl overflow-hidden shadow-sm border transition-all">
        <div className="relative h-40">
          <Image src={event.imageUrl || "/placeholder.svg"} alt={event.title} fill className="object-cover" />
        </div>
        <div className="p-4 space-y-3">
          <div>
            <h3 className="font-semibold text-foreground line-clamp-1">{event.title}</h3>
            <p className="text-sm text-muted-foreground">
              {event.clubName} - {event.date}
            </p>
          </div>
          <Link href={`/events/${event.id}`}>
            <Button variant="outline" className="w-full rounded-full bg-transparent">
              Đăng ký
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  if (variant === "horizontal") {
    return (
      <div ref={cardRef} className="bg-card rounded-xl overflow-hidden shadow-sm border flex transition-all">
        <div className="relative w-48 shrink-0">
          <Image src={event.imageUrl || "/placeholder.svg"} alt={event.title} fill className="object-cover" />
          <Badge className="absolute top-2 left-2 bg-primary text-primary-foreground">Sắp diễn ra</Badge>
        </div>
        <div className="p-4 flex flex-col justify-between flex-1">
          <div>
            <h3 className="font-semibold text-foreground mb-2">{event.title}</h3>
            <div className="space-y-1 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                <span>
                  {event.date} - {event.time}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                <span>{event.clubName}</span>
              </div>
            </div>
          </div>
          <Link href={`/events/${event.id}`}>
            <Button className="rounded-full mt-4">Đăng ký ngay</Button>
          </Link>
        </div>
      </div>
    )
  }

  // Default variant
  return (
    <div ref={cardRef} className="bg-card rounded-xl overflow-hidden shadow-sm border transition-all">
      <div className="relative h-48">
        <Image src={event.imageUrl || "/placeholder.svg"} alt={event.title} fill className="object-cover" />
        <Badge className="absolute top-3 left-3 bg-primary text-primary-foreground">Sắp diễn ra</Badge>
      </div>
      <div className="p-5 space-y-4">
        <div>
          <h3 className="font-semibold text-lg text-foreground mb-1">{event.title}</h3>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Calendar className="h-4 w-4" />
            <span>
              {event.date} - {event.time}
            </span>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
            <Users className="h-4 w-4" />
            <span>{event.clubName}</span>
          </div>
        </div>
        <Link href={`/events/${event.id}`}>
          <Button className="w-full rounded-full">Đăng ký ngay</Button>
        </Link>
      </div>
    </div>
  )
}

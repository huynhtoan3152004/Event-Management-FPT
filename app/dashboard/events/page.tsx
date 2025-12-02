/* ============================================
   Student Events Page
   Browse and register for events
   ============================================ */

"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { Calendar, MapPin, Users, Search, Filter } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { MOCK_EVENTS } from "@/lib/constants"

export default function StudentEventsPage() {
  const [searchQuery, setSearchQuery] = useState("")

  const filteredEvents = MOCK_EVENTS.filter((event) => event.title.toLowerCase().includes(searchQuery.toLowerCase()))

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Events</h1>
        <p className="text-muted-foreground">Discover and register for upcoming events</p>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search events..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button variant="outline">
          <Filter className="h-4 w-4 mr-2" />
          Filters
        </Button>
      </div>

      {/* Tabs for filtering */}
      <Tabs defaultValue="all">
        <TabsList>
          <TabsTrigger value="all">All Events</TabsTrigger>
          <TabsTrigger value="registered">Registered</TabsTrigger>
          <TabsTrigger value="past">Past Events</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="mt-6">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredEvents.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="registered" className="mt-6">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredEvents.slice(0, 2).map((event) => (
              <EventCard key={event.id} event={event} isRegistered />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="past" className="mt-6">
          <div className="text-center py-12 text-muted-foreground">No past events to show</div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

// Event Card Component
function EventCard({
  event,
  isRegistered = false,
}: {
  event: (typeof MOCK_EVENTS)[0]
  isRegistered?: boolean
}) {
  return (
    <Card className="overflow-hidden hover:shadow-md transition-shadow">
      <div className="relative h-40">
        <Image src={event.imageUrl || "/placeholder.svg"} alt={event.title} fill className="object-cover" />
        <Badge className="absolute top-3 left-3 bg-primary">
          {event.status === "upcoming" ? "Upcoming" : event.status}
        </Badge>
      </div>
      <CardContent className="p-4 space-y-3">
        <h3 className="font-semibold text-foreground line-clamp-1">{event.title}</h3>

        <div className="space-y-1 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            <span>
              {event.date} - {event.time}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4" />
            <span>{event.location}</span>
          </div>
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            <span>
              {event.registeredCount}/{event.totalSeats} registered
            </span>
          </div>
        </div>

        <Link href={`/dashboard/events/${event.id}`}>
          <Button className="w-full rounded-full mt-2" variant={isRegistered ? "outline" : "default"}>
            {isRegistered ? "View Ticket" : "Register Now"}
          </Button>
        </Link>
      </CardContent>
    </Card>
  )
}

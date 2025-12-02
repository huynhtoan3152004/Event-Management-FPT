/* ============================================
   Organizer Events Page
   Manage all events created by organizer
   ============================================ */

"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { Plus, Search, Filter, Calendar, MapPin, Users, MoreVertical, Edit, Trash2, Eye } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { OrganizerHeader } from "@/components/organizer/header"
import { MOCK_EVENTS } from "@/lib/constants"

export default function OrganizerEventsPage() {
  const [searchQuery, setSearchQuery] = useState("")

  const filteredEvents = MOCK_EVENTS.filter((event) => event.title.toLowerCase().includes(searchQuery.toLowerCase()))

  return (
    <>
      <OrganizerHeader title="My Events" />

      <main className="flex-1 p-4 lg:p-6 space-y-6">
        {/* Actions Bar */}
        <div className="flex flex-col sm:flex-row gap-4 justify-between">
          <div className="flex gap-2 flex-1 max-w-md">
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
              <Filter className="h-4 w-4" />
            </Button>
          </div>

          <Link href="/organizer/events/new">
            <Button className="rounded-full">
              <Plus className="h-4 w-4 mr-2" />
              Create Event
            </Button>
          </Link>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="all">
          <TabsList>
            <TabsTrigger value="all">All Events</TabsTrigger>
            <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
            <TabsTrigger value="ongoing">Ongoing</TabsTrigger>
            <TabsTrigger value="past">Past</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="mt-6">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredEvents.map((event) => (
                <EventManagementCard key={event.id} event={event} />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="upcoming" className="mt-6">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredEvents
                .filter((e) => e.status === "upcoming")
                .map((event) => (
                  <EventManagementCard key={event.id} event={event} />
                ))}
            </div>
          </TabsContent>

          <TabsContent value="ongoing" className="mt-6">
            <div className="text-center py-12 text-muted-foreground">No ongoing events</div>
          </TabsContent>

          <TabsContent value="past" className="mt-6">
            <div className="text-center py-12 text-muted-foreground">No past events</div>
          </TabsContent>
        </Tabs>
      </main>
    </>
  )
}

// Event Management Card
function EventManagementCard({ event }: { event: (typeof MOCK_EVENTS)[0] }) {
  return (
    <Card className="overflow-hidden hover:shadow-md transition-shadow">
      <div className="relative h-36">
        <Image src={event.imageUrl || "/placeholder.svg"} alt={event.title} fill className="object-cover" />
        <Badge className="absolute top-3 left-3 bg-primary capitalize">{event.status}</Badge>

        {/* Actions Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="absolute top-3 right-3 p-1.5 bg-card/80 backdrop-blur-sm rounded-lg">
              <MoreVertical className="h-4 w-4" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem>
              <Eye className="h-4 w-4 mr-2" />
              View Details
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Edit className="h-4 w-4 mr-2" />
              Edit Event
            </DropdownMenuItem>
            <DropdownMenuItem className="text-destructive">
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
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

        {/* Progress Bar */}
        <div className="space-y-1">
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Registration</span>
            <span>{Math.round((event.registeredCount / event.totalSeats) * 100)}%</span>
          </div>
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-primary rounded-full transition-all"
              style={{ width: `${(event.registeredCount / event.totalSeats) * 100}%` }}
            />
          </div>
        </div>

        <Link href={`/organizer/events/${event.id}`}>
          <Button variant="outline" className="w-full rounded-full mt-2 bg-transparent">
            Manage Event
          </Button>
        </Link>
      </CardContent>
    </Card>
  )
}

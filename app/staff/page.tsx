/* ============================================
   Staff Event Selection Page - Redesigned
   Compact event selection with check-in stats preview
   Select event takes ~40% of page, rest shows recent check-ins
   ============================================ */

"use client"

import { useState } from "react"
import Link from "next/link"
import { Calendar, Clock, MapPin, ArrowRight, Search, Users, CheckCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Progress } from "@/components/ui/progress"
import { MOCK_STAFF_EVENTS, MOCK_CHECKIN_RECORDS, MOCK_STAFF_USER } from "@/lib/constants"

export default function StaffEventSelectionPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedEventId, setSelectedEventId] = useState<string | null>("1") // Default to first event

  const filteredEvents = MOCK_STAFF_EVENTS.filter((event) =>
    event.name.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const selectedEvent = MOCK_STAFF_EVENTS.find((e) => e.id === selectedEventId)

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Select an Event to Manage</h1>
          <p className="text-sm text-muted-foreground">Welcome back, {MOCK_STAFF_USER.name}!</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-5 gap-6">
        {/* Left Column - Event Selection (~40%) */}
        <div className="lg:col-span-2 space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by event name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 h-9"
            />
          </div>

          {/* Tabs */}
          <Tabs defaultValue="today">
            <TabsList className="h-8">
              <TabsTrigger value="today" className="text-xs h-7">
                Today
              </TabsTrigger>
              <TabsTrigger value="upcoming" className="text-xs h-7">
                Upcoming
              </TabsTrigger>
              <TabsTrigger value="past" className="text-xs h-7">
                Past
              </TabsTrigger>
            </TabsList>
          </Tabs>

          {/* Events List - Compact Cards */}
          <div className="space-y-2 max-h-[400px] overflow-y-auto pr-1">
            {filteredEvents.map((event) => (
              <EventSelectCard
                key={event.id}
                event={event}
                isSelected={selectedEventId === event.id}
                onSelect={() => setSelectedEventId(event.id)}
              />
            ))}
          </div>
        </div>

        {/* Right Column - Recent Check-ins & Stats (~60%) */}
        <div className="lg:col-span-3 space-y-4">
          {selectedEvent ? (
            <>
              {/* Event Info Card */}
              <Card>
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">{selectedEvent.name}</CardTitle>
                      <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3.5 w-3.5" />
                          {selectedEvent.date}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3.5 w-3.5" />
                          {selectedEvent.time}
                        </span>
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3.5 w-3.5" />
                          {selectedEvent.location}
                        </span>
                      </div>
                    </div>
                    <Badge variant={selectedEvent.status === "ongoing" ? "default" : "secondary"}>
                      {selectedEvent.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  {/* Stats Row */}
                  <div className="grid grid-cols-3 gap-4 mb-4">
                    <div className="text-center p-3 bg-muted/50 rounded-lg">
                      <p className="text-2xl font-bold text-primary">{selectedEvent.checkedIn}</p>
                      <p className="text-xs text-muted-foreground">Checked-in</p>
                    </div>
                    <div className="text-center p-3 bg-muted/50 rounded-lg">
                      <p className="text-2xl font-bold">{selectedEvent.totalRegistered}</p>
                      <p className="text-xs text-muted-foreground">Registered</p>
                    </div>
                    <div className="text-center p-3 bg-muted/50 rounded-lg">
                      <p className="text-2xl font-bold text-success">
                        {Math.round((selectedEvent.checkedIn / selectedEvent.totalRegistered) * 100)}%
                      </p>
                      <p className="text-xs text-muted-foreground">Rate</p>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="space-y-1 mb-4">
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>Check-in Progress</span>
                      <span>
                        {selectedEvent.checkedIn} / {selectedEvent.totalRegistered}
                      </span>
                    </div>
                    <Progress value={(selectedEvent.checkedIn / selectedEvent.totalRegistered) * 100} className="h-2" />
                  </div>

                  {/* Action Button */}
                  <Link href={`/staff/checkin/${selectedEvent.id}`}>
                    <Button className="w-full rounded-full" disabled={selectedEvent.status !== "ongoing"}>
                      <ArrowRight className="h-4 w-4 mr-2" />
                      {selectedEvent.status === "ongoing" ? "Start Check-in" : "Check-in Unavailable"}
                    </Button>
                  </Link>
                </CardContent>
              </Card>

              {/* Recent Check-ins Table */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-success" />
                    Recent Check-ins
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="text-xs">NAME</TableHead>
                        <TableHead className="text-xs">TICKET</TableHead>
                        <TableHead className="text-xs">TIME</TableHead>
                        <TableHead className="text-xs">STATUS</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {MOCK_CHECKIN_RECORDS.slice(0, 5).map((record) => (
                        <TableRow key={record.id}>
                          <TableCell className="font-medium text-sm py-2">{record.attendeeName}</TableCell>
                          <TableCell className="text-muted-foreground text-sm py-2">{record.ticketCode}</TableCell>
                          <TableCell className="text-sm py-2">{record.checkInTime}</TableCell>
                          <TableCell className="py-2">
                            <Badge
                              variant="secondary"
                              className={
                                record.status === "entered"
                                  ? "bg-success/10 text-success text-xs"
                                  : "bg-warning/10 text-warning text-xs"
                              }
                            >
                              {record.status === "entered" ? "Entered" : "Already Used"}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </>
          ) : (
            <div className="flex items-center justify-center h-64 text-muted-foreground">
              Select an event to view details
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// Compact Event Selection Card
function EventSelectCard({
  event,
  isSelected,
  onSelect,
}: {
  event: (typeof MOCK_STAFF_EVENTS)[0]
  isSelected: boolean
  onSelect: () => void
}) {
  const isOngoing = event.status === "ongoing"

  return (
    <Card
      className={`cursor-pointer transition-all hover:shadow-sm ${
        isSelected ? "ring-2 ring-primary bg-primary/5" : ""
      }`}
      onClick={onSelect}
    >
      <CardContent className="p-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <h3 className="font-medium text-sm text-foreground truncate">{event.name}</h3>
            <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                {event.date.split(",")[0]}
              </span>
              <span className="flex items-center gap-1">
                <Users className="h-3 w-3" />
                {event.checkedIn}/{event.totalRegistered}
              </span>
            </div>
          </div>
          <Badge variant={isOngoing ? "default" : "secondary"} className={`text-xs ${isOngoing ? "bg-success" : ""}`}>
            {isOngoing ? "Ongoing" : "Upcoming"}
          </Badge>
        </div>
      </CardContent>
    </Card>
  )
}

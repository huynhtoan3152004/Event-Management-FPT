/* ============================================
   Organizer Seats Page - Seat Management
   Visual seat map and management
   ============================================ */

"use client"

import { useState } from "react"
import { Armchair, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { OrganizerHeader } from "@/components/organizer/header"
import { MOCK_VENUES, MOCK_EVENTS } from "@/lib/constants"
import { cn } from "@/lib/utils"

type SeatStatus = "available" | "reserved" | "occupied" | "blocked"

interface SeatData {
  id: string
  row: string
  number: number
  status: SeatStatus
}

// Generate mock seats for a venue
const generateSeats = (rows: number, seatsPerRow: number): SeatData[] => {
  const seats: SeatData[] = []
  for (let r = 0; r < rows; r++) {
    const rowLetter = String.fromCharCode(65 + r)
    for (let s = 1; s <= seatsPerRow; s++) {
      const random = Math.random()
      let status: SeatStatus = "available"
      if (random > 0.7) status = "occupied"
      else if (random > 0.5) status = "reserved"
      else if (random > 0.95) status = "blocked"

      seats.push({
        id: `${rowLetter}-${s}`,
        row: rowLetter,
        number: s,
        status,
      })
    }
  }
  return seats
}

export default function OrganizerSeatsPage() {
  const [selectedVenue, setSelectedVenue] = useState(MOCK_VENUES[0].id)
  const [selectedEvent, setSelectedEvent] = useState(MOCK_EVENTS[0].id)
  const [seats, setSeats] = useState<SeatData[]>(generateSeats(8, 12))
  const [selectedSeat, setSelectedSeat] = useState<SeatData | null>(null)

  const venue = MOCK_VENUES.find((v) => v.id === selectedVenue)

  // Count seats by status
  const seatCounts = seats.reduce(
    (acc, seat) => {
      acc[seat.status]++
      return acc
    },
    { available: 0, reserved: 0, occupied: 0, blocked: 0 } as Record<SeatStatus, number>,
  )

  // Handle seat click
  const handleSeatClick = (seat: SeatData) => {
    setSelectedSeat(seat)
  }

  // Toggle seat status
  const toggleSeatStatus = (seatId: string, newStatus: SeatStatus) => {
    setSeats(seats.map((s) => (s.id === seatId ? { ...s, status: newStatus } : s)))
    setSelectedSeat(null)
  }

  // Regenerate seats
  const regenerateSeats = () => {
    setSeats(generateSeats(8, 12))
    setSelectedSeat(null)
  }

  // Get seat color based on status
  const getSeatColor = (status: SeatStatus) => {
    switch (status) {
      case "available":
        return "bg-success/20 text-success hover:bg-success/30 border-success/30"
      case "reserved":
        return "bg-warning/20 text-warning hover:bg-warning/30 border-warning/30"
      case "occupied":
        return "bg-primary/20 text-primary hover:bg-primary/30 border-primary/30"
      case "blocked":
        return "bg-muted text-muted-foreground cursor-not-allowed border-muted"
    }
  }

  // Group seats by row
  const seatsByRow = seats.reduce(
    (acc, seat) => {
      if (!acc[seat.row]) acc[seat.row] = []
      acc[seat.row].push(seat)
      return acc
    },
    {} as Record<string, SeatData[]>,
  )

  return (
    <>
      <OrganizerHeader title="Seat Management" />

      <main className="flex-1 p-4 lg:p-6 space-y-6">
        {/* Filters */}
        <div className="flex flex-wrap gap-4">
          <div className="w-64">
            <label className="text-sm font-medium mb-1 block">Venue</label>
            <Select value={selectedVenue} onValueChange={setSelectedVenue}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {MOCK_VENUES.map((venue) => (
                  <SelectItem key={venue.id} value={venue.id}>
                    {venue.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="w-64">
            <label className="text-sm font-medium mb-1 block">Event</label>
            <Select value={selectedEvent} onValueChange={setSelectedEvent}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {MOCK_EVENTS.map((event) => (
                  <SelectItem key={event.id} value={event.id}>
                    {event.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-end">
            <Button variant="outline" onClick={regenerateSeats}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
        </div>

        <div className="grid lg:grid-cols-4 gap-6">
          {/* Seat Map */}
          <Card className="lg:col-span-3">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Armchair className="h-4 w-4" />
                {venue?.name} - Seat Map
              </CardTitle>
              <CardDescription>Click on a seat to view details or change status</CardDescription>
            </CardHeader>
            <CardContent>
              {/* Stage */}
              <div className="bg-muted rounded-lg p-3 text-center text-sm font-medium text-muted-foreground mb-6">
                STAGE
              </div>

              {/* Seats */}
              <div className="space-y-2 overflow-x-auto">
                {Object.entries(seatsByRow).map(([row, rowSeats]) => (
                  <div key={row} className="flex items-center gap-2">
                    <span className="w-6 text-sm font-medium text-muted-foreground">{row}</span>
                    <div className="flex gap-1">
                      {rowSeats.map((seat) => (
                        <button
                          key={seat.id}
                          onClick={() => handleSeatClick(seat)}
                          disabled={seat.status === "blocked"}
                          className={cn(
                            "w-8 h-8 rounded text-xs font-medium border transition-colors",
                            getSeatColor(seat.status),
                            selectedSeat?.id === seat.id && "ring-2 ring-ring",
                          )}
                          title={`${seat.row}${seat.number} - ${seat.status}`}
                        >
                          {seat.number}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              {/* Legend */}
              <div className="flex flex-wrap gap-4 mt-6 pt-4 border-t">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded bg-success/20 border border-success/30" />
                  <span className="text-xs">Available ({seatCounts.available})</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded bg-warning/20 border border-warning/30" />
                  <span className="text-xs">Reserved ({seatCounts.reserved})</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded bg-primary/20 border border-primary/30" />
                  <span className="text-xs">Occupied ({seatCounts.occupied})</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded bg-muted border border-muted" />
                  <span className="text-xs">Blocked ({seatCounts.blocked})</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Seat Details Panel */}
          <div className="space-y-4">
            {/* Stats */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Seat Statistics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Total Seats</span>
                  <span className="font-medium">{seats.length}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Available</span>
                  <span className="font-medium text-success">{seatCounts.available}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Reserved</span>
                  <span className="font-medium text-warning">{seatCounts.reserved}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Occupied</span>
                  <span className="font-medium text-primary">{seatCounts.occupied}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Blocked</span>
                  <span className="font-medium">{seatCounts.blocked}</span>
                </div>
              </CardContent>
            </Card>

            {/* Selected Seat Details */}
            {selectedSeat ? (
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Seat Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="text-center py-2">
                    <p className="text-2xl font-bold">
                      {selectedSeat.row}
                      {selectedSeat.number}
                    </p>
                    <Badge className="mt-1" variant="secondary">
                      {selectedSeat.status}
                    </Badge>
                  </div>
                  <div className="space-y-2">
                    <p className="text-xs text-muted-foreground">Change Status:</p>
                    <div className="grid grid-cols-2 gap-2">
                      {(["available", "reserved", "occupied", "blocked"] as SeatStatus[]).map((status) => (
                        <Button
                          key={status}
                          variant={selectedSeat.status === status ? "default" : "outline"}
                          size="sm"
                          className="text-xs capitalize"
                          onClick={() => toggleSeatStatus(selectedSeat.id, status)}
                        >
                          {status}
                        </Button>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="p-6 text-center text-muted-foreground text-sm">
                  Select a seat to view details
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </main>
    </>
  )
}

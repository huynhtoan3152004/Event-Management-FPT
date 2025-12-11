/* ============================================
   Organizer Seats Page - Seat Management
   Visual seat map and management
   ============================================ */

"use client"

import { useState, useEffect } from "react"
import { Armchair, RefreshCw, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { OrganizerHeader } from "@/components/organizer/header"
import { eventService, EventListItem, SeatDto } from "@/lib/services/event.service"
import { useUser } from "@/hooks/use-user"
import { toast } from "react-toastify"
import { cn } from "@/lib/utils"

type SeatStatus = "available" | "reserved" | "occupied" | "blocked"

interface SeatData {
  id: string
  row: string
  number: number
  status: SeatStatus
  seatId?: string
}

export default function OrganizerSeatsPage() {
  const { user } = useUser()
  const [events, setEvents] = useState<EventListItem[]>([])
  const [selectedEvent, setSelectedEvent] = useState<string>("")
  const [seats, setSeats] = useState<SeatData[]>([])
  const [selectedSeat, setSelectedSeat] = useState<SeatData | null>(null)
  const [isLoadingEvents, setIsLoadingEvents] = useState(true)
  const [isLoadingSeats, setIsLoadingSeats] = useState(false)

  // Fetch events của organizer
  useEffect(() => {
    const fetchEvents = async () => {
      if (!user?.userId) return
      
      try {
        setIsLoadingEvents(true)
        const response = await eventService.getAllEvents({
          organizerId: user.userId,
          pageNumber: 1,
          pageSize: 100,
        })
        
        if (response.success && response.data) {
          setEvents(response.data)
          // Tự động chọn event đầu tiên nếu có
          if (response.data.length > 0 && !selectedEvent) {
            setSelectedEvent(response.data[0].eventId)
          }
        }
      } catch (error: any) {
        console.error('Error fetching events:', error)
        toast.error('Không thể tải danh sách sự kiện.')
      } finally {
        setIsLoadingEvents(false)
      }
    }

    fetchEvents()
  }, [user?.userId])

  // Fetch seats khi chọn event
  useEffect(() => {
    const fetchSeats = async () => {
      if (!selectedEvent) {
        setSeats([])
        return
      }

      try {
        setIsLoadingSeats(true)
        const response = await eventService.getEventSeats(selectedEvent)
        
        if (response.success && response.data) {
          // Map từ SeatDto sang SeatData
          const mappedSeats: SeatData[] = response.data.map((seat) => {
            // Parse seatNumber (ví dụ: "A1" -> row: "A", number: 1)
            const match = seat.seatNumber.match(/^([A-Z]+)(\d+)$/)
            const row = match ? match[1] : seat.rowLabel
            const number = match ? parseInt(match[2], 10) : 0
            
            return {
              id: seat.seatId || `${row}-${number}`,
              seatId: seat.seatId,
              row,
              number,
              status: seat.status as SeatStatus,
            }
          })
          
          setSeats(mappedSeats)
        } else {
          toast.error(response.message || 'Không thể tải danh sách ghế.')
          setSeats([])
        }
      } catch (error: any) {
        console.error('Error fetching seats:', error)
        toast.error('Không thể tải danh sách ghế. Vui lòng thử lại.')
        setSeats([])
      } finally {
        setIsLoadingSeats(false)
      }
    }

    fetchSeats()
  }, [selectedEvent])

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

  // Refresh seats
  const refreshSeats = () => {
    if (selectedEvent) {
      // Trigger re-fetch bằng cách set lại selectedEvent
      const currentEvent = selectedEvent
      setSelectedEvent("")
      setTimeout(() => setSelectedEvent(currentEvent), 100)
    }
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
            <label className="text-sm font-medium mb-1 block">Event</label>
            {isLoadingEvents ? (
              <div className="flex items-center gap-2 p-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="text-sm text-muted-foreground">Loading events...</span>
              </div>
            ) : (
              <Select value={selectedEvent} onValueChange={setSelectedEvent}>
                <SelectTrigger>
                  <SelectValue placeholder="Chọn sự kiện" />
                </SelectTrigger>
                <SelectContent>
                  {events.length === 0 ? (
                    <div className="p-2 text-sm text-muted-foreground">Chưa có sự kiện nào</div>
                  ) : (
                    events.map((event) => (
                      <SelectItem key={event.eventId} value={event.eventId}>
                        {event.title}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            )}
          </div>
          <div className="flex items-end">
            <Button 
              variant="outline" 
              onClick={refreshSeats}
              disabled={!selectedEvent || isLoadingSeats}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isLoadingSeats ? 'animate-spin' : ''}`} />
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
                {selectedEvent ? events.find(e => e.eventId === selectedEvent)?.title : 'Seat Map'}
              </CardTitle>
              <CardDescription>Click on a seat to view details or change status</CardDescription>
            </CardHeader>
            <CardContent className="pb-6">
              {isLoadingSeats ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : !selectedEvent ? (
                <div className="text-center py-12 text-muted-foreground">
                  Vui lòng chọn một sự kiện để xem sơ đồ ghế
                </div>
              ) : seats.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  Sự kiện này chưa có ghế nào
                </div>
              ) : (
                <>
                  {/* Stage */}
                  <div className="bg-muted rounded-lg p-3 text-center text-sm font-medium text-muted-foreground mb-6">
                    STAGE
                  </div>

                  {/* Seats */}
                  <div className="space-y-2 overflow-x-auto pb-4">
                    {Object.entries(seatsByRow).map(([row, rowSeats]) => (
                      <div key={row} className="flex items-center gap-2">
                        <span className="w-6 text-sm font-medium text-muted-foreground flex-shrink-0">{row}</span>
                        <div className="flex gap-1 flex-wrap">
                          {rowSeats.map((seat) => (
                            <button
                              key={seat.id}
                              onClick={() => handleSeatClick(seat)}
                              disabled={seat.status === "blocked"}
                              className={cn(
                                "w-8 h-8 rounded text-xs font-medium border transition-colors flex-shrink-0",
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
                  </>
                )}
            </CardContent>
          </Card>

          {/* Seat Details Panel */}
          <div className="space-y-4 lg:col-span-1">
            {/* Stats */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Seat Statistics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 pb-6">
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
                <CardContent className="space-y-3 pb-6">
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

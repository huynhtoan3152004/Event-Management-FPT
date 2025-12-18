/* ============================================
   Staff Event Selection Page - Redesigned
   Compact event selection with check-in stats preview
   Select event takes ~40% of page, rest shows recent check-ins
   ============================================ */

"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { toast } from "react-toastify"
import { Calendar, Clock, MapPin, ArrowRight, Search, Users, CheckCircle, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Progress } from "@/components/ui/progress"
import { eventService, EventListItem } from "@/lib/services/event.service"
import { checkInService, CheckInRecord, CheckInStats } from "@/lib/services/checkin.service"
import { useUser } from "@/hooks/use-user"

interface EventWithStats extends EventListItem {
  checkInStats?: CheckInStats
  recentCheckIns?: CheckInRecord[]
}

export default function StaffEventSelectionPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null)
  const [events, setEvents] = useState<EventWithStats[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("today")
  const { user } = useUser()

  // Fetch events
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setIsLoading(true)
        // Fetch both published and completed events for staff
        const [publishedResponse, completedResponse] = await Promise.all([
          eventService.getAllEvents({
            pageNumber: 1,
            pageSize: 100,
            status: "published",
          }),
          eventService.getAllEvents({
            pageNumber: 1,
            pageSize: 100,
            status: "completed",
          }),
        ])
        
        // Merge both responses
        const allEvents: EventListItem[] = []
        if (publishedResponse.success && publishedResponse.data) {
          allEvents.push(...publishedResponse.data)
        }
        if (completedResponse.success && completedResponse.data) {
          allEvents.push(...completedResponse.data)
        }
        
        const response = {
          success: true,
          data: allEvents,
        }

        if (response.success && response.data) {
          const eventsWithStats = await Promise.all(
            response.data.map(async (event) => {
              try {
                const statsResponse = await checkInService.getCheckInStats(event.eventId)
                const recordsResponse = await checkInService.getCheckInRecords(event.eventId)
                
                return {
                  ...event,
                  checkInStats: statsResponse.success && statsResponse.data 
                    ? statsResponse.data 
                    : {
                        checkedIn: event.registeredCount || 0,
                        totalRegistered: event.totalSeats || 0,
                        checkInRate: event.totalSeats > 0 
                          ? Math.round(((event.registeredCount || 0) / event.totalSeats) * 100) 
                          : 0,
                      },
                  recentCheckIns: recordsResponse.success ? recordsResponse.data?.slice(0, 5) : undefined,
                }
              } catch (error: any) {
                // Only log non-404 errors
                if (error?.response?.status !== 404) {
                  console.error(`Error fetching stats for event ${event.eventId}:`, error)
                }
                // Fallback to event's registered count
                return {
                  ...event,
                  checkInStats: {
                    checkedIn: event.registeredCount || 0,
                    totalRegistered: event.totalSeats || 0,
                    checkInRate: event.totalSeats > 0 
                      ? Math.round(((event.registeredCount || 0) / event.totalSeats) * 100) 
                      : 0,
                  },
                }
              }
            })
          )

          setEvents(eventsWithStats)
          
          // Select first event by default
          if (eventsWithStats.length > 0 && !selectedEventId) {
            setSelectedEventId(eventsWithStats[0].eventId)
          }
        }
      } catch (error: any) {
        console.error("Error fetching events:", error)
        toast.error("Không thể tải danh sách sự kiện")
      } finally {
        setIsLoading(false)
      }
    }

    fetchEvents()
  }, [])

  // Filter events by tab
  const getFilteredEvents = () => {
    return events.filter((event) => {
      const matchesSearch = event.title.toLowerCase().includes(searchQuery.toLowerCase())
      if (!matchesSearch) return false

      const now = new Date()
      const eventStart = new Date(`${event.date}T${event.startTime}`)
      const eventEnd = event.endTime 
        ? new Date(`${event.date}T${event.endTime}`)
        : new Date(eventStart.getTime() + 2 * 60 * 60 * 1000) // Default 2 hours if no endTime
      
      const isOngoing = now >= eventStart && now <= eventEnd
      const isUpcoming = now < eventStart

      if (activeTab === "today") {
        // "Đang diễn ra" - chỉ hiển thị event đang diễn ra
        return isOngoing
      } else if (activeTab === "upcoming") {
        // "Sắp tới" - chỉ hiển thị event chưa bắt đầu (không bao gồm event đang diễn ra)
        return isUpcoming
      } else if (activeTab === "past") {
        // "Đã qua" - chỉ hiển thị event có status là "completed"
        const status = event.status?.toLowerCase()
        // Debug: log để kiểm tra status thực tế
        if (events.length > 0 && events.indexOf(event) === 0) {
          console.log("All event statuses:", events.map(e => ({ title: e.title, status: e.status })))
        }
        return status === "completed"
      }
      return true
    })
  }

  const filteredEvents = getFilteredEvents()
  const selectedEvent = events.find((e) => e.eventId === selectedEventId)

  // Format date
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString('vi-VN', { 
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric' 
    })
  }

  // Format time
  const formatTime = (timeStr: string) => {
    return timeStr.substring(0, 5) // HH:mm
  }

  // Check if event is ongoing
  const isEventOngoing = (event: EventWithStats) => {
    if (!event) return false
    
    const now = new Date()
    const eventStart = new Date(`${event.date}T${event.startTime}`)
    const eventEnd = event.endTime 
      ? new Date(`${event.date}T${event.endTime}`)
      : new Date(eventStart.getTime() + 2 * 60 * 60 * 1000) // Default 2 hours if no endTime
    
    return now >= eventStart && now <= eventEnd
  }

  // Get event status badge config
  const getEventStatusBadge = (event: EventWithStats) => {
    const status = event.status?.toLowerCase()
    
    // Nếu event có status "completed" thì hiển thị "Đã qua"
    if (status === "completed") {
      return { label: "Đã qua", variant: "secondary" as const, className: "" }
    }
    
    // Nếu đang diễn ra
    if (isEventOngoing(event)) {
      return { label: "Đang diễn ra", variant: "default" as const, className: "bg-success" }
    }
    
    // Mặc định là "Sắp tới"
    return { label: "Sắp tới", variant: "secondary" as const, className: "" }
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto p-4 lg:p-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Chọn sự kiện để quản lý</h1>
          <p className="text-sm text-muted-foreground">
            Chào mừng trở lại, {user?.name || "Staff"}!
          </p>
        </div>
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
          <p className="text-muted-foreground">Đang tải sự kiện...</p>
        </div>
      ) : (
        <div className="grid lg:grid-cols-5 gap-6">
          {/* Left Column - Event Selection (~40%) */}
          <div className="lg:col-span-2 space-y-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Tìm kiếm sự kiện..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 h-9"
              />
            </div>

            {/* Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="h-8">
                <TabsTrigger value="today" className="text-xs h-7">
                  Đang diễn ra
                </TabsTrigger>
                <TabsTrigger value="upcoming" className="text-xs h-7">
                  Sắp tới
                </TabsTrigger>
                <TabsTrigger value="past" className="text-xs h-7">
                  Đã qua
                </TabsTrigger>
              </TabsList>
            </Tabs>

            {/* Events List - Compact Cards */}
            <div className="space-y-2 max-h-[400px] overflow-y-auto pr-1">
              {filteredEvents.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground text-sm">
                  Không có sự kiện nào
                </div>
              ) : (
                filteredEvents.map((event) => (
                  <EventSelectCard
                    key={event.eventId}
                    event={event}
                    isSelected={selectedEventId === event.eventId}
                    onSelect={() => setSelectedEventId(event.eventId)}
                    formatDate={formatDate}
                    isOngoing={isEventOngoing(event)}
                    activeTab={activeTab}
                  />
                ))
              )}
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
                        <CardTitle className="text-lg">{selectedEvent.title}</CardTitle>
                        <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3.5 w-3.5" />
                            {formatDate(selectedEvent.date)}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="h-3.5 w-3.5" />
                            {formatTime(selectedEvent.startTime)}
                          </span>
                          <span className="flex items-center gap-1">
                            <MapPin className="h-3.5 w-3.5" />
                            {selectedEvent.location || "Chưa có địa điểm"}
                          </span>
                        </div>
                      </div>
                      <Badge 
                        variant={getEventStatusBadge(selectedEvent).variant}
                        className={getEventStatusBadge(selectedEvent).className}
                      >
                        {getEventStatusBadge(selectedEvent).label}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    {/* Stats Row */}
                    <div className="grid grid-cols-3 gap-4 mb-4">
                      <div className="text-center p-3 bg-muted/50 rounded-lg">
                        <p className="text-2xl font-bold text-primary">
                          {selectedEvent.checkInStats?.checkedIn || 0}
                        </p>
                        <p className="text-xs text-muted-foreground">Đã đăng ký</p>
                      </div>
                      <div className="text-center p-3 bg-muted/50 rounded-lg">
                        <p className="text-2xl font-bold">
                          {selectedEvent.checkInStats?.totalRegistered || selectedEvent.totalSeats || 0}
                        </p>
                        <p className="text-xs text-muted-foreground">Tổng số vé</p>
                      </div>
                      <div className="text-center p-3 bg-muted/50 rounded-lg">
                        <p className="text-2xl font-bold text-success">
                          {selectedEvent.checkInStats?.checkInRate || 0}%
                        </p>
                        <p className="text-xs text-muted-foreground">Tỷ lệ</p>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="space-y-1 mb-4">
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>Tiến độ check-in</span>
                        <span>
                          {selectedEvent.checkInStats?.checkedIn || 0} / {selectedEvent.checkInStats?.totalRegistered || selectedEvent.totalSeats || 0}
                        </span>
                      </div>
                      <Progress 
                        value={selectedEvent.checkInStats?.checkInRate || 0} 
                        className="h-2" 
                      />
                    </div>

                    {/* Action Button */}
                    {isEventOngoing(selectedEvent) ? (
                      <Link href={`/staff/checkin/${selectedEvent.eventId}`}>
                        <Button className="w-full rounded-full mb-5">
                          <ArrowRight className="h-4 w-4 mr-2" />
                          Bắt đầu check-in
                        </Button>
                      </Link>
                    ) : (
                      <Button 
                        className="w-full rounded-full mb-5" 
                        disabled={true}
                      >
                        <ArrowRight className="h-4 w-4 mr-2" />
                        Chưa thể check-in
                      </Button>
                    )}
                  </CardContent>
                </Card>

                {/* Recent Check-ins Table */}
                {/* <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-success" />
                      Check-in gần đây
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    {selectedEvent.recentCheckIns && selectedEvent.recentCheckIns.length > 0 ? (
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead className="text-xs">TÊN</TableHead>
                            <TableHead className="text-xs">MÃ VÉ</TableHead>
                            <TableHead className="text-xs">THỜI GIAN</TableHead>
                            <TableHead className="text-xs">TRẠNG THÁI</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {selectedEvent.recentCheckIns.map((record) => (
                            <TableRow key={record.id}>
                              <TableCell className="font-medium text-sm py-2">
                                {record.attendeeName}
                              </TableCell>
                              <TableCell className="text-muted-foreground text-sm py-2 font-mono">
                                {record.ticketCode}
                              </TableCell>
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
                                  {record.status === "entered" ? "Đã vào" : "Đã sử dụng"}
                                </Badge>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    ) : (
                      <div className="text-center py-8 text-muted-foreground text-sm">
                        Chưa có lượt check-in nào
                      </div>
                    )}
                  </CardContent>
                </Card> */}
              </>
            ) : (
              <div className="flex items-center justify-center h-64 text-muted-foreground">
                Chọn một sự kiện để xem chi tiết
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

// Compact Event Selection Card
function EventSelectCard({
  event,
  isSelected,
  onSelect,
  formatDate,
  isOngoing,
  activeTab,
}: {
  event: EventWithStats
  isSelected: boolean
  onSelect: () => void
  formatDate: (dateStr: string) => string
  isOngoing: boolean
  activeTab: string
}) {
  // Xác định status hiển thị dựa trên status của event và activeTab
  const getEventStatus = () => {
    const status = event.status?.toLowerCase()
    
    // Nếu event có status "completed" thì hiển thị "Đã qua"
    if (status === "completed") {
      return { label: "Đã qua", variant: "secondary" as const, className: "bg-muted" }
    }
    
    // Nếu đang diễn ra
    if (isOngoing) {
      return { label: "Đang diễn ra", variant: "default" as const, className: "bg-success" }
    }
    
    // Mặc định là "Sắp tới"
    return { label: "Sắp tới", variant: "secondary" as const, className: "" }
  }

  const statusConfig = getEventStatus()

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
            <h3 className="font-medium text-sm text-foreground truncate">{event.title}</h3>
            <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                {formatDate(event.date)}
              </span>
              <span className="flex items-center gap-1">
                <Users className="h-3 w-3" />
                {event.checkInStats?.checkedIn || 0}/{event.checkInStats?.totalRegistered || event.totalSeats || 0}
              </span>
            </div>
          </div>
          <Badge 
            variant={statusConfig.variant} 
            className={`text-xs ${statusConfig.className}`}
          >
            {statusConfig.label}
          </Badge>
        </div>
      </CardContent>
    </Card>
  )
}

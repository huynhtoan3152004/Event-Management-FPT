/* ============================================
   Student Dashboard Home Page
   Shows welcome message, upcoming events, 
   today's ticket, and recent attendance
   ============================================ */

"use client"

import { useEffect, useMemo, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { Calendar, QrCode, Loader2, MapPin, Users } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { toast } from "react-toastify"
import { useFadeInOnScroll } from "@/hooks/use-gsap"
import { useUser } from "@/hooks/use-user"
import { eventService, EventListItem } from "@/lib/services/event.service"
import { ticketService, TicketDto } from "@/lib/services/ticket.service"

export default function StudentDashboardPage() {
  const sectionRef = useFadeInOnScroll<HTMLDivElement>()
  const { user } = useUser()

  const [events, setEvents] = useState<EventListItem[]>([])
  const [tickets, setTickets] = useState<TicketDto[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true)
        const [eventsRes, ticketsRes] = await Promise.all([
          eventService.getAllEvents({ pageNumber: 1, pageSize: 12, status: "published" }),
          ticketService.getMyTickets(),
        ])

        if (eventsRes.success && eventsRes.data) {
          const sorted = [...eventsRes.data].sort(
            (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
          )
          setEvents(sorted)
        } else {
          toast.error(eventsRes.message || "Không thể tải danh sách sự kiện")
        }

        if (ticketsRes.success && ticketsRes.data) {
          setTickets(ticketsRes.data)
        } else {
          toast.error(ticketsRes.message || "Không thể tải vé của bạn")
        }
      } catch (err: any) {
        console.error("Error loading dashboard data", err)
        toast.error("Không thể tải dữ liệu dashboard")
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [])

  const upcomingEvents = useMemo(() => events.slice(0, 3), [events])

  const todayTicket = useMemo(() => {
    const today = new Date()
    return tickets.find((t) => {
      const eventDate = new Date(t.eventDate)
      return (
        eventDate.getFullYear() === today.getFullYear() &&
        eventDate.getMonth() === today.getMonth() &&
        eventDate.getDate() === today.getDate()
      )
    })
  }, [tickets])

  const recentAttendance = useMemo(() => {
    // Dùng vé đã check-in (status used) làm lịch sử tham dự
    return tickets
      .filter((t) => t.status === "used")
      .slice(0, 5)
      .map((t) => ({
        id: t.ticketId,
        eventTitle: t.eventTitle || "Sự kiện",
        date: new Date(t.eventDate).toLocaleDateString("vi-VN"),
        status: "attended" as const,
      }))
  }, [tickets])

  const registeredEventIds = useMemo(() => {
    const ids = new Set<string>()
    tickets.forEach((t) => {
      if (t.status !== "cancelled") {
        ids.add(t.eventId)
      }
    })
    return ids
  }, [tickets])

  return (
    <div ref={sectionRef} className="space-y-6">
      {/* Welcome Section */}
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-foreground">
          Welcome back, {user?.name?.split(" ")[0] || "bạn"}!
        </h1>
        <p className="text-muted-foreground mt-1">{"Here's what's happening at FPTU today."}</p>
      </div>

      {/* Upcoming Events Section */}
      <div>
        <h2 className="text-xl font-semibold text-foreground mb-4">Upcoming Events</h2>
        {isLoading ? (
          <div className="flex items-center gap-2 text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>Đang tải sự kiện...</span>
          </div>
        ) : upcomingEvents.length === 0 ? (
          <div className="text-muted-foreground">Chưa có sự kiện</div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {upcomingEvents.map((event) => (
              <Card key={event.eventId} className="overflow-hidden hover:shadow-md transition-shadow">
                <div className="relative h-32">
                  <Image src={event.imageUrl || "/placeholder.svg"} alt={event.title} fill className="object-cover" />
                </div>
                <CardContent className="p-4">
                  <h3 className="font-semibold text-foreground line-clamp-1">{event.title}</h3>
                  <div className="space-y-2 text-sm text-muted-foreground mt-2">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-primary" />
                      <span>
                        {event.date}
                        {event.startTime ? ` • ${event.startTime?.substring(0, 5)}` : ""}
                      </span>
                    </div>
                    {event.location && (
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-primary" />
                        <span className="line-clamp-1">{event.location}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-primary" />
                      <span>
                        {event.registeredCount || 0}
                        {event.totalSeats ? ` / ${event.totalSeats} người` : " người"} đã đăng ký
                      </span>
                    </div>
                  </div>
                  <Link href={`/dashboard/events/${event.eventId}`}>
                    <Button className="w-full mt-4 rounded-full" variant="default">
                      {registeredEventIds.has(event.eventId) ? "Đã đăng ký" : "Đăng ký ngay"}
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Bottom Row - Ticket & Attendance */}
      <div className="grid lg:grid-cols-2 gap-6">
          {/* Today's Ticket */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">{"Today's Ticket"}</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Đang tải vé...</span>
                </div>
              ) : todayTicket ? (
                <div className="bg-muted/50 rounded-xl p-6 text-center">
                  {/* QR Code */}
                  <div className="relative w-32 h-32 mx-auto mb-4 bg-card rounded-lg p-2">
                    <Image
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=320x320&data=${encodeURIComponent(todayTicket.ticketCode)}`}
                      alt="Ticket QR Code"
                      fill
                      className="object-contain"
                    />
                  </div>

                  {/* Event Info */}
                  <h3 className="font-semibold text-foreground">{todayTicket.eventTitle}</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    {new Date(todayTicket.eventDate).toLocaleDateString("vi-VN")} -{" "}
                    {todayTicket.eventStartTime?.substring(0, 5) || ""}
                  </p>

                  <Button className="mt-4 rounded-full bg-transparent" variant="outline" asChild>
                    <Link href={`/dashboard/tickets`}>
                      <QrCode className="h-4 w-4 mr-2" />
                      Xem vé
                    </Link>
                  </Button>
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">Hôm nay bạn chưa có vé</div>
              )}
            </CardContent>
          </Card>

        {/* Recent Attendance */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Recent Attendance</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center gap-2 text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Đang tải...</span>
              </div>
            ) : recentAttendance.length === 0 ? (
              <div className="text-muted-foreground">Chưa có lịch sử tham dự</div>
            ) : (
              <div className="space-y-4 mb-5">
                {recentAttendance.map((record) => (
                  <div key={record.id} className="flex items-center justify-between py-3 border-b last:border-0">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center ${
                          record.status === "attended" ? "bg-success/10" : "bg-destructive/10"
                        }`}
                      >
                        {record.status === "attended" ? (
                          <span className="text-success text-lg">✓</span>
                        ) : (
                          <span className="text-destructive text-lg">✗</span>
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-foreground text-sm">{record.eventTitle}</p>
                        <p className="text-xs text-muted-foreground">{record.date}</p>
                      </div>
                    </div>
                    <Badge variant={record.status === "attended" ? "default" : "destructive"} className="capitalize">
                      {record.status === "attended" ? "Attended" : "Missed"}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

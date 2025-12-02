/* ============================================
   Student Dashboard Home Page
   Shows welcome message, upcoming events, 
   today's ticket, and recent attendance
   ============================================ */

"use client"

import Image from "next/image"
import Link from "next/link"
import { Calendar, QrCode } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { MOCK_STUDENT_USER, MOCK_EVENTS, MOCK_TICKETS, MOCK_ATTENDANCE } from "@/lib/constants"
import { useFadeInOnScroll } from "@/hooks/use-gsap"

export default function StudentDashboardPage() {
  const sectionRef = useFadeInOnScroll<HTMLDivElement>()
  const user = MOCK_STUDENT_USER
  const upcomingEvents = MOCK_EVENTS.slice(0, 3)
  const todayTicket = MOCK_TICKETS[0]
  const recentAttendance = MOCK_ATTENDANCE

  return (
    <div ref={sectionRef} className="space-y-6">
      {/* Welcome Section */}
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-foreground">Welcome back, {user.name.split(" ")[0]}!</h1>
        <p className="text-muted-foreground mt-1">{"Here's what's happening at FPTU today."}</p>
      </div>

      {/* Upcoming Events Section */}
      <div>
        <h2 className="text-xl font-semibold text-foreground mb-4">Upcoming Events</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {upcomingEvents.map((event) => (
            <Card key={event.id} className="overflow-hidden hover:shadow-md transition-shadow">
              <div className="relative h-32">
                <Image src={event.imageUrl || "/placeholder.svg"} alt={event.title} fill className="object-cover" />
              </div>
              <CardContent className="p-4">
                <h3 className="font-semibold text-foreground line-clamp-1">{event.title}</h3>
                <div className="flex items-center gap-2 text-sm text-muted-foreground mt-2">
                  <Calendar className="h-4 w-4" />
                  <span>{event.date}</span>
                </div>
                <Link href={`/dashboard/events/${event.id}`}>
                  <Button
                    className="w-full mt-4 rounded-full"
                    variant={event.status === "upcoming" ? "default" : "outline"}
                  >
                    {event.status === "upcoming" ? "Register Now" : "View Details"}
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Bottom Row - Ticket & Attendance */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Today's Ticket */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">{"Today's Ticket"}</CardTitle>
          </CardHeader>
          <CardContent>
            {todayTicket ? (
              <div className="bg-muted/50 rounded-xl p-6 text-center">
                {/* QR Code */}
                <div className="relative w-32 h-32 mx-auto mb-4 bg-card rounded-lg p-2">
                  <Image
                    src={todayTicket.qrCode || "/placeholder.svg"}
                    alt="Ticket QR Code"
                    fill
                    className="object-contain"
                  />
                </div>

                {/* Event Info */}
                <h3 className="font-semibold text-foreground">{todayTicket.eventTitle}</h3>
                <p className="text-sm text-muted-foreground mt-1">Today, 18:00 - Hall A</p>

                <Button className="mt-4 rounded-full bg-transparent" variant="outline">
                  <QrCode className="h-4 w-4 mr-2" />
                  View Ticket
                </Button>
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">No tickets for today</div>
            )}
          </CardContent>
        </Card>

        {/* Recent Attendance */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Recent Attendance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
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
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

/* ============================================
   My Tickets Page
   View all tickets and their QR codes
   ============================================ */

"use client"

import Image from "next/image"
import { QrCode, Calendar, MapPin, Download } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { MOCK_TICKETS, MOCK_EVENTS } from "@/lib/constants"

export default function MyTicketsPage() {
  // Combine ticket data with event details
  const ticketsWithEvents = MOCK_TICKETS.map((ticket) => {
    const event = MOCK_EVENTS.find((e) => e.id === ticket.eventId)
    return { ...ticket, event }
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">My Tickets</h1>
        <p className="text-muted-foreground">Manage and view your event tickets</p>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="upcoming">
        <TabsList>
          <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
          <TabsTrigger value="used">Used</TabsTrigger>
          <TabsTrigger value="expired">Expired</TabsTrigger>
        </TabsList>

        <TabsContent value="upcoming" className="mt-6">
          <div className="grid md:grid-cols-2 gap-6">
            {ticketsWithEvents.map((ticket) => (
              <TicketCard key={ticket.id} ticket={ticket} />
            ))}

            {/* Additional mock ticket for demo */}
            <TicketCard
              ticket={{
                id: "2",
                eventId: "3",
                eventTitle: "FPTU Music Festival 2024",
                userId: "student-1",
                ticketCode: "FPTU...M3F",
                qrCode: "/placeholder.svg?key=59k4h",
                status: "valid",
                event: MOCK_EVENTS[2],
              }}
            />
          </div>
        </TabsContent>

        <TabsContent value="used" className="mt-6">
          <div className="text-center py-12 text-muted-foreground">No used tickets</div>
        </TabsContent>

        <TabsContent value="expired" className="mt-6">
          <div className="text-center py-12 text-muted-foreground">No expired tickets</div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

// Ticket Card Component
function TicketCard({ ticket }: { ticket: any }) {
  return (
    <Card className="overflow-hidden">
      <div className="relative h-32 bg-gradient-to-br from-primary/20 to-accent/20">
        {ticket.event?.imageUrl && (
          <Image
            src={ticket.event.imageUrl || "/placeholder.svg"}
            alt={ticket.eventTitle}
            fill
            className="object-cover opacity-50"
          />
        )}
        <div className="absolute inset-0 flex items-center justify-center">
          <Badge variant={ticket.status === "valid" ? "default" : "secondary"} className="text-sm">
            {ticket.status === "valid" ? "Valid" : ticket.status}
          </Badge>
        </div>
      </div>

      <CardContent className="p-6">
        <div className="flex gap-6">
          {/* QR Code */}
          <div className="shrink-0">
            <div className="w-24 h-24 bg-card border rounded-lg p-2">
              <div className="relative w-full h-full">
                <Image src={ticket.qrCode || "/placeholder.svg"} alt="Ticket QR" fill className="object-contain" />
              </div>
            </div>
            <p className="text-xs text-center text-muted-foreground mt-2">{ticket.ticketCode}</p>
          </div>

          {/* Ticket Details */}
          <div className="flex-1 space-y-3">
            <h3 className="font-semibold text-lg text-foreground">{ticket.eventTitle}</h3>

            <div className="space-y-2 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                <span>
                  {ticket.event?.date || "Today"} - {ticket.event?.time || "18:00"}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                <span>{ticket.event?.location || "Hall A"}</span>
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <Button size="sm" className="rounded-full">
                <QrCode className="h-4 w-4 mr-2" />
                Show QR
              </Button>
              <Button size="sm" variant="outline" className="rounded-full bg-transparent">
                <Download className="h-4 w-4 mr-2" />
                Download
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

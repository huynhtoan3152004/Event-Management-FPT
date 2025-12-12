/* ============================================
   My Tickets Page
   View all tickets and their QR codes
   ============================================ */

"use client"

import { useState, useEffect, ReactElement } from "react"
import Image from "next/image"
import { QrCode, Calendar, MapPin, Download, Loader2, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ticketService, TicketDto } from "@/lib/services/ticket.service"
import { toast } from "react-toastify"
import { eventService } from "@/lib/services/event.service"

export default function MyTicketsPage() {
  const [tickets, setTickets] = useState<TicketDto[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("upcoming")
  const [qrModalUrl, setQrModalUrl] = useState<string>("")
  const [qrTicketCode, setQrTicketCode] = useState<string>("")
  const [eventLocations, setEventLocations] = useState<Record<string, string>>({})
  const [eventImages, setEventImages] = useState<Record<string, string>>({})

  // Fetch tickets từ API
  useEffect(() => {
    const fetchTickets = async () => {
      try {
        setIsLoading(true)
        const response = await ticketService.getMyTickets()
        
        if (response.success && response.data) {
          setTickets(response.data)
          
          // Fetch event details (location and image) for each ticket
          const locationMap: Record<string, string> = {}
          const imageMap: Record<string, string> = {}
          const uniqueEventIds = [...new Set(response.data.map(t => t.eventId))]
          
          await Promise.all(
            uniqueEventIds.map(async (eventId) => {
              try {
                const eventResponse = await eventService.getEventById(eventId)
                if (eventResponse.success && eventResponse.data) {
                  locationMap[eventId] = eventResponse.data.location || "Chưa có địa điểm"
                  imageMap[eventId] = eventResponse.data.imageUrl || "/placeholder.svg"
                }
              } catch (error) {
                console.error(`Error fetching event ${eventId}:`, error)
                locationMap[eventId] = "Chưa có địa điểm"
                imageMap[eventId] = "/placeholder.svg"
              }
            })
          )
          
          setEventLocations(locationMap)
          setEventImages(imageMap)
        } else {
          toast.error(response.message || "Không thể tải danh sách vé")
        }
      } catch (error: any) {
        console.error("Error fetching tickets:", error)
        toast.error("Không thể tải danh sách vé. Vui lòng thử lại.")
      } finally {
        setIsLoading(false)
      }
    }

    fetchTickets()
  }, [])

  // Filter tickets theo status
  const getFilteredTickets = () => {
    const now = new Date()
    
    return tickets.filter((ticket) => {
      const eventDate = new Date(`${ticket.eventDate}T${ticket.eventEndTime}`)
      
      if (activeTab === "upcoming") {
        // Upcoming: event chưa diễn ra và ticket status là active
        return eventDate > now && ticket.status === "active"
      } else if (activeTab === "used") {
        // Used: ticket status là used
        return ticket.status === "used"
      } else if (activeTab === "expired") {
        // Expired: event đã qua và ticket vẫn active (chưa được check-in) hoặc cancelled
        return (eventDate < now && ticket.status === "active") || ticket.status === "cancelled"
      }
      return false
    })
  }

  const filteredTickets = getFilteredTickets()

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

  // Show QR Code modal
  const showQRCode = (ticketCode: string) => {
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=320x320&data=${encodeURIComponent(ticketCode)}`
    setQrModalUrl(qrUrl)
    setQrTicketCode(ticketCode)
  }

  // Generate QR code URL for thumbnail
  const getQRCodeUrl = (ticketCode: string) => {
    return `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(ticketCode)}`
  }

  // Get status badge
  const getStatusBadge = (status: string) => {
    if (status === "active") {
      return <Badge variant="default" className="text-sm">Đã đăng ký, chưa check-in</Badge>
    } else if (status === "used") {
      return <Badge variant="secondary" className="text-sm">Đã check-in ✓✓</Badge>
    } else if (status === "cancelled") {
      return <Badge variant="destructive" className="text-sm">Đã hủy ✗</Badge>
    } else {
      return <Badge variant="outline" className="text-sm">{status}</Badge>
    }
  }

  return (
    <>
      <div className="space-y-6 bg-background min-h-screen p-4 lg:p-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-foreground">My Tickets</h1>
          <p className="text-muted-foreground">Manage and view your event tickets</p>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="upcoming">Sắp tới</TabsTrigger>
            <TabsTrigger value="used">Đã sử dụng</TabsTrigger>
            <TabsTrigger value="expired">Hết hạn</TabsTrigger>
          </TabsList>

          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20 space-y-4 mt-6">
              <Loader2 className="h-12 w-12 animate-spin text-primary" />
              <p className="text-muted-foreground">Đang tải vé...</p>
            </div>
          ) : filteredTickets.length === 0 ? (
            <TabsContent value={activeTab} className="mt-6">
              <div className="text-center py-12 text-muted-foreground">
                {activeTab === "upcoming" && "Chưa có vé sắp tới"}
                {activeTab === "used" && "Chưa có vé đã sử dụng"}
                {activeTab === "expired" && "Chưa có vé hết hạn"}
              </div>
            </TabsContent>
          ) : (
            <TabsContent value={activeTab} className="mt-6">
              <div className="grid md:grid-cols-2 gap-6">
                {filteredTickets.map((ticket) => (
                  <TicketCard
                    key={ticket.ticketId}
                    ticket={ticket}
                    location={eventLocations[ticket.eventId] || "Chưa có địa điểm"}
                    eventImage={eventImages[ticket.eventId] || "/placeholder.svg"}
                    onShowQR={showQRCode}
                    getQRCodeUrl={getQRCodeUrl}
                    getStatusBadge={getStatusBadge}
                    formatDate={formatDate}
                    formatTime={formatTime}
                  />
                ))}
              </div>
            </TabsContent>
          )}
        </Tabs>
      </div>

      {/* QR Code Modal */}
      {qrModalUrl && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="w-full max-w-md rounded-xl bg-background shadow-2xl border">
            <div className="flex items-center justify-between border-b px-4 py-3">
              <div className="font-semibold text-lg">QR Code vé</div>
              <button
                onClick={() => {
                  setQrModalUrl("")
                  setQrTicketCode("")
                }}
                className="p-1 rounded-full hover:bg-muted transition"
                aria-label="Close QR modal"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="px-4 py-5 space-y-3 text-center">
              <div className="text-sm text-muted-foreground">Mã vé</div>
              <div className="font-semibold text-lg break-all">{qrTicketCode}</div>
              <div className="flex justify-center">
                <img
                  src={qrModalUrl}
                  alt="QR Code"
                  className="h-64 w-64 rounded-lg border bg-white p-3 object-contain"
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Quét QR để check-in. Bạn có thể lưu ảnh QR này.
              </p>
            </div>
            <div className="flex justify-end gap-2 border-t px-4 py-3">
              <Button
                variant="outline"
                onClick={() => {
                  setQrModalUrl("")
                  setQrTicketCode("")
                }}
              >
                Đóng
              </Button>
              <Button asChild>
                <a href={qrModalUrl} download={`ticket-${qrTicketCode}.png`} target="_blank" rel="noopener noreferrer">
                  Tải QR
                </a>
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

// Ticket Card Component
interface TicketCardProps {
  ticket: TicketDto
  location: string
  eventImage: string
  onShowQR: (ticketCode: string) => void
  getQRCodeUrl: (ticketCode: string) => string
  getStatusBadge: (status: string) => ReactElement
  formatDate: (dateStr: string) => string
  formatTime: (timeStr: string) => string
}

function TicketCard({
  ticket,
  location,
  eventImage,
  onShowQR,
  getQRCodeUrl,
  getStatusBadge,
  formatDate,
  formatTime,
}: TicketCardProps) {
  const qrCodeUrl = getQRCodeUrl(ticket.ticketCode)

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow bg-background">
      <div className="relative h-32 overflow-hidden">
        <Image
          src={eventImage}
          alt={ticket.eventTitle || "Event"}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, 50vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/0 to-black/0" />
      </div>

      <CardContent className="p-6">
        <div className="flex gap-6">
          {/* QR Code Thumbnail */}
          <div className="shrink-0">
            <div className="w-24 h-24 bg-card border rounded-lg p-2">
              <div className="relative w-full h-full">
                <img
                  src={qrCodeUrl}
                  alt="Ticket QR"
                  className="w-full h-full object-contain"
                />
              </div>
            </div>
            <p className="text-xs text-center text-muted-foreground mt-2 break-all">
              {ticket.ticketCode.substring(0, 12)}...
            </p>
          </div>

          {/* Ticket Details */}
          <div className="flex-1 space-y-3">
            <div className="flex items-start justify-between gap-2">
              <h3 className="font-semibold text-lg text-foreground line-clamp-2 flex-1">
                {ticket.eventTitle || "Sự kiện"}
              </h3>
            </div>

            <div className="space-y-2 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-primary flex-shrink-0" />
                <span>
                  {formatDate(ticket.eventDate)} - {formatTime(ticket.eventStartTime)}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-primary flex-shrink-0" />
                <span className="line-clamp-1">{location}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground">Ghế:</span>
                <span className="font-medium text-primary">
                  {ticket.seatNumber || "Chưa có ghế"}
                </span>
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <Button
                size="sm"
                className="rounded-full"
                onClick={() => onShowQR(ticket.ticketCode)}
              >
                <QrCode className="h-4 w-4 mr-2" />
                Xem QR
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="rounded-full"
                onClick={() => {
                  const qrUrl = getQRCodeUrl(ticket.ticketCode)
                  const link = document.createElement('a')
                  link.href = qrUrl
                  link.download = `ticket-${ticket.ticketCode}.png`
                  link.target = '_blank'
                  link.click()
                }}
              >
                <Download className="h-4 w-4 mr-2" />
                Tải xuống
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

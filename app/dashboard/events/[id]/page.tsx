/* ============================================
   Student Event Detail Page
   Xem chi tiết sự kiện và đăng ký
   ============================================ */

"use client"

import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { toast } from "react-toastify"
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  Tag,
  ArrowLeft,
  Loader2,
  User,
  Building2,
  Ticket,
  CheckCircle2,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"
import { eventService, EventDetailDto, SeatDto } from "@/lib/services/event.service"
import { ticketService, RegisterTicketRequest } from "@/lib/services/ticket.service"


export default function StudentEventDetailPage() {
  const router = useRouter()
  const params = useParams()
  const eventId = params.id as string

  const [event, setEvent] = useState<EventDetailDto | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isRegistering, setIsRegistering] = useState(false)
  const [seats, setSeats] = useState<SeatDto[]>([])
  const [isLoadingSeats, setIsLoadingSeats] = useState(false)
  const [selectedSeatId, setSelectedSeatId] = useState<string>("")
  const [seatPreference, setSeatPreference] = useState<string>("")

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        setIsLoading(true)
        const response = await eventService.getEventById(eventId)
        
        if (response.success && response.data) {
          setEvent(response.data)
          // Fetch seats if event has hall
          if (response.data.hallId) {
            fetchSeats(eventId)
          }
        } else {
          toast.error(response.message || "Không tìm thấy sự kiện")
          router.push("/dashboard/events")
        }
      } catch (error: any) {
        console.error("Error fetching event:", error)
        toast.error("Không thể tải thông tin sự kiện. Vui lòng thử lại.")
        router.push("/dashboard/events")
      } finally {
        setIsLoading(false)
      }
    }

    if (eventId) {
      fetchEvent()
    }
  }, [eventId, router])

  const fetchSeats = async (eventId: string) => {
    try {
      setIsLoadingSeats(true)
      const response = await eventService.getEventSeats(eventId)
      if (response.success && response.data) {
        setSeats(response.data)
      } else {
        // Nếu không có ghế hoặc lỗi, set empty array
        setSeats([])
      }
    } catch (error: any) {
      console.error("Error fetching seats:", error)
      // Không hiển thị error nếu không có ghế, chỉ log và set empty
      setSeats([])
    } finally {
      setIsLoadingSeats(false)
    }
  }

  const handleRegister = async () => {
    if (!event) return

    // Kiểm tra điều kiện đăng ký
    if (!isRegistrationOpen) {
      toast.warning("Sự kiện chưa mở đăng ký hoặc đã đóng đăng ký")
      return
    }

    if (availableSeats <= 0) {
      toast.warning("Sự kiện đã hết chỗ")
      return
    }

    try {
      setIsRegistering(true)
      
      // Tạo request body theo đúng format backend yêu cầu
      const request: RegisterTicketRequest = {}
      
      // Nếu có chọn ghế cụ thể, gửi seatId
      if (selectedSeatId && selectedSeatId.trim()) {
        request.seatId = selectedSeatId.trim()
      }
      
      // Nếu không chọn ghế cụ thể nhưng có preference, gửi seatPreference
      // (Backend hiện chưa xử lý seatPreference, nhưng vẫn gửi để tương thích)
      if (seatPreference && seatPreference.trim() && !selectedSeatId) {
        request.seatPreference = seatPreference.trim()
      }

      // Gọi API đăng ký
      const response = await ticketService.registerTicket(eventId, request)
      
      if (response.success && response.data) {
        toast.success(response.message || "Đăng ký thành công!")
        
        // Refresh event data để cập nhật số lượng đăng ký
        const eventResponse = await eventService.getEventById(eventId)
        if (eventResponse.success && eventResponse.data) {
          setEvent(eventResponse.data)
        }
        
        // Refresh danh sách ghế nếu event có hall
        if (event.hallId) {
          await fetchSeats(eventId)
        }
        
        // Reset form
        setSelectedSeatId("")
        setSeatPreference("")
      } else {
        // Hiển thị error message từ backend
        const errorMessage = response.message || "Đăng ký thất bại. Vui lòng thử lại."
        toast.error(errorMessage)
      }
    } catch (error: any) {
      console.error("Error registering ticket:", error)
      // Error đã được xử lý trong axios interceptor, 
      // nhưng vẫn log để debug nếu cần
      if (error.response?.data?.message) {
        toast.error(error.response.data.message)
      } else {
        toast.error("Có lỗi xảy ra khi đăng ký. Vui lòng thử lại.")
      }
    } finally {
      setIsRegistering(false)
    }
  }

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString('vi-VN', { 
      weekday: 'long',
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric' 
    })
  }

  const formatTime = (timeStr: string) => {
    return timeStr.substring(0, 5) // HH:mm
  }

  const formatDateTime = (dateTimeStr?: string) => {
    if (!dateTimeStr) return "Chưa thiết lập"
    const date = new Date(dateTimeStr)
    return date.toLocaleString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
      published: { label: "Đã xuất bản", variant: "default" },
      draft: { label: "Bản nháp", variant: "secondary" },
      pending: { label: "Chờ duyệt", variant: "outline" },
      cancelled: { label: "Đã hủy", variant: "destructive" },
      completed: { label: "Hoàn thành", variant: "default" },
    }

    const config = statusConfig[status] || { label: status, variant: "outline" as const }
    return <Badge variant={config.variant} className="capitalize">{config.label}</Badge>
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-64 w-full" />
        <div className="grid md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-4">
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-32 w-full" />
          </div>
          <div className="space-y-4">
            <Skeleton className="h-48 w-full" />
          </div>
        </div>
      </div>
    )
  }

  if (!event) {
    return null
  }

  const registeredCount = event.registeredCount || 0
  const totalSeats = event.totalSeats || 0
  const availableSeats = totalSeats - registeredCount
  const percentage = totalSeats > 0 ? Math.round((registeredCount / totalSeats) * 100) : 0
  
  // Kiểm tra đăng ký mở: event phải published, có thời gian đăng ký, và trong khoảng thời gian đăng ký
  const now = new Date()
  const isRegistrationOpen = event.status === "published" 
    && event.registrationStart 
    && event.registrationEnd
    && now >= new Date(event.registrationStart) 
    && now <= new Date(event.registrationEnd)
    && availableSeats > 0

  return (
    <div className="space-y-6 bg-gradient-to-br from-background via-muted/20 to-background min-h-screen -m-4 lg:-m-6 p-4 lg:p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header Actions */}
        <div className="flex items-center justify-between">
          <Link href="/dashboard/events">
            <Button variant="outline" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Quay lại
            </Button>
          </Link>
        </div>

        {/* Event Image */}
        <Card className="overflow-hidden border-2 shadow-lg">
          <div className="relative w-full h-80 overflow-hidden">
            <Image
              src={event.imageUrl || "/placeholder.svg"}
              alt={event.title}
              fill
              className="object-cover"
              sizes="100vw"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/0 to-black/0" />
            <div className="absolute bottom-6 left-6 right-6 text-white">
              <div className="flex items-center gap-3 mb-2">
                {getStatusBadge(event.status)}
              </div>
              <h1 className="text-3xl sm:text-4xl font-bold mb-2">{event.title}</h1>
              {event.description && (
                <p className="text-lg text-white/90 line-clamp-2">{event.description}</p>
              )}
            </div>
          </div>
        </Card>

        {/* Main Content */}
        <div className="grid md:grid-cols-3 gap-6">
          {/* Left Column - Main Info */}
          <div className="md:col-span-2 space-y-6">
            {/* Event Details */}
            <Card className="border-2 shadow-lg">
              <CardHeader className="bg-gradient-to-r from-primary/5 to-primary/10 border-b">
                <CardTitle className="text-xl flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-primary" />
                  Thông tin sự kiện
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      <span>Ngày diễn ra</span>
                    </div>
                    <p className="font-semibold">{formatDate(event.date)}</p>
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Clock className="h-4 w-4" />
                      <span>Thời gian</span>
                    </div>
                    <p className="font-semibold">
                      {formatTime(event.startTime)} - {formatTime(event.endTime)}
                    </p>
                  </div>
                  {event.location && (
                    <div className="space-y-1 md:col-span-2">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <MapPin className="h-4 w-4" />
                        <span>Địa điểm</span>
                      </div>
                      <p className="font-semibold">{event.location}</p>
                    </div>
                  )}
                  {event.hallName && (
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Building2 className="h-4 w-4" />
                        <span>Hội trường</span>
                      </div>
                      <p className="font-semibold">{event.hallName}</p>
                    </div>
                  )}
                  {event.clubName && (
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Users className="h-4 w-4" />
                        <span>Câu lạc bộ</span>
                      </div>
                      <p className="font-semibold">{event.clubName}</p>
                    </div>
                  )}
                </div>

                {event.description && (
                  <>
                    <Separator />
                    <div className="space-y-2">
                      <h3 className="font-semibold">Mô tả</h3>
                      <p className="text-muted-foreground whitespace-pre-wrap">{event.description}</p>
                    </div>
                  </>
                )}

                {event.tags && (
                  <>
                    <Separator />
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Tag className="h-4 w-4" />
                        <span>Tags</span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {event.tags.split(',').map((tag, index) => (
                          <Badge key={index} variant="secondary">{tag.trim()}</Badge>
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Speakers */}
            {event.speakers && event.speakers.length > 0 && (
              <Card className="border-2 shadow-lg">
                <CardHeader className="bg-gradient-to-r from-primary/5 to-primary/10 border-b">
                  <CardTitle className="text-xl flex items-center gap-2">
                    <User className="h-5 w-5 text-primary" />
                    Diễn giả
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="grid md:grid-cols-2 gap-4">
                    {event.speakers.map((speaker) => (
                      <div key={speaker.speakerId} className="flex items-start gap-3 p-3 rounded-lg border bg-card">
                        {speaker.imageUrl && (
                          <Image
                            src={speaker.imageUrl}
                            alt={speaker.name}
                            width={48}
                            height={48}
                            className="rounded-full object-cover"
                          />
                        )}
                        <div className="flex-1 space-y-1">
                          <p className="font-semibold">{speaker.name}</p>
                          {speaker.title && (
                            <p className="text-sm text-muted-foreground">{speaker.title}</p>
                          )}
                          {speaker.organization && (
                            <p className="text-xs text-muted-foreground">{speaker.organization}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Right Column - Registration */}
          <div className="space-y-6">
            {/* Registration Card */}
            <Card className="border-2 shadow-lg sticky top-24">
              <CardHeader className="bg-gradient-to-r from-primary/5 to-primary/10 border-b">
                <CardTitle className="text-xl flex items-center gap-2">
                  <Ticket className="h-5 w-5 text-primary" />
                  Đăng ký tham gia
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                {/* Registration Status */}
                {isRegistrationOpen ? (
                  <div className="p-4 rounded-lg bg-green-50 border border-green-200">
                    <div className="flex items-center gap-2 text-green-700 mb-2">
                      <CheckCircle2 className="h-5 w-5" />
                      <span className="font-semibold">Đang mở đăng ký</span>
                    </div>
                    <p className="text-sm text-green-600">
                      Bạn có thể đăng ký tham gia sự kiện này
                    </p>
                  </div>
                ) : (
                  <div className="p-4 rounded-lg bg-muted border">
                    <p className="text-sm text-muted-foreground">
                      {!event.registrationStart 
                        ? "Chưa mở đăng ký"
                        : new Date() < new Date(event.registrationStart!)
                          ? `Đăng ký sẽ mở vào: ${formatDateTime(event.registrationStart)}`
                          : "Đã đóng đăng ký"}
                    </p>
                  </div>
                )}

                {/* Stats */}
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Tổng số ghế</span>
                    <span className="font-semibold">{totalSeats}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Đã đăng ký</span>
                    <span className="font-semibold text-primary">{registeredCount}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Còn trống</span>
                    <span className="font-semibold text-green-600">{availableSeats}</span>
                  </div>
                  <Separator />
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Tỷ lệ đăng ký</span>
                      <span className="font-semibold text-primary">{percentage}%</span>
                    </div>
                    <div className="h-3 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-primary to-primary/80 rounded-full transition-all duration-500"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Seat Selection */}
                {isRegistrationOpen && availableSeats > 0 && event.hallId && (
                  <>
                    <Separator />
                    <div className="space-y-3">
                      <label className="text-sm font-semibold">Chọn ghế (tùy chọn)</label>
                      
                      {isLoadingSeats ? (
                        <div className="flex items-center justify-center py-4">
                          <Loader2 className="h-5 w-5 animate-spin text-primary" />
                          <span className="ml-2 text-sm text-muted-foreground">Đang tải danh sách ghế...</span>
                        </div>
                      ) : seats.length > 0 ? (
                        <div className="space-y-2">
                          <select
                            value={selectedSeatId}
                            onChange={(e) => setSelectedSeatId(e.target.value)}
                            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 bg-background"
                          >
                            <option value="">Tự động chọn ghế</option>
                            {seats.map((seat) => (
                              <option key={seat.seatId} value={seat.seatId}>
                                {seat.seatNumber} {seat.rowLabel ? `(${seat.rowLabel})` : ''}
                              </option>
                            ))}
                          </select>
                          <p className="text-xs text-muted-foreground">
                            {selectedSeatId 
                              ? `Đã chọn: ${seats.find(s => s.seatId === selectedSeatId)?.seatNumber}`
                              : "Hệ thống sẽ tự động chọn ghế trống cho bạn"}
                          </p>
                        </div>
                      ) : (
                        <p className="text-sm text-muted-foreground">
                          Hệ thống sẽ tự động chọn ghế trống cho bạn
                        </p>
                      )}
                    </div>
                  </>
                )}

                {/* Register Button */}
                {isRegistrationOpen && availableSeats > 0 ? (
                  <Button 
                    className="w-full rounded-full h-11 text-base font-semibold bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary shadow-lg hover:shadow-xl transition-all duration-300"
                    onClick={handleRegister}
                    disabled={isRegistering}
                  >
                    {isRegistering ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Đang xử lý...
                      </>
                    ) : (
                      <>
                        <Ticket className="h-4 w-4 mr-2" />
                        Đăng ký ngay
                      </>
                    )}
                  </Button>
                ) : (
                  <Button 
                    className="w-full rounded-full h-11 text-base font-semibold"
                    variant="outline"
                    disabled
                  >
                    {availableSeats === 0 ? "Đã hết chỗ" : "Chưa mở đăng ký"}
                  </Button>
                )}

                {/* Registration Period */}
                {(event.registrationStart || event.registrationEnd) && (
                  <>
                    <Separator />
                    <div className="space-y-3 text-sm">
                      <div className="space-y-1">
                        <div className="text-muted-foreground">Thời gian đăng ký</div>
                        <p className="font-semibold">
                          {formatDateTime(event.registrationStart)} - {formatDateTime(event.registrationEnd)}
                        </p>
                      </div>
                      {event.maxTicketsPerUser && (
                        <div className="space-y-1">
                          <div className="text-muted-foreground">Số vé tối đa/người</div>
                          <p className="font-semibold">{event.maxTicketsPerUser}</p>
                        </div>
                      )}
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}


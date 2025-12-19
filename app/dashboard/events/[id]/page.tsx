/* ============================================
   STUDENT EVENT DETAIL PAGE - Trang chi tiết sự kiện và đăng ký
   
   MÔ TẢ:
   - Trang này cho phép sinh viên xem chi tiết sự kiện và đăng ký tham gia
   - Hiển thị đầy đủ thông tin: tiêu đề, mô tả, ngày giờ, địa điểm, diễn giả, số ghế
   - Cho phép chọn ghế (nếu event có hall)
   - Xử lý đăng ký vé và hiển thị QR code sau khi đăng ký thành công
   
   API ĐƯỢC GỌI:
   1. GET /api/Events/{eventId} - Lấy chi tiết sự kiện (eventService.getEventById)
      - Dữ liệu trả về: EventDetailDto từ bảng Events
      - Bao gồm: title, description, date, startTime, endTime, location, hallId, 
        hallName, organizerName, totalSeats, registeredCount, speakers, etc.
   
   2. GET /api/Events/{eventId}/seats - Lấy danh sách ghế (eventService.getEventSeats)
      - Dữ liệu trả về: SeatDto[] từ bảng Seats
      - Filter theo eventId
      - Bao gồm: seatId, seatNumber, rowLabel, status (available/reserved/occupied/blocked)
   
   3. GET /api/users/me/tickets - Kiểm tra đã đăng ký chưa (ticketService.getMyTickets)
      - Dữ liệu trả về: TicketDto[] từ bảng Tickets
      - Mục đích: Kiểm tra xem user đã có ticket với eventId này chưa
   
   4. POST /api/Events/{eventId}/register - Đăng ký vé (ticketService.registerTicket)
      - Body: { seatId?: string, seatPreference?: string }
      - Dữ liệu trả về: TicketDto (ticketId, ticketCode, status, etc.)
      - Backend sẽ:
        + Tạo record mới trong bảng Tickets
        + Gán ghế (nếu có seatId hoặc tự động chọn ghế trống)
        + Cập nhật Events.registeredCount
        + Cập nhật Seats.status = "reserved" (nếu có ghế)
   
   5. GET /api/tickets/{ticketCode} - Lấy thông tin vé theo mã (ticketService.getTicketByCode)
      - Dữ liệu trả về: TicketDto từ bảng Tickets
      - Mục đích: Lấy thông tin vé sau khi đăng ký để hiển thị QR
   
   BẢNG DATABASE LIÊN QUAN:
   - events: Thông tin sự kiện (eventId, title, date, startTime, endTime, location, 
            hallId, status, totalSeats, registeredCount, registrationStart, registrationEnd)
   - tickets: Thông tin vé (ticketId, eventId, studentId, seatId, ticketCode, status, registeredAt)
   - seats: Thông tin ghế (seatId, eventId, hallId, seatNumber, rowLabel, status)
   - event_speakers: Quan hệ nhiều-nhiều giữa Events và Speakers
   - speakers: Thông tin diễn giả (speakerId, name, title, organization, imageUrl)
   
   LOGIC QUAN TRỌNG:
   1. Kiểm tra đăng ký mở:
      - event.status === "published"
      - Có registrationStart và registrationEnd
      - now >= registrationStart && now <= registrationEnd
      - availableSeats > 0
   
   2. Chọn ghế:
      - Nếu event có hallId, fetch danh sách ghế
      - User có thể chọn ghế cụ thể hoặc để hệ thống tự chọn
      - Chỉ ghế có status = "available" mới được chọn
   
   3. Đăng ký vé:
      - Gửi seatId nếu user đã chọn ghế
      - Backend tự động chọn ghế trống nếu không có seatId
      - Sau khi đăng ký thành công, tạo QR code từ ticketCode
      - Refresh lại event data để cập nhật số lượng đăng ký
   ============================================ */

"use client"

import { useEffect, useMemo, useState } from "react"
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
  X,
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
  const eventId = params.id as string  // Lấy eventId từ URL params

  // State quản lý dữ liệu sự kiện
  const [event, setEvent] = useState<EventDetailDto | null>(null)  // Chi tiết sự kiện từ Events table
  const [isLoading, setIsLoading] = useState(true)  // Loading khi fetch event
  
  // State quản lý đăng ký
  const [isRegistering, setIsRegistering] = useState(false)  // Loading khi đang đăng ký
  const [hasRegistered, setHasRegistered] = useState(false)  // Đã đăng ký chưa (từ Tickets table)
  
  // State quản lý ghế
  const [seats, setSeats] = useState<SeatDto[]>([])  // Danh sách ghế từ Seats table
  const [isLoadingSeats, setIsLoadingSeats] = useState(false)  // Loading khi fetch seats
  const [selectedSeatId, setSelectedSeatId] = useState<string>("")  // Ghế đã chọn (seatId)
  const [seatPreference, setSeatPreference] = useState<string>("")  // Preference (chưa dùng)
  const [isSeatGridOpen, setIsSeatGridOpen] = useState(false)  // Mở modal chọn ghế
  
  // State quản lý QR code
  const [qrModalUrl, setQrModalUrl] = useState<string>("")  // URL QR code (từ qrserver.com)
  const [qrTicketCode, setQrTicketCode] = useState<string>("")  // Mã vé để tạo QR

  /**
   * MEMOIZED: NHÓM GHẾ THEO ROW
   * 
   * Logic:
   * - Nhóm các ghế theo rowLabel (từ Seats.rowLabel)
   * - Sắp xếp ghế trong mỗi row theo seatNumber (numeric sort)
   * - Sắp xếp các row theo thứ tự alphabet
   * 
   * Dữ liệu từ: seats (SeatDto[] từ Seats table)
   * Sử dụng: Hiển thị grid chọn ghế trong modal
   * 
   * Re-compute khi: seats thay đổi
   */
  const groupedSeats = useMemo(() => {
    const groups = seats.reduce<Record<string, SeatDto[]>>((acc, seat) => {
      const row = seat.rowLabel || "Row"
      acc[row] = acc[row] || []
      acc[row].push(seat)
      return acc
    }, {})
    return Object.entries(groups)
      .map(([row, rowSeats]) => ({
        row,
        seats: rowSeats.sort((a, b) => a.seatNumber.localeCompare(b.seatNumber, undefined, { numeric: true })),
      }))
      .sort((a, b) => a.row.localeCompare(b.row))
  }, [seats])

  /**
   * MEMOIZED: TÍNH SỐ GHẾ TỐI ĐA TRONG 1 ROW
   * 
   * Mục đích: Để layout grid chọn ghế đều nhau
   * Dữ liệu từ: groupedSeats
   * 
   * Re-compute khi: groupedSeats thay đổi
   */
  const maxSeatsPerRow = useMemo(
    () => groupedSeats.reduce((m, g) => Math.max(m, g.seats.length), 0),
    [groupedSeats]
  )

  /**
   * EFFECT: FETCH CHI TIẾT SỰ KIỆN
   * 
   * API: GET /api/Events/{eventId}
   * Service: eventService.getEventById()
   * 
   * Dữ liệu trả về: EventDetailDto từ bảng Events
   * - Bao gồm: eventId, title, description, date, startTime, endTime, location,
   *   hallId, hallName, organizerName, status, totalSeats, registeredCount,
   *   registrationStart, registrationEnd, speakers, etc.
   * 
   * Logic sau khi fetch:
   * - Nếu event có hallId, tự động fetch danh sách ghế
   * - Nếu không tìm thấy event, redirect về trang danh sách
   * 
   * Chạy lại khi: eventId hoặc router thay đổi
   */
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

  /**
   * EFFECT: KIỂM TRA USER ĐÃ ĐĂNG KÝ CHƯA
   * 
   * API: GET /api/users/me/tickets
   * Service: ticketService.getMyTickets()
   * 
   * Dữ liệu trả về: TicketDto[] từ bảng Tickets
   * - Filter theo studentId = user hiện tại
   * - Bao gồm: ticketId, eventId, status, ticketCode, etc.
   * 
   * Logic:
   * - Kiểm tra xem có ticket nào với eventId này và status != "cancelled"
   * - Set hasRegistered = true nếu đã đăng ký
   * 
   * Mục đích: 
   * - Disable button đăng ký nếu đã đăng ký
   * - Ẩn form chọn ghế nếu đã đăng ký
   * 
   * Chạy lại khi: eventId thay đổi
   */
  useEffect(() => {
    const checkRegistered = async () => {
      if (!eventId) return
      try {
        const res = await ticketService.getMyTickets()
        if (res.success && res.data) {
          const existed = res.data.some(
            (t) => t.eventId === eventId && t.status !== "cancelled"
          )
          setHasRegistered(existed)
        }
      } catch (err) {
        console.error("Không kiểm tra được trạng thái đăng ký", err)
      }
    }
    checkRegistered()
  }, [eventId])

  /**
   * HÀM FETCH DANH SÁCH GHẾ
   * 
   * API: GET /api/Events/{eventId}/seats
   * Service: eventService.getEventSeats()
   * 
   * Dữ liệu trả về: SeatDto[] từ bảng Seats
   * - Filter theo eventId
   * - Bao gồm: seatId, seatNumber, rowLabel, status (available/reserved/occupied/blocked)
   * 
   * Logic:
   * - Chỉ fetch nếu event có hallId
   * - Nếu không có ghế hoặc lỗi, set empty array (không hiển thị error)
   * 
   * Sử dụng: Hiển thị grid chọn ghế trong modal
   */
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

  /**
   * HÀM XỬ LÝ ĐĂNG KÝ VÉ
   * 
   * API: POST /api/Events/{eventId}/register
   * Service: ticketService.registerTicket()
   * 
   * Request Body:
   * - seatId?: string - ID ghế đã chọn (từ Seats.seatId)
   * - seatPreference?: string - Preference (chưa dùng)
   * 
   * Backend xử lý:
   * 1. Kiểm tra điều kiện đăng ký:
   *    - Event status = "published"
   *    - Trong thời gian đăng ký (registrationStart <= now <= registrationEnd)
   *    - Còn ghế trống (availableSeats > 0)
   *    - User chưa đăng ký hoặc chưa đạt maxTicketsPerUser
   * 
   * 2. Tạo record mới trong bảng Tickets:
   *    - ticketId: GUID mới
   *    - eventId: ID sự kiện
   *    - studentId: ID user hiện tại (từ token)
   *    - seatId: Ghế đã chọn hoặc tự động chọn ghế trống
   *    - ticketCode: Mã vé duy nhất (để tạo QR)
   *    - status: "active"
   *    - registeredAt: Thời gian hiện tại
   * 
   * 3. Cập nhật bảng Events:
   *    - registeredCount += 1
   * 
   * 4. Cập nhật bảng Seats (nếu có ghế):
   *    - status = "reserved" (ghế đã được đặt)
   * 
   * Response: TicketDto
   * - ticketId, ticketCode, status, eventId, seatId, etc.
   * 
   * Logic sau khi đăng ký thành công:
   * 1. Tạo QR code từ ticketCode (dùng qrserver.com API)
   * 2. Hiển thị modal QR code
   * 3. Refresh event data để cập nhật số lượng đăng ký
   * 4. Refresh danh sách ghế để cập nhật status
   * 5. Set hasRegistered = true
   * 
   * Validation trước khi gọi API:
   * - Kiểm tra isRegistrationOpen (status + thời gian + còn ghế)
   * - Kiểm tra availableSeats > 0
   */
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

      // Gọi API đăng ký - Tạo record trong bảng Tickets
      const response = await ticketService.registerTicket(eventId, request)
      
      if (response.success && response.data) {
        toast.success(response.message || "Đăng ký thành công!")
        
        // Lấy ticketCode để fetch chi tiết/QR
        const ticketCode = response.data.ticketCode

        // Tạo QR code bằng third-party (qrserver) và hiển thị modal tại chỗ
        // QR code chứa ticketCode để staff scan khi check-in
        const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=320x320&data=${encodeURIComponent(ticketCode)}`
        setQrModalUrl(qrUrl)
        setQrTicketCode(ticketCode)
        setHasRegistered(true)

        // Gọi song song 2 API: danh sách vé của user và chi tiết vé theo code (để lấy QR hoặc hiển thị)
        try {
          const [myTicketsRes, ticketByCodeRes] = await Promise.all([
            ticketService.getMyTickets(),  // GET /api/users/me/tickets
            ticketService.getTicketByCode(ticketCode),  // GET /api/tickets/{ticketCode}
          ])

          if (myTicketsRes.success) {
            console.log("📥 My tickets:", myTicketsRes.data)
          }
          if (ticketByCodeRes.success) {
            console.log("📥 Ticket by code:", ticketByCodeRes.data)
            toast.info(`Mã vé của bạn: ${ticketCode}`)
          }
        } catch (fetchTicketErr) {
          console.warn("Không tải được thông tin vé sau đăng ký", fetchTicketErr)
        }

        // Refresh event data để cập nhật số lượng đăng ký (registeredCount đã tăng)
        const eventResponse = await eventService.getEventById(eventId)
        if (eventResponse.success && eventResponse.data) {
          setEvent(eventResponse.data)
        }
        
        // Refresh danh sách ghế nếu event có hall (để cập nhật status ghế đã chọn)
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

  const closeSeatModal = () => setIsSeatGridOpen(false)

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
      published: { label: "Sắp diễn ra", variant: "default" },
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

  // Tính toán số liệu từ dữ liệu Events table
  const registeredCount = event.registeredCount || 0  // Số người đã đăng ký (từ Events.registered_count)
  const totalSeats = event.totalSeats || 0            // Tổng số ghế (từ Events.total_seats)
  const availableSeats = totalSeats - registeredCount  // Số ghế còn trống
  const percentage = totalSeats > 0 ? Math.round((registeredCount / totalSeats) * 100) : 0  // Tỷ lệ đăng ký (%)
  
  /**
   * KIỂM TRA ĐĂNG KÝ CÓ MỞ KHÔNG
   * 
   * Điều kiện đăng ký mở:
   * 1. event.status === "published" (sự kiện đã được publish)
   * 2. Có registrationStart và registrationEnd (đã set thời gian đăng ký)
   * 3. Thời gian hiện tại >= registrationStart (đã đến thời gian mở đăng ký)
   * 4. Thời gian hiện tại <= registrationEnd (chưa hết thời gian đăng ký)
   * 5. availableSeats > 0 (còn ghế trống)
   * 
   * Dữ liệu từ bảng Events:
   * - status: Trạng thái sự kiện
   * - registrationStart: Thời gian bắt đầu đăng ký (DateTime)
   * - registrationEnd: Thời gian kết thúc đăng ký (DateTime)
   * - registeredCount, totalSeats: Để tính availableSeats
   */
  const now = new Date()
  const isRegistrationOpen = event.status === "published" 
    && event.registrationStart 
    && event.registrationEnd
    && now >= new Date(event.registrationStart) 
    && now <= new Date(event.registrationEnd)
    && availableSeats > 0
  
  /**
   * KIỂM TRA ĐĂNG KÝ ĐÃ ĐÓNG THEO THỜI GIAN
   * 
   * Logic: Đăng ký đã đóng khi:
   * - Event đã published
   * - Có thời gian đăng ký
   * - Thời gian hiện tại > registrationEnd (hết thời gian) HOẶC < registrationStart (chưa đến)
   * 
   * Dữ liệu từ bảng Events: registrationStart, registrationEnd
   */
  const isRegistrationClosedByTime = event.status === "published"
    && event.registrationStart
    && event.registrationEnd
    && (now > new Date(event.registrationEnd) || now < new Date(event.registrationStart))
  
  const registrationCtaLabel = (() => {
    if (hasRegistered) return "Đã đăng ký"
    if (isRegistrationOpen) return "Đăng ký ngay"
    if (isRegistrationClosedByTime) return "Hết thời gian đăng ký"
    return "Chưa mở đăng ký"
  })()
  const registrationEnded = event.registrationEnd ? now > new Date(event.registrationEnd) : false

  return (
    <>
    <div className="space-y-6 bg-background min-h-screen p-4 lg:p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header Actions */}
        <div className="flex items-center justify-between">
          <Button
            variant="outline"
            className="gap-2"
            onClick={() => {
              // quay lại trang trước; nếu không có history thì fallback về /dashboard/events
              if (window.history.length > 1) {
                router.back()
              } else {
                router.push("/dashboard/events")
              }
            }}
          >
            <ArrowLeft className="h-4 w-4" />
            Quay lại
          </Button>
        </div>

        {/* Event Image */}
        <Card className="overflow-hidden border-2 shadow-lg bg-background">
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
            <Card className="border-2 shadow-lg bg-background">
              <CardHeader className="border-b">
                <CardTitle className="text-xl flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-primary" />
                  Thông tin sự kiện
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 pt-0 space-y-4">
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
              <Card className="border-2 shadow-lg bg-background">
                <CardHeader className="border-b">
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
            <Card className="border-2 shadow-lg sticky top-24 bg-background">
              <CardHeader className="border-b">
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
                        : now < new Date(event.registrationStart!)
                          ? `Đăng ký sẽ mở vào: ${formatDateTime(event.registrationStart)}`
                          : registrationEnded
                            ? "Hết thời gian đăng ký"
                            : "Chưa mở đăng ký"}
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

                {/* Seat Selection (ẩn chọn ghế khi đã đăng ký, chỉ xem thông tin) */}
                {(event.hallId && availableSeats > 0) && (
                  <>
                    <Separator />
                    <div className="space-y-3">
                      <label className="text-sm font-semibold">Ghế (tùy chọn)</label>
                      
                      {hasRegistered ? (
                        <p className="text-sm text-muted-foreground">
                          Bạn đã đăng ký, không thể chọn ghế.
                        </p>
                      ) : isLoadingSeats ? (
                        <div className="flex items-center justify-center py-4">
                          <Loader2 className="h-5 w-5 animate-spin text-primary" />
                          <span className="ml-2 text-sm text-muted-foreground">Đang tải danh sách ghế...</span>
                        </div>
                      ) : seats.length > 0 ? (
                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">
                              {selectedSeatId
                                ? `Đã chọn: ${seats.find((s) => s.seatId === selectedSeatId)?.seatNumber}`
                                : "Chưa chọn ghế. Có thể để hệ thống tự chọn."}
                            </span>
                            <Button size="sm" variant="outline" onClick={() => setIsSeatGridOpen(true)} >
                              Mở danh sách ghế
                            </Button>
                          </div>
                          <div className="text-xs text-muted-foreground">
                            Bạn có thể chọn hoặc bỏ chọn ghế trong cửa sổ danh sách ghế.
                          </div>
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
                    disabled={isRegistering || hasRegistered}
                  >
                    {isRegistering ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Đang xử lý...
                      </>
                    ) : (
                      <>
                        <Ticket className="h-4 w-4 mr-2" />
                        {registrationCtaLabel}
                      </>
                    )}
                  </Button>
                ) : (
                  <Button 
                    className="w-full rounded-full h-11 text-base font-semibold"
                    variant="outline"
                    disabled
                  >
                    {availableSeats === 0
                      ? "Đã hết chỗ"
                      : hasRegistered
                        ? "Đã đăng ký"
                        : registrationEnded
                          ? "Hết thời gian đăng ký"
                          : "Chưa mở đăng ký"}
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

    {/* Seat modal (grid chọn ghế) */}
    {isSeatGridOpen && (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-2 md:px-4">
        <div className="w-full max-w-5xl rounded-xl bg-background shadow-2xl border">
          <div className="flex items-center justify-between border-b px-4 py-3">
            <div className="font-semibold text-lg">Chọn ghế</div>
            <button
              onClick={closeSeatModal}
              className="p-1 rounded-full hover:bg-muted transition"
              aria-label="Close seat grid"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="space-y-3 px-4 py-4 text-sm md:px-6 md:py-5">
            {/* Legend */}
            <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
              <div className="flex items-center gap-2">
                <span className="h-4 w-4 rounded bg-emerald-200 border border-emerald-300" /> Available
              </div>
              <div className="flex items-center gap-2">
                <span className="h-4 w-4 rounded bg-amber-200 border border-amber-300" /> Reserved
              </div>
              <div className="flex items-center gap-2">
                <span className="h-4 w-4 rounded bg-rose-200 border border-rose-300" /> Occupied
              </div>
              <div className="flex items-center gap-2">
                <span className="h-4 w-4 rounded bg-slate-200 border border-slate-300" /> Blocked
              </div>
            </div>

            {/* Seat grid */}
            <div className="space-y-2 rounded-lg border bg-muted/30 p-3 md:p-4 max-h-[75vh] overflow-auto overflow-x-auto">
              <div className="space-y-2 min-w-[700px]">
                {groupedSeats.map(({ row, seats: rowSeats }) => (
                  <div
                    key={row}
                    className="grid items-center gap-2"
                    style={{ gridTemplateColumns: `auto repeat(${maxSeatsPerRow || 1}, minmax(42px, 1fr))` }}
                  >
                    <span className="text-sm font-semibold text-muted-foreground text-right pr-1">{row}</span>
                    {rowSeats.map((seat) => {
                      const isSelected = selectedSeatId === seat.seatId
                      const base =
                        seat.status === "available"
                          ? "bg-emerald-100 hover:bg-emerald-200 text-emerald-800 border-emerald-200"
                          : seat.status === "reserved"
                            ? "bg-amber-100 text-amber-800 border-amber-200 cursor-not-allowed"
                            : seat.status === "occupied"
                              ? "bg-rose-100 text-rose-800 border-rose-200 cursor-not-allowed"
                              : "bg-slate-100 text-slate-700 border-slate-200 cursor-not-allowed"

                      return (
                        <button
                          key={seat.seatId}
                          type="button"
                          onClick={() => {
                            if (seat.status !== "available") return
                            setSelectedSeatId(isSelected ? "" : seat.seatId)
                          }}
                          className={`h-9 w-10 rounded border text-xs font-semibold transition ${
                            isSelected ? "ring-2 ring-primary ring-offset-2" : ""
                          } ${base}`}
                          disabled={seat.status !== "available"}
                          title={`${seat.seatNumber} - ${seat.status}`}
                        >
                          {seat.seatNumber}
                        </button>
                      )
                    })}
                    {/* Fillers to align columns */}
                    {Array.from({ length: Math.max(0, maxSeatsPerRow - rowSeats.length) }).map((_, idx) => (
                      <div key={`filler-${row}-${idx}`} />
                    ))}
                  </div>
                ))}
              </div>
            </div>

            <div className="text-xs text-muted-foreground">
              {selectedSeatId
                ? `Đã chọn: ${seats.find((s) => s.seatId === selectedSeatId)?.seatNumber}`
                : "Nếu không chọn, hệ thống sẽ tự động chọn ghế trống cho bạn."}
            </div>
          </div>

          <div className="flex justify-end gap-2 border-t px-4 py-3">
            <Button variant="outline" onClick={closeSeatModal}>
              Đóng
            </Button>
            <Button onClick={closeSeatModal}>Xong</Button>
          </div>
        </div>
      </div>
    )}

    {/* QR Code modal */}
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


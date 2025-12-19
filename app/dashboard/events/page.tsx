/* ============================================
   STUDENT EVENTS PAGE - Trang danh sách sự kiện cho sinh viên
   
   MÔ TẢ:
   - Trang này cho phép sinh viên xem danh sách tất cả sự kiện có sẵn
   - Sinh viên có thể tìm kiếm, lọc theo trạng thái (sắp diễn ra, đang diễn ra, đã đăng ký, đã hoàn thành)
   - Hiển thị thông tin: tiêu đề, ngày giờ, địa điểm, số người đã đăng ký, tỷ lệ đăng ký
   - Cho phép xem chi tiết và đăng ký sự kiện
   
   API ĐƯỢC GỌI:
   1. GET /api/Events - Lấy danh sách sự kiện (từ eventService.getAllEvents)
      - Query params: pageNumber, pageSize, status
      - Dữ liệu trả về: Danh sách EventListItem từ bảng Events
   
   2. GET /api/users/me/tickets - Lấy danh sách vé của user hiện tại (từ ticketService.getMyTickets)
      - Dữ liệu trả về: Danh sách TicketDto từ bảng Tickets
      - Mục đích: Xác định sự kiện nào user đã đăng ký để hiển thị badge "Đã đăng ký"
   
   BẢNG DATABASE LIÊN QUAN:
   - events: Lưu thông tin sự kiện (title, date, startTime, endTime, location, status, totalSeats, registeredCount...)
   - tickets: Lưu thông tin vé đăng ký (ticketId, eventId, studentId, status, registeredAt...)
   
   LOGIC QUAN TRỌNG:
   1. Filter sự kiện theo tab:
      - "published": Sự kiện có status="published" và chưa bắt đầu (now < startDateTime)
      - "active": Sự kiện đang diễn ra (status="published" và now >= startDateTime && now <= endDateTime)
      - "registered": Sự kiện mà user đã đăng ký (có ticket với status != "cancelled")
      - "completed": Sự kiện đã hoàn thành (status="completed")
   
   2. Kiểm tra đã đăng ký: Dựa vào danh sách tickets, tạo Set các eventId đã đăng ký
   
   3. Tìm kiếm: Filter theo title hoặc description chứa searchQuery
   ============================================ */

"use client"

import { useState, useEffect, useMemo } from "react"
import Image from "next/image"
import Link from "next/link"
import { Calendar, MapPin, Users, Search, Filter, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { eventService, EventListItem } from "@/lib/services/event.service"
import { ticketService, TicketDto } from "@/lib/services/ticket.service"
import { toast } from "react-toastify"

export default function StudentEventsPage() {
  // State quản lý tìm kiếm
  const [searchQuery, setSearchQuery] = useState("")
  
  // State lưu danh sách sự kiện từ API
  const [events, setEvents] = useState<EventListItem[]>([])
  
  // State lưu danh sách vé của user (để xác định đã đăng ký sự kiện nào)
  const [tickets, setTickets] = useState<TicketDto[]>([])
  
  // State loading khi fetch dữ liệu
  const [isLoading, setIsLoading] = useState(true)
  
  // State tab hiện tại: "published", "active", "registered", "completed"
  const [activeTab, setActiveTab] = useState("published")

  /**
   * HÀM KIỂM TRA SỰ KIỆN ĐANG DIỄN RA
   * 
   * Logic: Sự kiện đang diễn ra khi:
   * - Status = "published" (đã được publish)
   * - Thời gian hiện tại >= thời gian bắt đầu
   * - Thời gian hiện tại <= thời gian kết thúc
   * 
   * Dữ liệu từ: event.date, event.startTime, event.endTime từ bảng Events
   */
  const isEventOngoing = (event: EventListItem): boolean => {
    const now = new Date()
    const startDateTime = new Date(`${event.date}T${event.startTime}`)
    const endDateTime = new Date(`${event.date}T${event.endTime}`)
    
    // Event is ongoing if: status is published AND current time is between start and end
    return (
      event.status === "published" &&
      now >= startDateTime &&
      now <= endDateTime
    )
  }

  /**
   * HÀM KIỂM TRA SỰ KIỆN SẮP DIỄN RA (chưa bắt đầu)
   * 
   * Logic: Sự kiện sắp diễn ra khi:
   * - Status = "published" (đã được publish)
   * - Thời gian hiện tại < thời gian bắt đầu
   * 
   * Dữ liệu từ: event.date, event.startTime từ bảng Events
   */
  const isEventUpcoming = (event: EventListItem): boolean => {
    const now = new Date()
    const startDateTime = new Date(`${event.date}T${event.startTime}`)
    
    // Event is upcoming if: status is published AND current time is before start
    return (
      event.status === "published" &&
      now < startDateTime
    )
  }

  /**
   * EFFECT: FETCH DANH SÁCH SỰ KIỆN TỪ API
   * 
   * API: GET /api/Events
   * Service: eventService.getAllEvents()
   * 
   * Query params gửi lên:
   * - pageNumber: 1
   * - pageSize: 50
   * - status: Tùy theo activeTab (trừ "active" và "registered" sẽ filter sau)
   * 
   * Dữ liệu trả về: PagedResponse<EventListItem>
   * - Lấy từ bảng Events trong database
   * - Bao gồm: eventId, title, description, date, startTime, endTime, location, 
   *   imageUrl, status, totalSeats, registeredCount, etc.
   * 
   * Logic filter sau khi nhận dữ liệu:
   * - "published": Filter sự kiện sắp diễn ra (chưa bắt đầu)
   * - "active": Filter sự kiện đang diễn ra
   * - "registered": Filter sự kiện user đã đăng ký (dựa vào tickets)
   * - "completed": Filter sự kiện đã hoàn thành
   * 
   * Chạy lại khi: activeTab thay đổi
   */
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setIsLoading(true)
        // Optimize: Giảm pageSize nếu không cần thiết, chỉ fetch khi cần
        const response = await eventService.getAllEvents({
          pageNumber: 1,
          pageSize: 50, // Giảm từ 100 xuống 50 để load nhanh hơn
          status: activeTab === "active" || activeTab === "registered" ? undefined : activeTab, // active và registered sẽ filter sau
        })
        
        if (response.success && response.data) {
          let filteredData = response.data
          
          // Filter upcoming events (sắp diễn ra - chưa bắt đầu)
          if (activeTab === "published") {
            filteredData = response.data.filter(isEventUpcoming)
          }
          
          // Filter ongoing events (đang diễn ra)
          if (activeTab === "active") {
            filteredData = response.data.filter(isEventOngoing)
          }
          
          // Filter registered events (cần check user đã đăng ký - tạm thời lấy tất cả published)
          if (activeTab === "registered") {
            // TODO: Filter events mà user đã đăng ký
            filteredData = response.data.filter(e => e.status === "published")
          }
          
          // Filter completed events
          if (activeTab === "completed") {
            filteredData = response.data.filter(e => e.status === "completed")
          }
          
          setEvents(filteredData)
        }
      } catch (error: any) {
        console.error("Error fetching events:", error)
        toast.error("Không thể tải danh sách sự kiện. Vui lòng thử lại.")
      } finally {
        setIsLoading(false)
      }
    }

    fetchEvents()
  }, [activeTab])

  /**
   * EFFECT: FETCH DANH SÁCH VÉ CỦA USER
   * 
   * API: GET /api/users/me/tickets
   * Service: ticketService.getMyTickets()
   * 
   * Dữ liệu trả về: ApiResponse<TicketDto[]>
   * - Lấy từ bảng Tickets trong database
   * - Filter theo studentId = user hiện tại
   * - Bao gồm: ticketId, ticketCode, eventId, status, seatId, etc.
   * 
   * Mục đích: 
   * - Xác định sự kiện nào user đã đăng ký
   * - Hiển thị badge "Đã đăng ký" trên event card
   * - Filter tab "registered" để chỉ hiển thị sự kiện đã đăng ký
   * 
   * Chạy 1 lần khi component mount
   */
  useEffect(() => {
    const fetchTickets = async () => {
      try {
        const res = await ticketService.getMyTickets()
        if (res.success && res.data) {
          setTickets(res.data)
        }
      } catch (err) {
        console.error("Error fetching tickets", err)
      }
    }
    fetchTickets()
  }, [])

  /**
   * MEMOIZED: TẠO SET CÁC EVENT ID ĐÃ ĐĂNG KÝ
   * 
   * Logic:
   * - Duyệt qua danh sách tickets
   * - Lấy eventId của các ticket có status != "cancelled"
   * - Tạo Set để lookup nhanh O(1)
   * 
   * Sử dụng: 
   * - Kiểm tra event đã đăng ký trong EventCard component
   * - Filter tab "registered"
   * 
   * Re-compute khi: tickets thay đổi
   */
  const registeredEventIds = useMemo(() => {
    const ids = new Set<string>()
    tickets.forEach((t) => {
      if (t.status !== "cancelled") ids.add(t.eventId)
    })
    return ids
  }, [tickets])

  /**
   * FILTER SỰ KIỆN THEO TÌM KIẾM VÀ TAB
   * 
   * Logic:
   * 1. Tìm kiếm: Kiểm tra title hoặc description có chứa searchQuery (case-insensitive)
   * 2. Tab "registered": Chỉ hiển thị sự kiện có eventId trong registeredEventIds
   * 3. Các tab khác: Hiển thị tất cả sự kiện match search query
   * 
   * Dữ liệu từ:
   * - events: Danh sách đã filter theo tab
   * - searchQuery: Từ input tìm kiếm
   * - registeredEventIds: Set các eventId đã đăng ký
   */
  const filteredEvents = events.filter((event) => {
    const matchesSearch =
      event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.description?.toLowerCase().includes(searchQuery.toLowerCase())

    if (!matchesSearch) return false
    if (activeTab === "registered") {
      return registeredEventIds.has(event.eventId)
    }
    return true
  })

  return (
    <div className="space-y-6 bg-gradient-to-br from-background via-muted/20 to-background min-h-screen -m-4 lg:-m-6 p-4 lg:p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
            Khám phá sự kiện
          </h1>
          <p className="text-muted-foreground text-sm sm:text-base">
            Tìm kiếm và đăng ký tham gia các sự kiện hấp dẫn tại FPTU
          </p>
        </div>

      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground z-10" />
          <Input
            placeholder="Tìm kiếm sự kiện..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 h-11 bg-background shadow-sm focus:shadow-md transition-shadow"
          />
        </div>
        <Button variant="outline" className="h-11 shadow-sm hover:shadow-md transition-shadow">
          <Filter className="h-4 w-4 mr-2" />
          Bộ lọc
        </Button>
      </div>

      {/* Tabs for filtering */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:inline-flex bg-muted/30 p-1 rounded-lg shadow-sm">
          <TabsTrigger 
            value="published"
            className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm rounded-md transition-all duration-200"
          >
            Sắp diễn ra 
          </TabsTrigger>
          <TabsTrigger 
            value="active"
            className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm rounded-md transition-all duration-200"
          >
            Đang diễn ra
          </TabsTrigger>
          <TabsTrigger 
            value="registered"
            className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm rounded-md transition-all duration-200"
          >
            Đã đăng ký
          </TabsTrigger>
          <TabsTrigger 
            value="completed"
            className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm rounded-md transition-all duration-200"
          >
            Đã hoàn thành
          </TabsTrigger>
        </TabsList>

        {isLoading ? (
          <div className="flex items-center justify-center py-12 mt-6">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : filteredEvents.length === 0 ? (
          <div className="text-center py-12 mt-6">
            <p className="text-muted-foreground">
              {searchQuery ? "Không tìm thấy sự kiện nào phù hợp." : "Chưa có sự kiện nào."}
            </p>
          </div>
        ) : (
          <TabsContent value={activeTab} className="mt-6">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredEvents.map((event) => (
                <EventCard key={event.eventId} event={event} registeredEventIds={registeredEventIds} />
              ))}
            </div>
          </TabsContent>
        )}
      </Tabs>
      </div>
    </div>
  )
}

/**
 * EVENT CARD COMPONENT - Component hiển thị thông tin 1 sự kiện
 * 
 * Props:
 * - event: EventListItem - Thông tin sự kiện từ API (bảng Events)
 * - registeredEventIds: Set<string> - Danh sách eventId đã đăng ký
 * 
 * Hiển thị:
 * - Ảnh sự kiện (imageUrl từ Events)
 * - Badge trạng thái (published, draft, pending, cancelled, completed)
 * - Tiêu đề, ngày giờ, địa điểm
 * - Số người đã đăng ký / tổng số ghế
 * - Progress bar tỷ lệ đăng ký
 * - Button "Đăng ký ngay" hoặc "Đã đăng ký" (disabled)
 * 
 * Dữ liệu từ bảng Events:
 * - title, description, date, startTime, endTime, location
 * - imageUrl, status, totalSeats, registeredCount
 */
function EventCard({
  event,
  registeredEventIds,
}: {
  event: EventListItem
  registeredEventIds: Set<string>
}) {
  /**
   * FORMAT NGÀY THEO ĐỊNH DẠNG VIỆT NAM
   * Input: "2025-01-15" (từ event.date)
   * Output: "15/01/2025"
   */
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })
  }

  /**
   * FORMAT THỜI GIAN CHỈ LẤY HH:mm
   * Input: "14:30:00" (từ event.startTime/endTime)
   * Output: "14:30"
   */
  const formatTime = (timeStr: string) => {
    return timeStr.substring(0, 5) // HH:mm
  }

  // Tính toán số liệu từ dữ liệu Events
  const registeredCount = event.registeredCount || 0  // Số người đã đăng ký (từ Events.registered_count)
  const totalSeats = event.totalSeats || 0            // Tổng số ghế (từ Events.total_seats)
  const percentage = totalSeats > 0 ? Math.round((registeredCount / totalSeats) * 100) : 0  // Tỷ lệ đăng ký (%)

  /**
   * HÀM TẠO BADGE TRẠNG THÁI SỰ KIỆN
   * 
   * Logic:
   * - Kiểm tra status từ Events.status
   * - Nếu status = "published", kiểm tra thêm có đang diễn ra không
   *   + Đang diễn ra: now >= startDateTime && now <= endDateTime
   *   + Sắp diễn ra: now < startDateTime
   * 
   * Status từ bảng Events:
   * - "draft": Bản nháp (chưa submit)
   * - "pending": Chờ duyệt (đã submit, chờ staff duyệt)
   * - "published": Đã publish (đã được duyệt, có thể đăng ký)
   * - "cancelled": Đã hủy
   * - "completed": Đã hoàn thành
   * 
   * Return: Badge component với label và variant tương ứng
   */
  const getStatusBadge = (status: string, event: EventListItem) => {
    // Check if event is ongoing
    const now = new Date()
    const startDateTime = new Date(`${event.date}T${event.startTime}`)
    const endDateTime = new Date(`${event.date}T${event.endTime}`)
    const isOngoing = status === "published" && now >= startDateTime && now <= endDateTime

    const statusConfig: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
      published: { label: isOngoing ? "Đang diễn ra" : "Sắp diễn ra", variant: isOngoing ? "default" : "default" },
      draft: { label: "Bản nháp", variant: "secondary" },
      pending: { label: "Chờ duyệt", variant: "outline" },
      cancelled: { label: "Đã hủy", variant: "destructive" },
      completed: { label: "Hoàn thành", variant: "default" },
    }

    const config = statusConfig[status] || { label: status, variant: "outline" as const }
    return <Badge variant={config.variant} className="capitalize">{config.label}</Badge>
  }

  return (
    <Card className="overflow-hidden hover:shadow-xl transition-all duration-300 group flex flex-col h-full !p-0 !gap-0 shadow-md">
      <Link href={`/dashboard/events/${event.eventId}`} className="relative w-full h-44 overflow-hidden flex-shrink-0 block">
        <Image 
          src={event.imageUrl || "/placeholder.svg"} 
          alt={event.title} 
          fill 
          className="object-cover group-hover:scale-105 transition-transform duration-500" 
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/0 to-black/0" />
        <div className="absolute top-3 left-3 z-10">
          {getStatusBadge(event.status, event)}
        </div>
      </Link>

      <CardContent className="p-4 space-y-3 flex-1 flex flex-col">
        <Link href={`/dashboard/events/${event.eventId}`} className="hover:text-primary transition-colors">
          <h3 className="font-bold text-base text-foreground line-clamp-2">
          {event.title}
        </h3>
        </Link>

        <div className="space-y-2 text-sm">
          <div className="flex items-center gap-2.5 text-muted-foreground">
            <Calendar className="h-4 w-4 text-primary flex-shrink-0" />
            <span className="line-clamp-1">
              {formatDate(event.date)} - {formatTime(event.startTime)}
            </span>
          </div>
          {event.location && (
            <div className="flex items-center gap-2.5 text-muted-foreground">
              <MapPin className="h-4 w-4 text-primary flex-shrink-0" />
              <span className="line-clamp-1">{event.location}</span>
            </div>
          )}
          <div className="flex items-center gap-2.5 text-muted-foreground">
            <Users className="h-4 w-4 text-primary flex-shrink-0" />
            <span>
              {registeredCount}/{totalSeats} người đã đăng ký
            </span>
          </div>
        </div>

        {/* Progress Bar */}
        {totalSeats > 0 && (
          <div className="space-y-1.5 pt-2 border-t">
            <div className="flex justify-between text-xs font-medium">
              <span className="text-muted-foreground">Tỷ lệ đăng ký</span>
              <span className="text-primary font-semibold">{percentage}%</span>
            </div>
            <div className="h-2 bg-muted rounded-full overflow-hidden shadow-inner">
              <div
                className="h-full bg-gradient-to-r from-primary to-primary/80 rounded-full transition-all duration-500 shadow-sm"
                style={{ width: `${percentage}%` }}
              />
            </div>
          </div>
        )}

        {/* 
          BUTTON ĐĂNG KÝ / ĐÃ ĐĂNG KÝ
          
          Logic hiển thị button:
          1. Nếu eventId có trong registeredEventIds (đã đăng ký):
             - Hiển thị "Đã đăng ký" (disabled, variant="secondary")
             - Dữ liệu từ: Tickets table (có ticket với eventId và status != "cancelled")
          
          2. Nếu event.status === "completed" (đã hoàn thành):
             - Hiển thị "Đăng ký ngay" (disabled)
             - Không cho đăng ký sự kiện đã kết thúc
          
          3. Các trường hợp khác:
             - Hiển thị "Đăng ký ngay" (clickable)
             - Link đến trang chi tiết: /dashboard/events/{eventId}
             - Tại trang chi tiết, user có thể đăng ký
        */}
        {registeredEventIds.has(event.eventId) ? (
          <Button
            variant="secondary"
            className="w-full rounded-full h-9 text-sm font-semibold shadow-sm mt-auto cursor-default"
            disabled
          >
            Đã đăng ký
          </Button>
        ) : event.status === "completed" ? (
          <Button
            variant="outline"
            className="w-full rounded-full h-9 text-sm font-semibold shadow-sm mt-auto cursor-default"
            disabled
          >
            Đăng ký ngay
          </Button>
        ) : (
        <Link href={`/dashboard/events/${event.eventId}`} className="block mt-auto">
          <Button
              variant="outline"
            className="w-full rounded-full h-9 text-sm font-semibold shadow-sm hover:bg-primary hover:text-primary-foreground hover:shadow-md transition-all duration-300"
          >
              Đăng ký ngay
          </Button>
        </Link>
        )}
      </CardContent>
    </Card>
  )
}

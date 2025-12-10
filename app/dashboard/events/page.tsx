/* ============================================
   Student Events Page
   Browse and register for events
   ============================================ */

"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { Calendar, MapPin, Users, Search, Filter, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { eventService, EventListItem } from "@/lib/services/event.service"
import { toast } from "react-toastify"

export default function StudentEventsPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [events, setEvents] = useState<EventListItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("published")

  // Fetch events from API
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setIsLoading(true)
        const response = await eventService.getAllEvents({
          pageNumber: 1,
          pageSize: 100, // Lấy nhiều events để hiển thị
          status: activeTab === "active" ? undefined : activeTab, // registered sẽ filter sau
        })
        
        if (response.success && response.data) {
          let filteredData = response.data
          
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

  // Filter events based on search query
  const filteredEvents = events.filter((event) => {
    const matchesSearch = event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         event.description?.toLowerCase().includes(searchQuery.toLowerCase())
    
    return matchesSearch
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
        <TabsList className="grid w-full grid-cols-3 lg:w-auto lg:inline-flex bg-muted/30 p-1 rounded-lg shadow-sm">
          <TabsTrigger 
            value="published"
            className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm rounded-md transition-all duration-200"
          >
            Đã xuất bản
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
                <EventCard key={event.eventId} event={event} />
              ))}
            </div>
          </TabsContent>
        )}
      </Tabs>
      </div>
    </div>
  )
}

// Event Card Component
function EventCard({
  event,
}: {
  event: EventListItem
}) {
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })
  }

  const formatTime = (timeStr: string) => {
    return timeStr.substring(0, 5) // HH:mm
  }

  const registeredCount = event.registeredCount || 0
  const totalSeats = event.totalSeats || 0
  const percentage = totalSeats > 0 ? Math.round((registeredCount / totalSeats) * 100) : 0

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

  return (
    <Card className="overflow-hidden hover:shadow-xl transition-all duration-300 group flex flex-col h-full !p-0 !gap-0 shadow-md">
      <div className="relative w-full h-44 overflow-hidden flex-shrink-0">
        <Image 
          src={event.imageUrl || "/placeholder.svg"} 
          alt={event.title} 
          fill 
          className="object-cover group-hover:scale-105 transition-transform duration-500" 
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/0 to-black/0" />
        <div className="absolute top-3 left-3 z-10">
          {getStatusBadge(event.status)}
        </div>
      </div>

      <CardContent className="p-4 space-y-3 flex-1 flex flex-col">
        <h3 className="font-bold text-base text-foreground line-clamp-2 group-hover:text-primary transition-colors">
          {event.title}
        </h3>

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

        <Link href={`/dashboard/events/${event.eventId}`} className="block mt-auto">
          <Button variant="outline" className="w-full rounded-full h-9 text-sm font-semibold shadow-sm hover:bg-primary hover:text-primary-foreground hover:shadow-md transition-all duration-300">
            Xem chi tiết
          </Button>
        </Link>
      </CardContent>
    </Card>
  )
}

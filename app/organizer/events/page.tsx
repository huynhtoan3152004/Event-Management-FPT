/* ============================================
   Organizer Events Page
   Manage all events created by organizer
   ============================================ */

"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { Plus, Search, Filter, Calendar, MapPin, Users, MoreVertical, Edit, Trash2, Eye, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { OrganizerHeader } from "@/components/organizer/header"
import { eventService, EventListItem } from "@/lib/services/event.service"
import { useUser } from "@/hooks/use-user"
import { toast } from "react-toastify"

export default function OrganizerEventsPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [events, setEvents] = useState<EventListItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("all")
  const [deletingEventId, setDeletingEventId] = useState<string | null>(null)
  const { user } = useUser()

  // Fetch events của organizer hiện tại
  const fetchEvents = async () => {
    if (!user?.userId) return
    
    try {
      setIsLoading(true)
      const response = await eventService.getAllEvents({
        organizerId: user.userId, // Chỉ lấy events của organizer hiện tại
        pageNumber: 1,
        pageSize: 100, // Lấy nhiều để hiển thị tất cả
        status: activeTab === "all" ? undefined : activeTab, // Filter theo status
      })
      
      if (response.success && response.data) {
        setEvents(response.data)
      }
    } catch (error: any) {
      console.error('Error fetching events:', error)
      toast.error('Không thể tải danh sách sự kiện. Vui lòng thử lại.')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchEvents()
  }, [user?.userId, activeTab])

  // Handle delete event
  const handleDeleteEvent = async (eventId: string, eventTitle: string) => {
    if (!confirm(`Bạn có chắc chắn muốn xóa sự kiện "${eventTitle}"? Hành động này không thể hoàn tác.`)) {
      return
    }

    try {
      setDeletingEventId(eventId)
      const response = await eventService.deleteEvent(eventId)
      
      if (response.success) {
        toast.success('Xóa sự kiện thành công!')
        // Refresh danh sách events
        await fetchEvents()
      } else {
        toast.error(response.message || 'Xóa sự kiện thất bại.')
      }
    } catch (error: any) {
      console.error('Error deleting event:', error)
      const message = error?.response?.data?.message || error?.message || 'Xóa sự kiện thất bại. Vui lòng thử lại.'
      toast.error(message)
    } finally {
      setDeletingEventId(null)
    }
  }

  // Filter events theo search query
  const filteredEvents = events.filter((event) => {
    const matchesSearch = event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         event.description?.toLowerCase().includes(searchQuery.toLowerCase())
    
    return matchesSearch
  })

  return (
    <>
      <OrganizerHeader title="My Events" />

      <main className="flex-1 p-4 lg:p-6 space-y-6 bg-gradient-to-br from-background via-muted/20 to-background min-h-screen">
        {/* Header Section */}
        <div className="space-y-2 mb-6">
          <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
            Quản lý sự kiện
          </h1>
          <p className="text-muted-foreground text-sm sm:text-base">
            Quản lý và theo dõi tất cả sự kiện của bạn
          </p>
        </div>

        {/* Actions Bar */}
        <div className="flex flex-col sm:flex-row gap-3 justify-between items-start sm:items-center">
          <div className="flex gap-2 flex-1 max-w-md">
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
              <Filter className="h-4 w-4" />
            </Button>
          </div>

          <Link href="/organizer/events/new">
            <Button className="rounded-full h-11 px-6 bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary shadow-lg hover:shadow-xl transition-all duration-300">
              <Plus className="h-4 w-4 mr-2" />
              Tạo sự kiện mới
            </Button>
          </Link>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5 lg:w-auto lg:inline-flex bg-muted/30 p-1 rounded-lg shadow-sm">
            <TabsTrigger 
              value="all" 
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm rounded-md transition-all duration-200"
            >
              Tất cả
            </TabsTrigger>
            <TabsTrigger 
              value="draft"
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm rounded-md transition-all duration-200"
            >
              Bản nháp
            </TabsTrigger>
            <TabsTrigger 
              value="published"
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm rounded-md transition-all duration-200"
            >
              Đã xuất bản
            </TabsTrigger>
            <TabsTrigger 
              value="completed"
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm rounded-md transition-all duration-200"
            >
              Hoàn thành
            </TabsTrigger>
            <TabsTrigger 
              value="cancelled"
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm rounded-md transition-all duration-200"
            >
              Đã hủy
            </TabsTrigger>
          </TabsList>

          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20 space-y-4">
              <Loader2 className="h-12 w-12 animate-spin text-primary" />
              <p className="text-muted-foreground">Đang tải sự kiện...</p>
            </div>
          ) : filteredEvents.length === 0 ? (
            <div className="text-center py-20 space-y-4">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-muted mb-4">
                <Calendar className="h-10 w-10 text-muted-foreground" />
              </div>
              <h3 className="text-xl font-semibold text-foreground">
                {searchQuery ? "Không tìm thấy sự kiện nào" : "Chưa có sự kiện nào"}
              </h3>
              <p className="text-muted-foreground max-w-md mx-auto">
                {searchQuery 
                  ? "Thử tìm kiếm với từ khóa khác hoặc xóa bộ lọc để xem tất cả sự kiện."
                  : "Bắt đầu tạo sự kiện đầu tiên của bạn để quản lý và theo dõi."}
              </p>
              {!searchQuery && (
                <Link href="/organizer/events/new">
                  <Button className="mt-4 rounded-full bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary">
                    <Plus className="h-4 w-4 mr-2" />
                    Tạo sự kiện mới
                  </Button>
                </Link>
              )}
            </div>
          ) : (
            <TabsContent value={activeTab} className="mt-6">
              <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredEvents.map((event) => (
                  <EventManagementCard 
                    key={event.eventId} 
                    event={event}
                    onDelete={handleDeleteEvent}
                  />
              ))}
            </div>
          </TabsContent>
          )}
        </Tabs>
      </main>
    </>
  )
}

// Event Management Card
function EventManagementCard({ 
  event, 
  onDelete 
}: { 
  event: EventListItem
  onDelete: (eventId: string, eventTitle: string) => void
}) {
  // Format date và time
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

  return (
    <Card className="overflow-hidden hover:shadow-xl transition-all duration-300 group flex flex-col h-full !p-0 !gap-0 shadow-md">
      <div className="relative w-full h-44 overflow-hidden flex-shrink-0">
        <Image 
          src={event.imageUrl || "/placeholder.svg"} 
          alt={event.title} 
          fill 
          className="object-cover group-hover:scale-105 transition-transform duration-500" 
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/0 to-black/0" />
        <Badge className="absolute top-3 left-3 bg-primary/90 backdrop-blur-sm capitalize shadow-lg border-0 z-10">
          {event.status === 'published' ? 'Đã xuất bản' : 
           event.status === 'draft' ? 'Bản nháp' :
           event.status === 'pending' ? 'Chờ duyệt' :
           event.status === 'cancelled' ? 'Đã hủy' :
           event.status === 'completed' ? 'Hoàn thành' :
           event.status}
        </Badge>

        {/* Actions Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="absolute top-3 right-3 p-2 bg-card/90 backdrop-blur-sm rounded-lg hover:bg-card transition-colors shadow-lg border border-border/50 z-10">
              <MoreVertical className="h-4 w-4" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem asChild>
              <Link href={`/organizer/events/${event.eventId}`} className="cursor-pointer">
              <Eye className="h-4 w-4 mr-2" />
                Xem chi tiết
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href={`/organizer/events/${event.eventId}/edit`} className="cursor-pointer">
              <Edit className="h-4 w-4 mr-2" />
                Chỉnh sửa
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem 
              className="text-destructive focus:text-destructive cursor-pointer"
              onClick={() => onDelete(event.eventId, event.title)}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Xóa
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
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

        <Link href={`/organizer/events/${event.eventId}`} className="block mt-auto">
          <Button variant="outline" className="w-full rounded-full h-9 text-sm font-semibold shadow-sm hover:bg-primary hover:text-primary-foreground hover:shadow-md transition-all duration-300">
            Quản lý sự kiện
          </Button>
        </Link>
      </CardContent>
    </Card>
  )
}

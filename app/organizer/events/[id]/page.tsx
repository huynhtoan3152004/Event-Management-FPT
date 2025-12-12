/* ============================================
   Event Detail Page (Organizer)
   Xem chi tiết sự kiện
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
  Edit,
  Trash2,
  ArrowLeft,
  Loader2,
  XCircle,
  AlertCircle,
  User,
  Building2,
  Ticket,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"
import { eventService, EventDetailDto } from "@/lib/services/event.service"
import { OrganizerHeader } from "@/components/organizer/header"

export default function EventDetailPage() {
  const router = useRouter()
  const params = useParams()
  const eventId = params.id as string

  const [event, setEvent] = useState<EventDetailDto | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        setIsLoading(true)
        const response = await eventService.getEventById(eventId)
        
        if (response.success && response.data) {
          setEvent(response.data)
        } else {
          toast.error(response.message || "Không tìm thấy sự kiện")
          router.push("/organizer/events")
        }
      } catch (error: any) {
        console.error("Error fetching event:", error)
        toast.error("Không thể tải thông tin sự kiện. Vui lòng thử lại.")
        router.push("/organizer/events")
      } finally {
        setIsLoading(false)
      }
    }

    if (eventId) {
      fetchEvent()
    }
  }, [eventId, router])

  const handleDelete = async () => {
    if (!confirm(`Bạn có chắc chắn muốn xóa sự kiện "${event?.title}"? Hành động này không thể hoàn tác.`)) {
      return
    }

    try {
      setIsDeleting(true)
      const response = await eventService.deleteEvent(eventId)
      
      if (response.success) {
        toast.success("Xóa sự kiện thành công!")
        router.push("/organizer/events")
      } else {
        toast.error(response.message || "Xóa sự kiện thất bại.")
      }
    } catch (error: any) {
      console.error("Error deleting event:", error)
      const message = error?.response?.data?.message || error?.message || "Xóa sự kiện thất bại. Vui lòng thử lại."
      toast.error(message)
    } finally {
      setIsDeleting(false)
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
      published: { label: "Sắp diễn ra ", variant: "default" },
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
      <>
        <OrganizerHeader title="Chi tiết sự kiện" />
        <main className="flex-1 p-4 lg:p-6 space-y-6">
          <div className="max-w-6xl mx-auto space-y-6">
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
        </main>
      </>
    )
  }

  if (!event) {
    return null
  }

  const registeredCount = event.registeredCount || 0
  const totalSeats = event.totalSeats || 0
  const availableSeats = totalSeats - registeredCount
  const percentage = totalSeats > 0 ? Math.round((registeredCount / totalSeats) * 100) : 0

  return (
    <>
      <OrganizerHeader title="Chi tiết sự kiện" />
      <main className="flex-1 p-4 lg:p-6 space-y-6 bg-gradient-to-br from-background via-muted/20 to-background min-h-screen">
        <div className="max-w-6xl mx-auto space-y-6">
          {/* Header Actions */}
          <div className="flex items-center justify-between">
            <Link href="/organizer/events">
              <Button variant="outline" className="gap-2">
                <ArrowLeft className="h-4 w-4" />
                Quay lại
              </Button>
            </Link>
            <div className="flex gap-2 flex-wrap justify-end">
              {event?.status === "draft" && (
                <Link href={`/organizer/events/${eventId}/edit`}>
                  <Button variant="outline" className="gap-2">
                    <Edit className="h-4 w-4" />
                    Chỉnh sửa
                  </Button>
                </Link>
              )}
              {event?.status === "draft" && (
                <Button 
                  variant="destructive" 
                  className="gap-2"
                  onClick={handleDelete}
                  disabled={isDeleting}
                >
                  {isDeleting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Đang xóa...
                    </>
                  ) : (
                    <>
                      <Trash2 className="h-4 w-4" />
                      Xóa
                    </>
                  )}
                </Button>
              )}
            </div>
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

            {/* Right Column - Stats & Actions */}
            <div className="space-y-6">
              {/* Registration Stats */}
              <Card className="border-2 shadow-lg">
                <CardHeader className="bg-gradient-to-r from-primary/5 to-primary/10 border-b">
                  <CardTitle className="text-xl flex items-center gap-2">
                    <Ticket className="h-5 w-5 text-primary" />
                    Thống kê đăng ký
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-4">
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
                </CardContent>
              </Card>

              {/* Registration Period */}
              <Card className="border-2 shadow-lg">
                <CardHeader className="bg-gradient-to-r from-primary/5 to-primary/10 border-b">
                  <CardTitle className="text-lg">Thời gian đăng ký</CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-3">
                  <div className="space-y-1">
                    <div className="text-sm text-muted-foreground">Bắt đầu</div>
                    <p className="font-semibold">{formatDateTime(event.registrationStart)}</p>
                  </div>
                  <Separator />
                  <div className="space-y-1">
                    <div className="text-sm text-muted-foreground">Kết thúc</div>
                    <p className="font-semibold">{formatDateTime(event.registrationEnd)}</p>
                  </div>
                  {event.maxTicketsPerUser && (
                    <>
                      <Separator />
                      <div className="space-y-1">
                        <div className="text-sm text-muted-foreground">Số vé tối đa/người</div>
                        <p className="font-semibold">{event.maxTicketsPerUser}</p>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>

              {/* Quick Actions */}
              <Card className="border-2 shadow-lg">
                <CardHeader className="bg-gradient-to-r from-primary/5 to-primary/10 border-b">
                  <CardTitle className="text-lg">Thao tác nhanh</CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-3">
                  <Link href={`/organizer/events/${eventId}/edit`} className="block">
                    <Button variant="outline" className="w-full justify-start gap-2">
                      <Edit className="h-4 w-4" />
                      Chỉnh sửa sự kiện
                    </Button>
                  </Link>
                  <Link href={`/organizer/seats?eventId=${eventId}`} className="block">
                    <Button variant="outline" className="w-full justify-start gap-2">
                      <Users className="h-4 w-4" />
                      Quản lý chỗ ngồi
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </>
  )
}


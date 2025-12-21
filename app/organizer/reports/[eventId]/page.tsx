/* ============================================
   Event Participants Detail Page
   Trang chi tiết danh sách người tham dự sự kiện
   ============================================ */

"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter, useSearchParams } from "next/navigation"
import { ArrowLeft, Users, Loader2, Search, Filter } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { OrganizerHeader } from "@/components/organizer/header"
import { ticketService, TicketDto } from "@/lib/services/ticket.service"
import { toast } from "react-toastify"

export default function EventParticipantsPage() {
  const params = useParams()
  const router = useRouter()
  const searchParams = useSearchParams()
  
  const eventId = params.eventId as string
  const eventName = searchParams.get("eventName") || "Sự kiện"
  
  const [participants, setParticipants] = useState<TicketDto[]>([])
  const [filteredParticipants, setFilteredParticipants] = useState<TicketDto[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")

  // Fetch participants
  useEffect(() => {
    const fetchParticipants = async () => {
      if (!eventId) {
        toast.error("Thiếu thông tin sự kiện")
        return
      }

      setIsLoading(true)
      try {
        const response = await ticketService.getEventTickets(eventId)
        if (response.success && response.data) {
          setParticipants(response.data)
          setFilteredParticipants(response.data)
        } else {
          toast.error(response.message || "Không thể tải danh sách người tham dự")
          setParticipants([])
          setFilteredParticipants([])
        }
      } catch (error: any) {
        console.error("Error fetching participants:", error)
        toast.error("Không thể tải danh sách người tham dự. Vui lòng thử lại.")
        setParticipants([])
        setFilteredParticipants([])
      } finally {
        setIsLoading(false)
      }
    }

    fetchParticipants()
  }, [eventId])

  // Filter participants based on search and status
  useEffect(() => {
    let filtered = participants

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(
        (p) =>
          p.ticketCode?.toLowerCase().includes(query) ||
          p.studentId?.toLowerCase().includes(query) ||
          (p as any).studentName?.toLowerCase().includes(query) ||
          p.seatNumber?.toLowerCase().includes(query)
      )
    }

    // Filter by status
    if (statusFilter !== "all") {
      filtered = filtered.filter((p) => p.status === statusFilter)
    }

    setFilteredParticipants(filtered)
  }, [participants, searchQuery, statusFilter])

  // Status badge component
  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
      active: { label: "Đã đăng ký", variant: "secondary" },
      used: { label: "Đã tham dự", variant: "default" },
      "checked-in": { label: "Đã check-in", variant: "default" },
      cancelled: { label: "Đã hủy", variant: "destructive" },
      completed: { label: "Hoàn thành", variant: "default" },
    }
    const config = statusConfig[status] || { label: status, variant: "outline" as const }
    return <Badge variant={config.variant} className="text-xs">{config.label}</Badge>
  }

  // Format date time
  const formatDateTime = (dateStr: string, startTime?: string, endTime?: string) => {
    if (!dateStr) return "N/A"
    const date = new Date(dateStr)
    const day = String(date.getDate()).padStart(2, '0')
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const year = date.getFullYear()
    
    let result = `${day}/${month}/${year}`
    
    if (startTime) {
      const start = startTime.substring(0, 5)
      result += ` ${start}`
      
      if (endTime) {
        const end = endTime.substring(0, 5)
        result += ` - ${end}`
      }
    }
    
    return result
  }

  // Calculate stats
  const stats = {
    total: participants.length,
    participated: participants.filter((t) => t.status === "used" || t.status === "checked-in" || t.status === "completed").length,
    active: participants.filter((t) => t.status === "active").length,
    cancelled: participants.filter((t) => t.status === "cancelled").length,
  }

  return (
    <>
      <OrganizerHeader title="Chi tiết người tham dự" />

      <main className="flex-1 p-4 lg:p-6 space-y-6">
        {/* Header with back button */}
        <div className="flex flex-col sm:flex-row justify-between gap-4">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.back()}
              className="h-9"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Quay lại
            </Button>
            <div>
              <h2 className="text-lg font-semibold">{decodeURIComponent(eventName)}</h2>
              <p className="text-sm text-muted-foreground">
                Danh sách người đăng ký và tham dự sự kiện
              </p>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Users className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Tổng số vé</p>
                  <p className="text-2xl font-bold">{stats.total}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-500/10 rounded-lg">
                  <Users className="h-4 w-4 text-green-500" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Đã tham dự</p>
                  <p className="text-2xl font-bold text-green-600">{stats.participated}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-yellow-500/10 rounded-lg">
                  <Users className="h-4 w-4 text-yellow-500" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Chưa check-in</p>
                  <p className="text-2xl font-bold text-yellow-600">{stats.active}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-red-500/10 rounded-lg">
                  <Users className="h-4 w-4 text-red-500" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Đã hủy</p>
                  <p className="text-2xl font-bold text-red-600">{stats.cancelled}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Tìm kiếm theo mã vé, tên sinh viên, số ghế..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Lọc trạng thái" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả</SelectItem>
                  <SelectItem value="active">Đã đăng ký</SelectItem>
                  <SelectItem value="used">Đã tham dự</SelectItem>
                  <SelectItem value="checked-in">Đã check-in</SelectItem>
                  <SelectItem value="completed">Hoàn thành</SelectItem>
                  <SelectItem value="cancelled">Đã hủy</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Participants Table */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Danh sách người tham dự</CardTitle>
            <CardDescription className="text-xs">
              Hiển thị {filteredParticipants.length} / {participants.length} vé
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <span className="ml-2 text-sm text-muted-foreground">Đang tải danh sách...</span>
              </div>
            ) : filteredParticipants.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>{participants.length === 0 ? "Chưa có người tham dự" : "Không tìm thấy kết quả phù hợp"}</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-xs">STT</TableHead>
                      <TableHead className="text-xs">MÃ VÉ</TableHead>
                      <TableHead className="text-xs">TÊN SINH VIÊN</TableHead>
                      <TableHead className="text-xs">GHẾ</TableHead>
                      <TableHead className="text-xs">TRẠNG THÁI</TableHead>
                      <TableHead className="text-xs">THỜI GIAN SỰ KIỆN</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredParticipants.map((ticket, index) => (
                      <TableRow key={ticket.ticketId}>
                        <TableCell className="text-sm">{index + 1}</TableCell>
                        <TableCell className="text-sm font-mono">{ticket.ticketCode}</TableCell>
                        <TableCell className="text-sm">
                          {(ticket as any).studentName || ticket.studentId || "-"}
                        </TableCell>
                        <TableCell className="text-sm">{ticket.seatNumber || "-"}</TableCell>
                        <TableCell>{getStatusBadge(ticket.status)}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {formatDateTime(ticket.eventDate, ticket.eventStartTime, ticket.eventEndTime)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </>
  )
}

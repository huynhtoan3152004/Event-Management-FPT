/* ============================================
   Reports Page - Enhanced with Charts
   Analytics and reports for organizers using Recharts
   ============================================ */

"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Download, TrendingUp, Users, Calendar, FileSpreadsheet, FileText, Filter, XCircle, AlertCircle, Eye } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { OrganizerHeader } from "@/components/organizer/header"
import { reportService, SystemSummaryResponse, MonthlyReportItem, EventReportItem } from "@/lib/services/report.service"
import { toast } from "react-toastify"
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  Legend,
} from "recharts"

// Default mock data for charts (fallback)



export default function ReportsPage() {
  const router = useRouter()
  const [timeRange, setTimeRange] = useState("all")
  const [fromDate, setFromDate] = useState<string>("")
  const [toDate, setToDate] = useState<string>("")
  const [isLoading, setIsLoading] = useState(true)
  const [summaryData, setSummaryData] = useState<SystemSummaryResponse["data"] | null>(null)
  const [monthlyData, setMonthlyData] = useState<MonthlyReportItem[]>([])
  const [eventReportData, setEventReportData] = useState<EventReportItem[]>([])

  // Fetch system summary
  useEffect(() => {
    const fetchSummary = async () => {
      try {
        setIsLoading(true)
        const response = await reportService.getSystemSummary({
          From: fromDate || undefined,
          To: toDate || undefined,
        })
        if (response.success && response.data) {
          setSummaryData(response.data)
        }
      } catch (error: any) {
        console.error("Error fetching system summary:", error)
        toast.error("Không thể tải dữ liệu báo cáo")
      } finally {
        setIsLoading(false)
      }
    }

    fetchSummary()
  }, [fromDate, toDate])

  // Fetch monthly report data
  useEffect(() => {
    const fetchMonthlyData = async () => {
      try {
        // Xây dựng params cho API
        let params: { fromDate?: string; toDate?: string } = {}
        
        // Nếu user đã chọn ngày cụ thể
        if (fromDate) params.fromDate = fromDate
        if (toDate) params.toDate = toDate
        
        // Chỉ tính toán ngày khi timeRange không phải "all" VÀ user chưa chọn ngày
        if (timeRange !== "all" && !fromDate && !toDate) {
          const today = new Date()
          const fromDateObj = new Date()
          
          switch (timeRange) {
            case "7days":
              fromDateObj.setDate(today.getDate() - 7)
              break
            case "30days":
              fromDateObj.setDate(today.getDate() - 30)
              break
            case "6months":
              fromDateObj.setMonth(today.getMonth() - 6)
              break
            case "1year":
              fromDateObj.setFullYear(today.getFullYear() - 1)
              break
          }
          
          params.fromDate = fromDateObj.toISOString().split('T')[0]
          params.toDate = today.toISOString().split('T')[0]
        }
        
        // Gọi API - nếu params rỗng thì lấy tất cả
        const response = await reportService.getMonthlyReport(
          Object.keys(params).length > 0 ? params : undefined
        )
        if (response.success && response.data) {
          setMonthlyData(response.data)
        }
      } catch (error: any) {
        console.error("Error fetching monthly report:", error)
        // Don't show error toast, just use default data
      }
    }

    fetchMonthlyData()
  }, [timeRange, fromDate, toDate])

  // Fetch event list report data
  useEffect(() => {
    const fetchEventListReport = async () => {
      try {
        // Xây dựng params cho API
        let params: { fromDate?: string; toDate?: string } = {}
        
        // Nếu user đã chọn ngày cụ thể
        if (fromDate) params.fromDate = fromDate
        if (toDate) params.toDate = toDate
        
        // Chỉ tính toán ngày khi timeRange không phải "all" VÀ user chưa chọn ngày
        if (timeRange !== "all" && !fromDate && !toDate) {
          const today = new Date()
          const fromDateObj = new Date()
          
          switch (timeRange) {
            case "7days":
              fromDateObj.setDate(today.getDate() - 7)
              break
            case "30days":
              fromDateObj.setDate(today.getDate() - 30)
              break
            case "6months":
              fromDateObj.setMonth(today.getMonth() - 6)
              break
            case "1year":
              fromDateObj.setFullYear(today.getFullYear() - 1)
              break
          }
          
          params.fromDate = fromDateObj.toISOString().split('T')[0]
          params.toDate = today.toISOString().split('T')[0]
        }
        
        // Gọi API - nếu params rỗng thì lấy tất cả
        const response = await reportService.getEventListReport(
          Object.keys(params).length > 0 ? params : undefined
        )
        if (response.success && response.data) {
          setEventReportData(response.data)
        }
      } catch (error: any) {
        console.error("Error fetching event list report:", error)
        // Don't show error toast, just use empty array
        setEventReportData([])
      }
    }

    fetchEventListReport()
  }, [timeRange, fromDate, toDate])

  /**
   * HÀM CHUYỂN ĐẾN TRANG CHI TIẾT NGƯỜI THAM DỰ
   * 
   * Navigate đến: /organizer/reports/{eventId}?eventName={eventName}
   * Trang đích sẽ gọi API: GET /api/events/{eventId}/tickets
   */
  const handleViewDetails = (event: EventReportItem) => {
    if (!event.eventId) {
      toast.error("Không thể lấy chi tiết: thiếu thông tin sự kiện (eventId). Vui lòng liên hệ admin.")
      return
    }
    router.push(`/organizer/reports/${event.eventId}?eventName=${encodeURIComponent(event.eventName)}`)
  }

  // Calculate stats from summary data
  const stats = summaryData
    ? {
        totalEvents: summaryData.totalEvents || 0,
        totalRegistrations: summaryData.totalRegistrations || summaryData.totalTickets || 0,
        averageAttendanceRate: summaryData.participatedPercent || 
          (summaryData.totalRegistrations && summaryData.totalRegistrations > 0
            ? Math.round((summaryData.participatedCount / summaryData.totalRegistrations) * 100)
            : summaryData.totalTickets && summaryData.totalTickets > 0
            ? Math.round((summaryData.totalCheckins || 0) / summaryData.totalTickets * 100)
            : 0),
        eventsThisMonth:
          summaryData.eventsByMonth && summaryData.eventsByMonth.length > 0
            ? summaryData.eventsByMonth[summaryData.eventsByMonth.length - 1].eventCount
            : 0,
        registrationsThisMonth:
          summaryData.attendanceByMonth && summaryData.attendanceByMonth.length > 0
            ? summaryData.attendanceByMonth[summaryData.attendanceByMonth.length - 1].participantCount
            : 0,
        participatedCount: summaryData.participatedCount || summaryData.totalCheckins || 0,
        
        notParticipatedCount: summaryData.notParticipatedCount || 0,
        notParticipatedPercent: summaryData.notParticipatedPercent || 0,
        abandonedCount: summaryData.abandonedCount || 0,
      }
    : {
        totalEvents: 0,
        totalRegistrations: 0,
        averageAttendanceRate: 0,
        eventsThisMonth: 0,
        registrationsThisMonth: 0,
        participatedCount: 0,
        totalStudentsParticipated: 0,
        notParticipatedCount: 0,
        notParticipatedPercent: 0,
        abandonedCount: 0,
      }

  // Format data for charts from monthly API
  const registrationTrendData = monthlyData && monthlyData.length > 0
    ? monthlyData.map((item) => {
        const monthNames = ["Th1", "Th2", "Th3", "Th4", "Th5", "Th6", "Th7", "Th8", "Th9", "Th10", "Th11", "Th12"]
        return {
          month: monthNames[item.month - 1] || `M${item.month}`,
          registrations: item.totalRegistrations,
          attendance: item.participatedCount,
        }
      })
    : summaryData?.eventsByMonth && summaryData.eventsByMonth.length > 0
    ? summaryData.eventsByMonth.map((eventMonth, index) => {
        const attendanceMonth = summaryData.attendanceByMonth?.[index] || { participantCount: 0 }
        const monthNames = ["Th1", "Th2", "Th3", "Th4", "Th5", "Th6", "Th7", "Th8", "Th9", "Th10", "Th11", "Th12"]
        return {
          month: monthNames[eventMonth.month - 1] || `M${eventMonth.month}`,
          registrations: eventMonth.eventCount * 50, // Estimate based on events
          attendance: attendanceMonth.participantCount,
        }
      })
    : []

  return (
    <>
      <OrganizerHeader title="Báo cáo" />

      <main className="flex-1 p-4 lg:p-6 space-y-6">
        {/* Header Actions */}
        <div className="flex flex-col sm:flex-row justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold">Tổng quan phân tích</h2>
            <p className="text-sm text-muted-foreground">Theo dõi hiệu suất và tham dự sự kiện</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
            
            <div className="flex gap-2 flex-wrap">
              <div className="flex items-center gap-2">
                <label htmlFor="fromDate" className="text-xs text-muted-foreground">From</label>
                <input
                  id="fromDate"
                  type="date"
                  className="h-9 rounded-md border border-input bg-transparent px-2 text-sm"
                  value={fromDate}
                  onChange={(e) => setFromDate(e.target.value)}
                />
              </div>
              <div className="flex items-center gap-2">
                <label htmlFor="toDate" className="text-xs text-muted-foreground">To</label>
                <input
                  id="toDate"
                  type="date"
                  className="h-9 rounded-md border border-input bg-transparent px-2 text-sm"
                  value={toDate}
                  onChange={(e) => setToDate(e.target.value)}
                />
              </div>
              <Button
                variant="outline"
                size="sm"
                className="h-9"
                onClick={() => {
                  setFromDate("")
                  setToDate("")
                }}
              >
                <Filter className="h-4 w-4 mr-2" />
                Làm sạch
              </Button>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <Card className="h-full">
            <CardContent className="p-4 h-full flex flex-col">
              <div className="flex items-start gap-3 flex-1">
                <div className="p-2 bg-primary/10 rounded-lg flex-shrink-0">
                  <Calendar className="h-4 w-4 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-muted-foreground mb-1">Tổng số sự kiện</p>
                  <p className="text-2xl font-bold text-foreground">{stats.totalEvents}</p>
                  
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="h-full">
            <CardContent className="p-4 h-full flex flex-col">
              <div className="flex items-start gap-3 flex-1">
                <div className="p-2 bg-success/10 rounded-lg flex-shrink-0">
                  <Users className="h-4 w-4 text-success" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-muted-foreground mb-1">Tổng số vé</p>
                  <p className="text-2xl font-bold text-foreground">{stats.totalRegistrations.toLocaleString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="h-full">
            <CardContent className="p-4 h-full flex flex-col">
              <div className="flex items-start gap-3 flex-1">
                <div className="p-2 bg-primary/10 rounded-lg flex-shrink-0">
                  <Users className="h-4 w-4 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-muted-foreground mb-1">Tổng lượt check-in</p>
                  <p className="text-2xl font-bold text-foreground">
                    {stats.participatedCount}
                  </p>
                  
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="h-full">
            <CardContent className="p-4 h-full flex flex-col">
              <div className="flex items-start gap-3 flex-1">
                <div className="p-2 bg-warning/10 rounded-lg flex-shrink-0">
                  <TrendingUp className="h-4 w-4 text-warning" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-muted-foreground mb-1">Tỷ lệ tham dự </p>
                  <p className="text-2xl font-bold text-foreground">{stats.averageAttendanceRate}%</p>
                  <Progress value={stats.averageAttendanceRate} className="h-1 mt-2 w-full" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="h-full">
            <CardContent className="p-4 h-full flex flex-col">
              <div className="flex items-start gap-3 flex-1">
                <div className="p-2 bg-destructive/10 rounded-lg flex-shrink-0">
                  <XCircle className="h-4 w-4 text-destructive" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-muted-foreground mb-1">Không tham dự</p>
                  <p className="text-2xl font-bold text-foreground">{stats.notParticipatedCount}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {stats.notParticipatedPercent}% 
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="h-full">
            <CardContent className="p-4 h-full flex flex-col">
              <div className="flex items-start gap-3 flex-1">
                <div className="p-2 bg-muted/10 rounded-lg flex-shrink-0">
                  <AlertCircle className="h-4 w-4 text-muted-foreground" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-muted-foreground mb-1">Đã hủy</p>
                  <p className="text-2xl font-bold text-foreground">{stats.abandonedCount}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Vé đã bị hủy
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts */}
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base">Xu hướng đăng ký & tham dự</CardTitle>
                <CardDescription className="text-xs">So sánh theo tháng</CardDescription>
              </div>
              
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={registrationTrendData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="month" className="text-xs" tick={{ fill: "hsl(var(--muted-foreground))" }} />
                  <YAxis className="text-xs" tick={{ fill: "hsl(var(--muted-foreground))" }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                      fontSize: "12px",
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: "12px" }} />
                  <Line
                    type="monotone"
                    dataKey="registrations"
                    stroke="hsl(var(--primary))"
                    strokeWidth={2}
                    dot={{ fill: "hsl(var(--primary))" }}
                    name="Đăng ký"
                  />
                  <Line
                    type="monotone"
                    dataKey="attendance"
                    stroke="hsl(var(--success))"
                    strokeWidth={2}
                    dot={{ fill: "hsl(var(--success))" }}
                    name="Tham dự"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Event Reports Table */}
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base">Báo cáo hiệu suất sự kiện</CardTitle>
                <CardDescription className="text-xs">Chi tiết theo từng sự kiện</CardDescription>
              </div>
              
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-xs">Tên sự kiện</TableHead>
                  <TableHead className="text-xs">Ngày</TableHead>
                  <TableHead className="text-xs text-right">Người đăng kí</TableHead>
                  <TableHead className="text-xs text-right">Người tham gia</TableHead>
                  <TableHead className="text-xs text-right">Người không tham gia</TableHead>
                  <TableHead className="text-xs text-right">Vắng</TableHead>
                  <TableHead className="text-xs text-center">Hành động</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {eventReportData.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                      Không có dữ liệu sự kiện
                    </TableCell>
                  </TableRow>
                ) : (
                  eventReportData.map((event, index) => {
                    // Format date from YYYY-MM-DD to DD/MM
                    const formatDate = (dateStr: string) => {
                      if (!dateStr) return "N/A"
                      const date = new Date(dateStr)
                      const day = String(date.getDate()).padStart(2, '0')
                      const month = String(date.getMonth() + 1).padStart(2, '0')
                      return `${day}/${month}`
                    }

                    // Use participatedPercent from API, or calculate if not available
                    const rate = event.participatedPercent !== undefined 
                      ? event.participatedPercent 
                      : (event.totalRegistrations > 0 
                        ? Math.round((event.participatedCount / event.totalRegistrations) * 100)
                        : 0)

                    return (
                      <TableRow key={`${event.eventName}-${event.eventDate}-${index}`}>
                        <TableCell className="font-medium text-sm">{event.eventName}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">{formatDate(event.eventDate)}</TableCell>
                        <TableCell className="text-sm text-right">{event.totalRegistrations}</TableCell>
                        <TableCell className="text-sm text-right">{event.participatedCount}</TableCell>
                        <TableCell className="text-sm text-right">{event.notParticipatedCount}</TableCell>
                        <TableCell className="text-sm text-right">{event.abandonedCount}</TableCell>
                        <TableCell className="text-sm text-center">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleViewDetails(event)}
                            disabled={!event.eventId}
                            className="h-8 text-xs"
                          >
                            <Eye className="h-3 w-3 mr-1" />
                            View Details
                          </Button>
                        </TableCell>
                      </TableRow>
                    )
                  })
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </main>
    </>
  )
}

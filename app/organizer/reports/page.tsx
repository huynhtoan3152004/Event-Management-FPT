/* ============================================
   Reports Page - Enhanced with Charts
   Analytics and reports for organizers using Recharts
   ============================================ */

"use client"

import { useState, useEffect } from "react"
import { Download, TrendingUp, Users, Calendar, FileSpreadsheet, FileText, Filter, XCircle, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { OrganizerHeader } from "@/components/organizer/header"
import { reportService, SystemSummaryResponse, MonthlyReportItem } from "@/lib/services/report.service"
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
const defaultRegistrationTrendData = [
  { month: "Th1", registrations: 120, attendance: 95 },
  { month: "Th2", registrations: 180, attendance: 150 },
  { month: "Th3", registrations: 250, attendance: 210 },
  { month: "Th4", registrations: 320, attendance: 280 },
  { month: "Th5", registrations: 280, attendance: 240 },
  { month: "Th6", registrations: 400, attendance: 350 },
]

// Event report data
const eventReportData = [
  { id: 1, name: "Tech Conference 2024", date: "15/10", registered: 250, attended: 215, rate: 86 },
  { id: 2, name: "Music Festival", date: "20/10", registered: 500, attended: 450, rate: 90 },
  { id: 3, name: "Hackathon 2024", date: "25/10", registered: 100, attended: 92, rate: 92 },
  { id: 4, name: "Business Pitching", date: "01/11", registered: 150, attended: 128, rate: 85 },
  { id: 5, name: "AI Workshop", date: "05/11", registered: 80, attended: 75, rate: 94 },
]

export default function ReportsPage() {
  const [timeRange, setTimeRange] = useState("6months")
  const [isLoading, setIsLoading] = useState(true)
  const [summaryData, setSummaryData] = useState<SystemSummaryResponse["data"] | null>(null)
  const [monthlyData, setMonthlyData] = useState<MonthlyReportItem[]>([])

  // Fetch system summary
  useEffect(() => {
    const fetchSummary = async () => {
      try {
        setIsLoading(true)
        const response = await reportService.getSystemSummary()
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
  }, [])

  // Fetch monthly report data
  useEffect(() => {
    const fetchMonthlyData = async () => {
      try {
        // Calculate date range based on timeRange
        const today = new Date()
        const toDate = today.toISOString().split('T')[0] // YYYY-MM-DD
        
        let fromDate = new Date()
        switch (timeRange) {
          case "7days":
            fromDate.setDate(today.getDate() - 7)
            break
          case "30days":
            fromDate.setDate(today.getDate() - 30)
            break
          case "6months":
            fromDate.setMonth(today.getMonth() - 6)
            break
          case "1year":
            fromDate.setFullYear(today.getFullYear() - 1)
            break
          default:
            fromDate.setMonth(today.getMonth() - 6)
        }
        
        const response = await reportService.getMonthlyReport({
          fromDate: fromDate.toISOString().split('T')[0],
          toDate
        })
        if (response.success && response.data) {
          setMonthlyData(response.data)
        }
      } catch (error: any) {
        console.error("Error fetching monthly report:", error)
        // Don't show error toast, just use default data
      }
    }

    fetchMonthlyData()
  }, [timeRange])

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
        totalStudentsParticipated: summaryData.totalStudentsParticipated || summaryData.participatedCount || 0,
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
    : defaultRegistrationTrendData

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
          <div className="flex gap-2">
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="w-36">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7days">7 ngày qua</SelectItem>
                <SelectItem value="30days">30 ngày qua</SelectItem>
                <SelectItem value="6months">6 tháng qua</SelectItem>
                <SelectItem value="1year">1 năm qua</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" size="icon">
              <Filter className="h-4 w-4" />
            </Button>
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
                  <p className="text-xs text-success flex items-center gap-1 mt-1">
                    <TrendingUp className="h-3 w-3" />+{stats.eventsThisMonth} tháng này
                  </p>
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
                  <p className="text-xs text-muted-foreground mt-1">
                    {stats.totalStudentsParticipated} người tham dự (unique)
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
                    {stats.notParticipatedPercent}% tổng số vé
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
              <Button variant="ghost" size="sm">
                <Download className="h-4 w-4" />
              </Button>
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
              <div className="flex gap-2">
                <Button variant="outline" size="sm">
                  <FileSpreadsheet className="h-4 w-4 mr-2" />
                  Xuất CSV
                </Button>
                <Button variant="outline" size="sm">
                  <FileText className="h-4 w-4 mr-2" />
                  Xuất PDF
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-xs">EVENT NAME</TableHead>
                  <TableHead className="text-xs">DATE</TableHead>
                  <TableHead className="text-xs text-right">REGISTERED</TableHead>
                  <TableHead className="text-xs text-right">ATTENDED</TableHead>
                  <TableHead className="text-xs text-right">RATE</TableHead>
                  <TableHead className="text-xs">STATUS</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {eventReportData.map((event) => (
                  <TableRow key={event.id}>
                    <TableCell className="font-medium text-sm">{event.name}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{event.date}</TableCell>
                    <TableCell className="text-sm text-right">{event.registered}</TableCell>
                    <TableCell className="text-sm text-right">{event.attended}</TableCell>
                    <TableCell className="text-right">
                      <span
                        className={`text-sm font-medium ${event.rate >= 90 ? "text-success" : event.rate >= 80 ? "text-primary" : "text-warning"}`}
                      >
                        {event.rate}%
                      </span>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="secondary"
                        className={
                          event.rate >= 90
                            ? "bg-success/10 text-success"
                            : event.rate >= 80
                              ? "bg-primary/10 text-primary"
                              : "bg-warning/10 text-warning"
                        }
                      >
                        {event.rate >= 90 ? "Excellent" : event.rate >= 80 ? "Good" : "Average"}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Export Options */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Export Reports</CardTitle>
            <CardDescription className="text-xs">Download comprehensive reports for your records</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-3">
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                All Events Report (CSV)
              </Button>
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Attendance Summary (PDF)
              </Button>
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Check-in Logs (Excel)
              </Button>
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Speaker Reports (PDF)
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>
    </>
  )
}

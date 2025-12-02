/* ============================================
   Reports Page - Enhanced with Charts
   Analytics and reports for organizers using Recharts
   ============================================ */

"use client"

import { useState } from "react"
import { Download, TrendingUp, Users, Calendar, BarChart3, FileSpreadsheet, FileText, Filter } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { OrganizerHeader } from "@/components/organizer/header"
import { MOCK_DASHBOARD_STATS } from "@/lib/constants"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts"

// Mock data for charts
const registrationTrendData = [
  { month: "Jan", registrations: 120, attendance: 95 },
  { month: "Feb", registrations: 180, attendance: 150 },
  { month: "Mar", registrations: 250, attendance: 210 },
  { month: "Apr", registrations: 320, attendance: 280 },
  { month: "May", registrations: 280, attendance: 240 },
  { month: "Jun", registrations: 400, attendance: 350 },
]

const eventTypeData = [
  { name: "Workshop", value: 35, color: "hsl(var(--chart-1))" },
  { name: "Talkshow", value: 25, color: "hsl(var(--chart-2))" },
  { name: "Competition", value: 20, color: "hsl(var(--chart-3))" },
  { name: "Festival", value: 15, color: "hsl(var(--chart-4))" },
  { name: "Other", value: 5, color: "hsl(var(--chart-5))" },
]

const checkInByHourData = [
  { hour: "08:00", checkIns: 45 },
  { hour: "09:00", checkIns: 120 },
  { hour: "10:00", checkIns: 85 },
  { hour: "11:00", checkIns: 60 },
  { hour: "12:00", checkIns: 30 },
  { hour: "13:00", checkIns: 55 },
  { hour: "14:00", checkIns: 90 },
  { hour: "15:00", checkIns: 70 },
  { hour: "16:00", checkIns: 40 },
]

// Event report data
const eventReportData = [
  { id: 1, name: "Tech Conference 2024", date: "Oct 15", registered: 250, attended: 215, rate: 86 },
  { id: 2, name: "Music Festival", date: "Oct 20", registered: 500, attended: 450, rate: 90 },
  { id: 3, name: "Hackathon 2024", date: "Oct 25", registered: 100, attended: 92, rate: 92 },
  { id: 4, name: "Business Pitching", date: "Nov 01", registered: 150, attended: 128, rate: 85 },
  { id: 5, name: "AI Workshop", date: "Nov 05", registered: 80, attended: 75, rate: 94 },
]

export default function ReportsPage() {
  const stats = MOCK_DASHBOARD_STATS
  const [timeRange, setTimeRange] = useState("6months")

  return (
    <>
      <OrganizerHeader title="Reports" />

      <main className="flex-1 p-4 lg:p-6 space-y-6">
        {/* Header Actions */}
        <div className="flex flex-col sm:flex-row justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold">Analytics Overview</h2>
            <p className="text-sm text-muted-foreground">Track your event performance and attendance metrics</p>
          </div>
          <div className="flex gap-2">
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="w-36">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7days">Last 7 days</SelectItem>
                <SelectItem value="30days">Last 30 days</SelectItem>
                <SelectItem value="6months">Last 6 months</SelectItem>
                <SelectItem value="1year">Last year</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" size="icon">
              <Filter className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Calendar className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Total Events</p>
                  <p className="text-2xl font-bold text-foreground">{stats.totalEvents}</p>
                  <p className="text-xs text-success flex items-center gap-1">
                    <TrendingUp className="h-3 w-3" />+{stats.eventsThisMonth} this month
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-success/10 rounded-lg">
                  <Users className="h-4 w-4 text-success" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Total Registrations</p>
                  <p className="text-2xl font-bold text-foreground">{stats.totalRegistrations.toLocaleString()}</p>
                  <p className="text-xs text-success flex items-center gap-1">
                    <TrendingUp className="h-3 w-3" />+{stats.registrationsThisMonth} this month
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-warning/10 rounded-lg">
                  <TrendingUp className="h-4 w-4 text-warning" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Avg. Attendance Rate</p>
                  <p className="text-2xl font-bold text-foreground">{stats.averageAttendanceRate}%</p>
                  <Progress value={stats.averageAttendanceRate} className="h-1 mt-1 w-20" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-accent rounded-lg">
                  <BarChart3 className="h-4 w-4 text-accent-foreground" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Avg. per Event</p>
                  <p className="text-2xl font-bold text-foreground">
                    {Math.round(stats.totalRegistrations / stats.totalEvents)}
                  </p>
                  <p className="text-xs text-muted-foreground">attendees</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts */}
        <div className="grid lg:grid-cols-2 gap-4">
          {/* Registration Trends */}
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base">Registration & Attendance Trends</CardTitle>
                  <CardDescription className="text-xs">Monthly comparison</CardDescription>
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
                      name="Registrations"
                    />
                    <Line
                      type="monotone"
                      dataKey="attendance"
                      stroke="hsl(var(--success))"
                      strokeWidth={2}
                      dot={{ fill: "hsl(var(--success))" }}
                      name="Attendance"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Event Type Distribution */}
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base">Events by Type</CardTitle>
                  <CardDescription className="text-xs">Distribution percentage</CardDescription>
                </div>
                <Button variant="ghost" size="sm">
                  <Download className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={eventTypeData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                      label={({ name, value }) => `${name}: ${value}%`}
                      labelLine={false}
                    >
                      {eventTypeData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px",
                        fontSize: "12px",
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Check-in by Hour */}
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base">Check-ins by Hour (Last Event)</CardTitle>
                <CardDescription className="text-xs">Peak times for event attendance</CardDescription>
              </div>
              <Button variant="ghost" size="sm">
                <Download className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={checkInByHourData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" vertical={false} />
                  <XAxis dataKey="hour" className="text-xs" tick={{ fill: "hsl(var(--muted-foreground))" }} />
                  <YAxis className="text-xs" tick={{ fill: "hsl(var(--muted-foreground))" }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                      fontSize: "12px",
                    }}
                  />
                  <Bar dataKey="checkIns" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} name="Check-ins" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Event Reports Table */}
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base">Event Performance Report</CardTitle>
                <CardDescription className="text-xs">Detailed breakdown by event</CardDescription>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm">
                  <FileSpreadsheet className="h-4 w-4 mr-2" />
                  Export CSV
                </Button>
                <Button variant="outline" size="sm">
                  <FileText className="h-4 w-4 mr-2" />
                  Export PDF
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

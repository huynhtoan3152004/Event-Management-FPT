/* ============================================
   Real-time Attendance Monitor - Enhanced
   Live dashboard showing check-in progress with event details
   ============================================ */

"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import {
  Users,
  UserCheck,
  UserMinus,
  Percent,
  RefreshCw,
  ArrowLeft,
  Calendar,
  Clock,
  MapPin,
  TrendingUp,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { MOCK_CHECKIN_RECORDS, MOCK_STAFF_EVENTS, MOCK_STAFF_USER } from "@/lib/constants"
import type { CheckInStatus } from "@/types"

export default function AttendanceMonitorPage() {
  const params = useParams()
  const eventId = params.eventId as string

  const [isRefreshing, setIsRefreshing] = useState(false)
  const [recentCheckIns, setRecentCheckIns] = useState(MOCK_CHECKIN_RECORDS)

  // Get event data
  const event = MOCK_STAFF_EVENTS.find((e) => e.id === eventId) || MOCK_STAFF_EVENTS[0]

  // Mock statistics with live updates simulation
  const [stats, setStats] = useState({
    totalRegistered: event?.totalRegistered || 1200,
    totalCheckedIn: event?.checkedIn || 854,
    remaining: (event?.totalRegistered || 1200) - (event?.checkedIn || 854),
    checkInRate: Math.round(((event?.checkedIn || 854) / (event?.totalRegistered || 1200)) * 1000) / 10,
  })

  // Simulate live updates
  useEffect(() => {
    const interval = setInterval(() => {
      if (Math.random() > 0.7 && stats.totalCheckedIn < stats.totalRegistered) {
        setStats((prev) => {
          const newCheckedIn = prev.totalCheckedIn + 1
          return {
            ...prev,
            totalCheckedIn: newCheckedIn,
            remaining: prev.totalRegistered - newCheckedIn,
            checkInRate: Math.round((newCheckedIn / prev.totalRegistered) * 1000) / 10,
          }
        })

        // Add new check-in to feed
        const names = ["Nguyen Van H", "Tran Thi I", "Le Van J", "Pham Thi K", "Hoang Van L"]
        setRecentCheckIns((prev) => [
          {
            id: Date.now().toString(),
            attendeeName: names[Math.floor(Math.random() * names.length)],
            ticketCode: `FPTU...${Math.random().toString(36).substring(2, 5).toUpperCase()}`,
            checkInTime: new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }),
            status: "entered" as CheckInStatus,
            seatInfo: `${String.fromCharCode(65 + Math.floor(Math.random() * 8))}-${Math.floor(Math.random() * 20) + 1}`,
          },
          ...prev.slice(0, 9),
        ])
      }
    }, 3000)

    return () => clearInterval(interval)
  }, [stats.totalCheckedIn, stats.totalRegistered])

  // Handle refresh
  const handleRefresh = () => {
    setIsRefreshing(true)
    setTimeout(() => setIsRefreshing(false), 1000)
  }

  return (
    <div className="space-y-4 max-w-7xl mx-auto">
      {/* Back Button & Title */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/staff">
            <Button variant="ghost" size="sm" className="h-8">
              <ArrowLeft className="h-4 w-4 mr-1" />
              Back
            </Button>
          </Link>
          <div>
            <h1 className="text-xl font-bold text-foreground">Real-time Attendance Monitor</h1>
            <p className="text-xs text-muted-foreground">Welcome back, {MOCK_STAFF_USER.name}!</p>
          </div>
        </div>
        <Button variant="outline" size="sm" onClick={handleRefresh} disabled={isRefreshing}>
          <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      {/* Event Info Banner */}
      <Card className="bg-gradient-to-r from-primary/5 to-accent/10">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <Badge variant="default" className="bg-success">
                  Live
                </Badge>
                <h2 className="text-lg font-semibold">{event.name}</h2>
              </div>
              <div className="flex flex-wrap items-center gap-4 mt-2 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  {event.date}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  {event.time}
                </span>
                <span className="flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  {event.location}
                </span>
              </div>
            </div>
            <Link href={`/staff/checkin/${event.id}`}>
              <Button size="sm" className="rounded-full">
                Go to Check-in
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* Statistics Cards */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Users className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Total Registered</p>
                <p className="text-2xl font-bold text-foreground">{stats.totalRegistered.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-success/10 rounded-lg">
                <UserCheck className="h-4 w-4 text-success" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Total Checked-in</p>
                <p className="text-2xl font-bold text-primary">{stats.totalCheckedIn}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-muted rounded-lg">
                <UserMinus className="h-4 w-4 text-muted-foreground" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Remaining</p>
                <p className="text-2xl font-bold text-foreground">{stats.remaining}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Percent className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Check-in Rate</p>
                <p className="text-2xl font-bold text-primary">{stats.checkInRate}%</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Progress Bar */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between py-3 px-4">
          <CardTitle className="text-sm font-medium">Check-in Progress</CardTitle>
          <span className="text-sm text-muted-foreground">
            {stats.totalCheckedIn} / {stats.totalRegistered}
          </span>
        </CardHeader>
        <CardContent className="px-4 pb-4 pt-0">
          <Progress value={stats.checkInRate} className="h-3" />
        </CardContent>
      </Card>

      {/* Live Check-in Feed */}
      <Card>
        <CardHeader className="py-3 px-4">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base flex items-center gap-2">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-success"></span>
                </span>
                Live Check-in Feed
              </CardTitle>
              <CardDescription className="text-xs">Showing the latest 10 check-ins</CardDescription>
            </div>
            <Badge variant="outline" className="text-xs">
              <TrendingUp className="h-3 w-3 mr-1" />
              Live
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="px-4 pb-4 pt-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-xs">ATTENDEE NAME</TableHead>
                <TableHead className="text-xs">TICKET ID</TableHead>
                <TableHead className="text-xs">SEAT</TableHead>
                <TableHead className="text-xs">CHECK-IN TIME</TableHead>
                <TableHead className="text-xs">STATUS</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recentCheckIns.slice(0, 10).map((record, index) => (
                <TableRow key={record.id} className={index === 0 ? "bg-success/5" : ""}>
                  <TableCell className="font-medium text-sm py-2">{record.attendeeName}</TableCell>
                  <TableCell className="text-muted-foreground text-sm py-2 font-mono">{record.ticketCode}</TableCell>
                  <TableCell className="text-sm py-2">{record.seatInfo || "-"}</TableCell>
                  <TableCell className="text-sm py-2">{record.checkInTime}</TableCell>
                  <TableCell className="py-2">
                    <Badge
                      variant="secondary"
                      className={
                        record.status === "entered"
                          ? "bg-success/10 text-success text-xs"
                          : "bg-warning/10 text-warning text-xs"
                      }
                    >
                      {record.status === "entered" ? "Entered" : "Already Used"}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}

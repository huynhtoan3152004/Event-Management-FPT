/* ============================================
   Staff Check-in Portal - Enhanced
   Full check-in interface with event details and stats
   ============================================ */

"use client"

import { useState, useEffect, useCallback } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import {
  QrCode,
  CheckCircle,
  XCircle,
  AlertCircle,
  ArrowLeft,
  Calendar,
  Clock,
  MapPin,
  Users,
  Mic,
  RefreshCw,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Progress } from "@/components/ui/progress"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { MOCK_CHECKIN_RECORDS, MOCK_STAFF_EVENTS, MOCK_VENUES } from "@/lib/constants"
import type { CheckInStatus } from "@/types"

// Check-in result interface
interface CheckInResult {
  status: CheckInStatus
  message: string
  attendeeName?: string
  ticketCode?: string
  time?: string
  seatInfo?: string
}

export default function StaffCheckInPage() {
  const params = useParams()
  const eventId = params.eventId as string

  const [ticketCode, setTicketCode] = useState("")
  const [checkInResult, setCheckInResult] = useState<CheckInResult | null>(null)
  const [recentCheckIns, setRecentCheckIns] = useState(MOCK_CHECKIN_RECORDS)
  const [isProcessing, setIsProcessing] = useState(false)

  // Get event data
  const event = MOCK_STAFF_EVENTS.find((e) => e.id === eventId)
  const venue = event ? MOCK_VENUES.find((v) => v.id === event.venueId) : null

  // Mock statistics - would be real-time in production
  const [stats, setStats] = useState({
    checkedIn: event?.checkedIn || 152,
    totalRegistered: event?.totalRegistered || 500,
  })

  // Handle ticket code submission
  const handleCheckIn = useCallback(() => {
    if (!ticketCode.trim() || isProcessing) return

    setIsProcessing(true)

    // Simulate API call delay
    setTimeout(() => {
      const randomResult = Math.random()
      let result: CheckInResult

      if (randomResult > 0.8) {
        // Already used
        result = {
          status: "already_used",
          message: "Vé đã được sử dụng",
          attendeeName: "Nguyen Van A",
          ticketCode: ticketCode,
          time: "09:15 AM",
        }
      } else if (randomResult > 0.2) {
        // Success
        result = {
          status: "entered",
          message: "Check-in thành công!",
          attendeeName: "Le Thi B",
          ticketCode: ticketCode,
          seatInfo: `${String.fromCharCode(65 + Math.floor(Math.random() * 5))}-${Math.floor(Math.random() * 20) + 1}`,
        }

        // Add to recent check-ins
        setRecentCheckIns((prev) => [
          {
            id: Date.now().toString(),
            attendeeName: "Le Thi B",
            ticketCode: ticketCode,
            checkInTime: new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }),
            status: "entered",
            seatInfo: result.seatInfo,
          },
          ...prev.slice(0, 9),
        ])

        // Update stats
        setStats((prev) => ({
          ...prev,
          checkedIn: prev.checkedIn + 1,
        }))
      } else if (randomResult > 0.1) {
        // Not found
        result = {
          status: "not_found",
          message: "Không tìm thấy vé",
          ticketCode: ticketCode,
        }
      } else {
        // Cancelled ticket
        result = {
          status: "cancelled",
          message: "Vé đã bị hủy",
          ticketCode: ticketCode,
        }
      }

      setCheckInResult(result)
      setTicketCode("")
      setIsProcessing(false)

      // Clear result after 5 seconds
      setTimeout(() => setCheckInResult(null), 5000)
    }, 500)
  }, [ticketCode, isProcessing])

  // Handle Enter key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Enter" && ticketCode.trim()) {
        handleCheckIn()
      }
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [ticketCode, handleCheckIn])

  if (!event) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <p className="text-muted-foreground">Event not found</p>
        <Link href="/staff">
          <Button variant="outline">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Events
          </Button>
        </Link>
      </div>
    )
  }

  const checkInRate = Math.round((stats.checkedIn / stats.totalRegistered) * 100)

  return (
    <div className="space-y-4 max-w-7xl mx-auto">
      {/* Back Button & Title */}
      <div className="flex items-center gap-4">
        <Link href="/staff">
          <Button variant="ghost" size="sm" className="h-8">
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back
          </Button>
        </Link>
        <div>
          <h1 className="text-xl font-bold text-foreground">Staff Check-in Portal</h1>
          <p className="text-xs text-muted-foreground">Enter ticket codes manually or with a barcode scanner</p>
        </div>
      </div>

      {/* Event Info Banner */}
      <Card className="bg-gradient-to-r from-primary/5 to-accent/10">
        <CardContent className="p-4">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            {/* Event Details */}
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="default" className="bg-success">
                  Ongoing
                </Badge>
                <h2 className="text-lg font-semibold">{event.name}</h2>
              </div>
              <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
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
                {venue && (
                  <span className="flex items-center gap-1">
                    <Users className="h-4 w-4" />
                    Capacity: {venue.capacity}
                  </span>
                )}
              </div>

              {/* Speakers */}
              {event.speakers && event.speakers.length > 0 && (
                <div className="flex items-center gap-2 mt-3">
                  <Mic className="h-4 w-4 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">Speakers:</span>
                  <div className="flex -space-x-2">
                    {event.speakers.map((speaker) => (
                      <Avatar key={speaker.id} className="h-6 w-6 border-2 border-background">
                        <AvatarImage src={speaker.avatar || "/placeholder.svg"} alt={speaker.name} />
                        <AvatarFallback className="text-xs">{speaker.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                    ))}
                  </div>
                  <span className="text-xs text-foreground">{event.speakers.map((s) => s.name).join(", ")}</span>
                </div>
              )}
            </div>

            {/* Quick Stats */}
            <div className="flex gap-4">
              <div className="text-center px-4 py-2 bg-background/80 rounded-lg">
                <p className="text-2xl font-bold text-primary">{stats.checkedIn}</p>
                <p className="text-xs text-muted-foreground">Checked-in</p>
              </div>
              <div className="text-center px-4 py-2 bg-background/80 rounded-lg">
                <p className="text-2xl font-bold">{stats.totalRegistered}</p>
                <p className="text-xs text-muted-foreground">Registered</p>
              </div>
              <div className="text-center px-4 py-2 bg-background/80 rounded-lg">
                <p className="text-2xl font-bold text-success">{checkInRate}%</p>
                <p className="text-xs text-muted-foreground">Rate</p>
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mt-4">
            <div className="flex justify-between text-xs text-muted-foreground mb-1">
              <span>Check-in Progress</span>
              <span>
                {stats.checkedIn} / {stats.totalRegistered}
              </span>
            </div>
            <Progress value={checkInRate} className="h-2" />
          </div>
        </CardContent>
      </Card>

      <div className="grid lg:grid-cols-3 gap-4">
        {/* Left Column - Check-in Interface */}
        <div className="space-y-4">
          {/* Ticket Input Card */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Enter Ticket Code</CardTitle>
              <CardDescription className="text-xs">Scan QR code or type ticket code manually</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Input
                placeholder="Scan or enter ticket code..."
                value={ticketCode}
                onChange={(e) => setTicketCode(e.target.value.toUpperCase())}
                className="text-lg h-12 font-mono text-center"
                autoFocus
                disabled={isProcessing}
              />
              <Button
                onClick={handleCheckIn}
                className="w-full rounded-full h-11"
                disabled={!ticketCode.trim() || isProcessing}
              >
                {isProcessing ? (
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <QrCode className="h-4 w-4 mr-2" />
                )}
                {isProcessing ? "Processing..." : "Check-in"}
              </Button>
            </CardContent>
          </Card>

          {/* Check-in Status Card */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Last Check-in Status</CardTitle>
            </CardHeader>
            <CardContent>
              {checkInResult ? (
                <CheckInStatusCard result={checkInResult} />
              ) : (
                <div className="text-center py-6 text-muted-foreground text-sm">Enter a ticket code to check in</div>
              )}
            </CardContent>
          </Card>

          {/* Status Legend */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Status Legend</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <StatusLegendItem status="entered" label="Valid / Entered" />
              <StatusLegendItem status="already_used" label="Already Checked In" />
              <StatusLegendItem status="not_found" label="Ticket Not Found" />
              <StatusLegendItem status="cancelled" label="Ticket Cancelled" />
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Recent Check-ins Table */}
        <Card className="lg:col-span-2">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base">Recent Check-ins</CardTitle>
                <CardDescription className="text-xs">Live feed of the latest attendee check-ins</CardDescription>
              </div>
              <Badge variant="outline" className="text-xs">
                {recentCheckIns.length} records
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-xs">ATTENDEE NAME</TableHead>
                  <TableHead className="text-xs">TICKET CODE</TableHead>
                  <TableHead className="text-xs">SEAT</TableHead>
                  <TableHead className="text-xs">TIME</TableHead>
                  <TableHead className="text-xs">STATUS</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentCheckIns.map((record, index) => (
                  <TableRow
                    key={record.id}
                    className={index === 0 && checkInResult?.status === "entered" ? "animate-pulse-success" : ""}
                  >
                    <TableCell className="font-medium text-sm py-2">{record.attendeeName}</TableCell>
                    <TableCell className="text-muted-foreground text-sm py-2 font-mono">{record.ticketCode}</TableCell>
                    <TableCell className="text-sm py-2">{record.seatInfo || "-"}</TableCell>
                    <TableCell className="text-sm py-2">{record.checkInTime}</TableCell>
                    <TableCell className="py-2">
                      <StatusBadge status={record.status} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

// Check-in Status Card Component
function CheckInStatusCard({ result }: { result: CheckInResult }) {
  const getStatusConfig = () => {
    switch (result.status) {
      case "entered":
        return {
          bgColor: "bg-success/10 border-success/30",
          textColor: "text-success",
          icon: <CheckCircle className="h-8 w-8" />,
        }
      case "already_used":
        return {
          bgColor: "bg-warning/10 border-warning/30",
          textColor: "text-warning",
          icon: <AlertCircle className="h-8 w-8" />,
        }
      case "not_found":
      case "cancelled":
      case "expired":
        return {
          bgColor: "bg-destructive/10 border-destructive/30",
          textColor: "text-destructive",
          icon: <XCircle className="h-8 w-8" />,
        }
      default:
        return {
          bgColor: "bg-muted",
          textColor: "text-muted-foreground",
          icon: null,
        }
    }
  }

  const config = getStatusConfig()

  return (
    <div className={`p-4 rounded-lg border ${config.bgColor} text-center`}>
      <div className={`flex justify-center mb-2 ${config.textColor}`}>{config.icon}</div>
      <p className={`font-semibold text-lg ${config.textColor}`}>{result.message}</p>
      {result.attendeeName && (
        <p className="text-sm text-muted-foreground mt-1">
          {result.status === "entered" ? `Welcome, ${result.attendeeName}!` : `${result.attendeeName} - ${result.time}`}
        </p>
      )}
      {result.seatInfo && <p className="text-sm font-medium mt-1">Seat: {result.seatInfo}</p>}
      {result.status === "not_found" && (
        <p className="text-sm text-muted-foreground mt-1">Code &apos;{result.ticketCode}&apos; does not exist</p>
      )}
    </div>
  )
}

// Status Badge Component
function StatusBadge({ status }: { status: CheckInStatus }) {
  const config = {
    entered: { label: "Entered", className: "bg-success/10 text-success" },
    already_used: { label: "Already Used", className: "bg-warning/10 text-warning" },
    not_found: { label: "Not Found", className: "bg-destructive/10 text-destructive" },
    cancelled: { label: "Cancelled", className: "bg-destructive/10 text-destructive" },
    expired: { label: "Expired", className: "bg-muted text-muted-foreground" },
  }

  const { label, className } = config[status] || config.not_found

  return (
    <Badge variant="secondary" className={`text-xs ${className}`}>
      {label}
    </Badge>
  )
}

// Status Legend Item
function StatusLegendItem({ status, label }: { status: CheckInStatus; label: string }) {
  const config = {
    entered: { icon: <CheckCircle className="h-4 w-4 text-success" />, bg: "bg-success/10" },
    already_used: { icon: <AlertCircle className="h-4 w-4 text-warning" />, bg: "bg-warning/10" },
    not_found: { icon: <XCircle className="h-4 w-4 text-destructive" />, bg: "bg-destructive/10" },
    cancelled: { icon: <XCircle className="h-4 w-4 text-destructive" />, bg: "bg-destructive/10" },
    expired: { icon: <XCircle className="h-4 w-4 text-muted-foreground" />, bg: "bg-muted" },
  }

  const { icon, bg } = config[status] || config.not_found

  return (
    <div className={`flex items-center gap-2 p-2 rounded-md ${bg}`}>
      {icon}
      <span className="text-xs">{label}</span>
    </div>
  )
}

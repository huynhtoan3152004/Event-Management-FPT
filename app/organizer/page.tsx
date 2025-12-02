/* ============================================
   Organizer Dashboard Home
   Overview with statistics and recent events
   ============================================ */

"use client"

import Link from "next/link"
import { TrendingUp, Plus, Search, Filter } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { OrganizerHeader } from "@/components/organizer/header"
import { MOCK_DASHBOARD_STATS, MOCK_ORGANIZER_EVENTS } from "@/lib/constants"
import { useFadeInOnScroll } from "@/hooks/use-gsap"

export default function OrganizerDashboardPage() {
  const sectionRef = useFadeInOnScroll<HTMLDivElement>()
  const stats = MOCK_DASHBOARD_STATS
  const events = MOCK_ORGANIZER_EVENTS

  return (
    <>
      <OrganizerHeader title="Dashboard" />

      <main className="flex-1 p-4 lg:p-6">
        <div ref={sectionRef} className="space-y-6">
          {/* Statistics Cards */}
          <div className="grid md:grid-cols-3 gap-4">
            {/* Total Events */}
            <Card>
              <CardContent className="p-6">
                <p className="text-sm text-muted-foreground mb-2">Total Events Organized</p>
                <p className="text-4xl font-bold text-foreground">{stats.totalEvents}</p>
                <p className="text-sm text-primary mt-2 flex items-center gap-1">
                  <TrendingUp className="h-4 w-4" />+{stats.eventsThisMonth} this month
                </p>
              </CardContent>
            </Card>

            {/* Total Registrations */}
            <Card>
              <CardContent className="p-6">
                <p className="text-sm text-muted-foreground mb-2">Total Registrations</p>
                <p className="text-4xl font-bold text-foreground">{stats.totalRegistrations.toLocaleString()}</p>
                <p className="text-sm text-primary mt-2 flex items-center gap-1">
                  <TrendingUp className="h-4 w-4" />+{stats.registrationsThisMonth} this month
                </p>
              </CardContent>
            </Card>

            {/* Attendance Rate */}
            <Card>
              <CardContent className="p-6">
                <p className="text-sm text-muted-foreground mb-2">Average Attendance Rate</p>
                <p className="text-4xl font-bold text-foreground">{stats.averageAttendanceRate}%</p>
                <p className="text-sm text-primary mt-2 flex items-center gap-1">
                  <TrendingUp className="h-4 w-4" />
                  +5%
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Events Table */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Upcoming & Recent Events</CardTitle>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon">
                  <Filter className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon">
                  <Search className="h-4 w-4" />
                </Button>
                <Link href="/organizer/events/new">
                  <Button className="rounded-full">
                    <Plus className="h-4 w-4 mr-2" />
                    Create New Event
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>EVENT NAME</TableHead>
                    <TableHead>DATE</TableHead>
                    <TableHead>HALL</TableHead>
                    <TableHead>REGISTERED</TableHead>
                    <TableHead>CHECKED-IN</TableHead>
                    <TableHead>ACTIONS</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {events.map((event) => (
                    <TableRow key={event.id}>
                      <TableCell className="font-medium">{event.name}</TableCell>
                      <TableCell>{event.date}</TableCell>
                      <TableCell>{event.hall}</TableCell>
                      <TableCell>{event.registered}</TableCell>
                      <TableCell>{event.checkedIn}</TableCell>
                      <TableCell>
                        <Link href={`/organizer/events/${event.id}`} className="text-primary hover:underline text-sm">
                          View Details
                        </Link>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </main>
    </>
  )
}

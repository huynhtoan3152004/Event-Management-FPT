/* ============================================
   Halls & Seats Management Page
   Manage venue configurations
   ============================================ */

"use client"

import { Plus, MapPin, Users, Edit, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { OrganizerHeader } from "@/components/organizer/header"

// Mock halls data
const halls = [
  { id: "1", name: "Grand Hall", capacity: 500, status: "available" },
  { id: "2", name: "Hall A", capacity: 250, status: "booked" },
  { id: "3", name: "Hall B", capacity: 150, status: "available" },
  { id: "4", name: "Exhibition Hall", capacity: 200, status: "maintenance" },
  { id: "5", name: "Main Auditorium", capacity: 400, status: "available" },
  { id: "6", name: "Student Lounge", capacity: 80, status: "available" },
]

export default function HallsPage() {
  return (
    <>
      <OrganizerHeader title="Halls & Seats" />

      <main className="flex-1 p-4 lg:p-6 space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-lg font-semibold text-foreground">Venue Management</h2>
            <p className="text-sm text-muted-foreground">Manage halls and seating configurations</p>
          </div>
          <Button className="rounded-full">
            <Plus className="h-4 w-4 mr-2" />
            Add Hall
          </Button>
        </div>

        {/* Halls Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {halls.map((hall) => (
            <Card key={hall.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-primary/10 rounded-lg">
                      <MapPin className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground">{hall.name}</h3>
                      <Badge
                        variant={
                          hall.status === "available"
                            ? "default"
                            : hall.status === "booked"
                              ? "secondary"
                              : "destructive"
                        }
                        className="mt-1 capitalize"
                      >
                        {hall.status}
                      </Badge>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
                  <Users className="h-4 w-4" />
                  <span>Capacity: {hall.capacity} seats</span>
                </div>

                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="flex-1 bg-transparent">
                    <Edit className="h-4 w-4 mr-2" />
                    Edit
                  </Button>
                  <Button variant="outline" size="sm" className="text-destructive bg-transparent">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </main>
    </>
  )
}

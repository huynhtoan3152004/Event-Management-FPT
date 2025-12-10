/* ============================================
   Halls & Seats Management Page
   Manage venue configurations
============================================ */

"use client"

import { useEffect, useState } from "react"
import { Plus, MapPin, Users, Edit, Trash2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { OrganizerHeader } from "@/components/organizer/header"

import { toast } from "react-toastify"
import { venueService } from "@/lib/services/venue.service"   // <-- Quan trọng

export default function HallsPage() {
  const [halls, setHalls] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)

  /* ============================================
     GET HALLS FROM API
  ============================================ */
  useEffect(() => {
    const fetchHalls = async () => {
      try {
        setIsLoading(true)
        const res = await venueService.getAll()

        if (res.success && res.data) {
          const mapped = res.data.map((item: any) => ({
            id: item.id,
            name: item.name,
            capacity: item.capacity,
            status: item.status?.toLowerCase() || "available",
          }))

          setHalls(mapped)
        } else {
          toast.error("Không thể tải danh sách halls")
        }
      } catch (err) {
        console.error(err)
        toast.error("Lỗi khi gọi API Halls")
      } finally {
        setIsLoading(false)
      }
    }

    fetchHalls()
  }, [])

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

        {/* Loading */}
        {isLoading && (
          <div className="text-center text-muted-foreground py-10">
            Loading halls...
          </div>
        )}

        {/* No result */}
        {!isLoading && halls.length === 0 && (
          <div className="text-center text-muted-foreground py-10">
            No halls found.
          </div>
        )}

        {/* Halls Grid */}
        {!isLoading && halls.length > 0 && (
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
        )}
      </main>
    </>
  )
}

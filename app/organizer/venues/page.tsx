/* ============================================
   Organizer Venues Page - CRUD Venues
   Manage venues/halls for events
   ============================================ */

"use client"

import type React from "react"

import { useState } from "react"
import { Plus, Search, Edit, Trash2, MapPin, Users, MoreVertical, Wifi, Tv, Mic2, Wind } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { OrganizerHeader } from "@/components/organizer/header"
import { MOCK_VENUES } from "@/lib/constants"
import type { Venue } from "@/types"

// Available facilities
const FACILITIES = [
  { id: "projector", label: "Projector", icon: Tv },
  { id: "sound", label: "Sound System", icon: Mic2 },
  { id: "ac", label: "Air Conditioning", icon: Wind },
  { id: "wifi", label: "WiFi", icon: Wifi },
]

export default function OrganizerVenuesPage() {
  const [venues, setVenues] = useState<Venue[]>(MOCK_VENUES)
  const [searchQuery, setSearchQuery] = useState("")
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [editingVenue, setEditingVenue] = useState<Venue | null>(null)
  const [deletingVenue, setDeletingVenue] = useState<Venue | null>(null)

  // Form state
  const [formData, setFormData] = useState<Partial<Venue>>({
    name: "",
    address: "",
    capacity: 100,
    facilities: [],
    status: "available",
    description: "",
  })

  const filteredVenues = venues.filter(
    (venue) =>
      venue.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      venue.address.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  // Handle create
  const handleCreate = () => {
    const newVenue: Venue = {
      id: `venue-${Date.now()}`,
      name: formData.name || "",
      address: formData.address || "",
      capacity: formData.capacity || 100,
      facilities: formData.facilities,
      status: formData.status || "available",
      description: formData.description,
    }
    setVenues([...venues, newVenue])
    resetForm()
    setIsCreateOpen(false)
  }

  // Handle edit
  const handleEdit = () => {
    if (!editingVenue) return
    setVenues(venues.map((v) => (v.id === editingVenue.id ? { ...v, ...formData } : v)))
    setEditingVenue(null)
    resetForm()
  }

  // Handle delete
  const handleDelete = () => {
    if (!deletingVenue) return
    setVenues(venues.filter((v) => v.id !== deletingVenue.id))
    setDeletingVenue(null)
  }

  // Reset form
  const resetForm = () => {
    setFormData({
      name: "",
      address: "",
      capacity: 100,
      facilities: [],
      status: "available",
      description: "",
    })
  }

  // Open edit dialog
  const openEditDialog = (venue: Venue) => {
    setFormData({
      name: venue.name,
      address: venue.address,
      capacity: venue.capacity,
      facilities: venue.facilities,
      status: venue.status,
      description: venue.description,
    })
    setEditingVenue(venue)
  }

  // Toggle facility
  const toggleFacility = (facility: string) => {
    const current = formData.facilities || []
    if (current.includes(facility)) {
      setFormData({ ...formData, facilities: current.filter((f) => f !== facility) })
    } else {
      setFormData({ ...formData, facilities: [...current, facility] })
    }
  }

  // Get status badge variant
  const getStatusBadge = (status: Venue["status"]) => {
    switch (status) {
      case "available":
        return <Badge className="bg-success text-success-foreground">Available</Badge>
      case "maintenance":
        return <Badge variant="secondary">Maintenance</Badge>
      case "booked":
        return <Badge className="bg-warning text-warning-foreground">Booked</Badge>
    }
  }

  return (
    <>
      <OrganizerHeader title="Venues" />

      <main className="flex-1 p-4 lg:p-6 space-y-6">
        {/* Actions Bar */}
        <div className="flex flex-col sm:flex-row gap-4 justify-between">
          <div className="relative max-w-sm flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search venues..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>

          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button className="rounded-full">
                <Plus className="h-4 w-4 mr-2" />
                Add Venue
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Add New Venue</DialogTitle>
                <DialogDescription>Add a new venue/hall for hosting events.</DialogDescription>
              </DialogHeader>
              <VenueForm formData={formData} setFormData={setFormData} toggleFacility={toggleFacility} />
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsCreateOpen(false)
                    resetForm()
                  }}
                >
                  Cancel
                </Button>
                <Button onClick={handleCreate} disabled={!formData.name || !formData.address}>
                  Add Venue
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Venues Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredVenues.map((venue) => (
            <Card key={venue.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-base">{venue.name}</CardTitle>
                    <CardDescription className="flex items-center gap-1 mt-1">
                      <MapPin className="h-3 w-3" />
                      {venue.address}
                    </CardDescription>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => openEditDialog(venue)}>
                        <Edit className="h-4 w-4 mr-2" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setDeletingVenue(venue)} className="text-destructive">
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <span>Capacity: {venue.capacity}</span>
                  </div>
                  {getStatusBadge(venue.status)}
                </div>

                {venue.facilities && venue.facilities.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {venue.facilities.slice(0, 4).map((facility) => (
                      <Badge key={facility} variant="outline" className="text-xs">
                        {facility}
                      </Badge>
                    ))}
                    {venue.facilities.length > 4 && (
                      <Badge variant="outline" className="text-xs">
                        +{venue.facilities.length - 4}
                      </Badge>
                    )}
                  </div>
                )}

                {venue.description && <p className="text-xs text-muted-foreground line-clamp-2">{venue.description}</p>}
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredVenues.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">No venues found. Add your first venue!</div>
        )}

        {/* Edit Dialog */}
        <Dialog
          open={!!editingVenue}
          onOpenChange={() => {
            setEditingVenue(null)
            resetForm()
          }}
        >
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Edit Venue</DialogTitle>
              <DialogDescription>Update venue information.</DialogDescription>
            </DialogHeader>
            <VenueForm formData={formData} setFormData={setFormData} toggleFacility={toggleFacility} />
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setEditingVenue(null)
                  resetForm()
                }}
              >
                Cancel
              </Button>
              <Button onClick={handleEdit}>Save Changes</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation */}
        <AlertDialog open={!!deletingVenue} onOpenChange={() => setDeletingVenue(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Venue?</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete {deletingVenue?.name}? This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </main>
    </>
  )
}

// Venue Form Component
function VenueForm({
  formData,
  setFormData,
  toggleFacility,
}: {
  formData: Partial<Venue>
  setFormData: React.Dispatch<React.SetStateAction<Partial<Venue>>>
  toggleFacility: (facility: string) => void
}) {
  return (
    <div className="grid gap-4 py-4">
      <div className="grid gap-2">
        <Label htmlFor="venue-name">Name *</Label>
        <Input
          id="venue-name"
          value={formData.name || ""}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          placeholder="Grand Hall"
        />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="address">Address *</Label>
        <Input
          id="address"
          value={formData.address || ""}
          onChange={(e) => setFormData({ ...formData, address: e.target.value })}
          placeholder="Building A, FPT University"
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="grid gap-2">
          <Label htmlFor="capacity">Capacity</Label>
          <Input
            id="capacity"
            type="number"
            value={formData.capacity || 100}
            onChange={(e) => setFormData({ ...formData, capacity: Number.parseInt(e.target.value) || 0 })}
            min={1}
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="status">Status</Label>
          <Select
            value={formData.status || "available"}
            onValueChange={(value) => setFormData({ ...formData, status: value as Venue["status"] })}
          >
            <SelectTrigger id="status">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="available">Available</SelectItem>
              <SelectItem value="maintenance">Maintenance</SelectItem>
              <SelectItem value="booked">Booked</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="grid gap-2">
        <Label>Facilities</Label>
        <div className="grid grid-cols-2 gap-2">
          {FACILITIES.map((facility) => (
            <div key={facility.id} className="flex items-center space-x-2">
              <Checkbox
                id={facility.id}
                checked={formData.facilities?.includes(facility.label)}
                onCheckedChange={() => toggleFacility(facility.label)}
              />
              <label
                htmlFor={facility.id}
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 flex items-center gap-1"
              >
                <facility.icon className="h-3 w-3" />
                {facility.label}
              </label>
            </div>
          ))}
        </div>
      </div>
      <div className="grid gap-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={formData.description || ""}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          placeholder="Brief description of the venue..."
          rows={2}
        />
      </div>
    </div>
  )
}

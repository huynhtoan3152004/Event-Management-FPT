/* ============================================
   Organizer Venues Page - CRUD Venues (FINAL FIX)
============================================ */

"use client";

import type React from "react";
import { useState, useEffect } from "react";
import { toast } from "react-toastify";

import {
  Plus,
  Search,
  Edit,
  Trash2,
  MapPin,
  Users,
  MoreVertical,
  Wifi,
  Tv,
  Mic2,
  Wind,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardHeader,
  CardContent,
  CardDescription,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "@/components/ui/dialog";

import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";

import {
  AlertDialog,
  AlertDialogDescription,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";

import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { OrganizerHeader } from "@/components/organizer/header";

import type { Venue } from "@/types";
import { venueService } from "@/lib/services/venue.service";

/* -------------------------------------------
   FACILITIES CONFIG (USE ID)
------------------------------------------- */
const FACILITIES = [
  { id: "projector", label: "Projector", icon: Tv },
  { id: "sound", label: "Sound System", icon: Mic2 },
  { id: "ac", label: "Air Conditioning", icon: Wind },
  { id: "wifi", label: "WiFi", icon: Wifi },
];

/* -------------------------------------------
   MAP STATUS FOR API
------------------------------------------- */
const mapStatusToApi = (status?: string): string => {
  if (!status) return "active";
  if (status === "available") return "active";
  if (status === "booked") return "inactive";
  if (status === "maintenance") return "maintenance";
  return "active";
};

const mapStatusFromApi = (
  status?: string
): "available" | "maintenance" | "booked" => {
  if (!status) return "available";
  const s = status.toLowerCase();

  if (s === "active") return "available";
  if (s === "inactive") return "booked";
  if (s === "maintenance") return "maintenance";
  return "available";
};

/* ============================================
   MAIN PAGE
============================================ */

export default function OrganizerVenuesPage() {
  const [venues, setVenues] = useState<Venue[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingVenue, setEditingVenue] = useState<Venue | null>(null);
  const [deletingVenue, setDeletingVenue] = useState<Venue | null>(null);

  const [formData, setFormData] = useState<Partial<Venue>>({
    name: "",
    address: "",
    capacity: 100,
    facilities: [],
    status: "available",
    description: "",
  });

  /* -------------------------------------------
     LOAD VENUES
  ------------------------------------------- */
  useEffect(() => {
    const loadVenues = async () => {
      try {
        setIsLoading(true);
        const res = await venueService.getAll();

        if (res.success && res.data) {
          const mapped = res.data.map((v) => ({
            id: v.hallId,
            name: v.name,
            address: v.location || "",
            capacity: v.capacity,
            description: v.description || "",
            status: mapStatusFromApi(v.status),
            facilities: v.facilities
              ? v.facilities.split(",").map((f) => f.trim())
              : [],
          }));

          setVenues(mapped);
        }
      } catch (err) {
        console.error(err);
        toast.error("Failed to load venues");
      } finally {
        setIsLoading(false);
      }
    };

    loadVenues();
  }, []);

  /* -------------------------------------------
     CREATE VENUE
  ------------------------------------------- */
  const handleCreate = async () => {
    try {
      toast.info("Creating venue...");

      const payload = {
        name: formData.name!,
        location: formData.address!,
        capacity: formData.capacity!,
        description: formData.description || "",
        facilities: (formData.facilities || []).join(","), // IDs
        status: mapStatusToApi(formData.status),
      };

      const res = await venueService.create(payload);

      if (res.success && res.data) {
        toast.success("Venue created successfully!");

        const v = res.data;

        const newVenue: Venue = {
          id: v.hallId,
          name: v.name,
          address: v.location,
          capacity: v.capacity,
          status: mapStatusFromApi(v.status),
          facilities: v.facilities ? v.facilities.split(",") : [],
          description: v.description,
        };

        setVenues([...venues, newVenue]);
        resetForm();
        setIsCreateOpen(false);
      }
    } catch (e) {
      toast.error("Failed to create venue");
      console.error(e);
    }
  };

  /* -------------------------------------------
     UPDATE VENUE
  ------------------------------------------- */
  const handleEdit = async () => {
    if (!editingVenue) return;

    try {
      toast.info("Updating venue...");

      const payload = {
        name: formData.name!,
        location: formData.address!,
        capacity: formData.capacity!,
        description: formData.description || "",
        facilities: (formData.facilities || []).join(","), // IDs
        status: mapStatusToApi(formData.status),
      };

      const res = await venueService.update(editingVenue.id, payload);

      if (res.success && res.data) {
        toast.success("Venue updated successfully!");

        const v = res.data;

        const updatedVenue: Venue = {
          id: v.hallId,
          name: v.name,
          address: v.location,
          capacity: v.capacity,
          status: mapStatusFromApi(v.status),
          facilities: v.facilities ? v.facilities.split(",") : [],
          description: v.description,
        };

        setVenues((prev) =>
          prev.map((x) => (x.id === editingVenue.id ? updatedVenue : x))
        );

        resetForm();
        setEditingVenue(null);
      }
    } catch (e) {
      toast.error("Failed to update venue");
      console.error(e);
    }
  };

  /* -------------------------------------------
     DELETE VENUE
  ------------------------------------------- */
  const handleDelete = async () => {
    if (!deletingVenue) return;

    try {
      toast.info("Deleting venue...");
      const res = await venueService.delete(deletingVenue.id);

      if (res.success) {
        toast.success("Venue deleted successfully!");

        setVenues((prev) => prev.filter((v) => v.id !== deletingVenue.id));
      }
    } catch (e) {
      toast.error("Failed to delete venue");
    } finally {
      setDeletingVenue(null);
    }
  };

  /* -------------------------------------------
     RESET FORM
  ------------------------------------------- */
  const resetForm = () => {
    setFormData({
      name: "",
      address: "",
      capacity: 100,
      facilities: [],
      status: "available",
      description: "",
    });
  };

  /* -------------------------------------------
     OPEN EDIT
  ------------------------------------------- */
  const openEditDialog = (venue: Venue) => {
    setFormData({
      name: venue.name,
      address: venue.address,
      capacity: venue.capacity,
      facilities: venue.facilities,
      status: venue.status,
      description: venue.description,
    });

    setEditingVenue(venue);
  };

  /* -------------------------------------------
     TOGGLE FACILITY USING ID
  ------------------------------------------- */
  const toggleFacility = (id: string) => {
    setFormData((prev) => {
      const list = prev.facilities || [];
      return list.includes(id)
        ? { ...prev, facilities: list.filter((x) => x !== id) }
        : { ...prev, facilities: [...list, id] };
    });
  };

  /* ============================================
     UI
  ============================================ */

  return (
    <>
      <OrganizerHeader title="Venues" />

      <main className="p-6 space-y-6">
        {/* SEARCH */}
        <div className="flex justify-between gap-4">
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
                <DialogDescription>Enter venue information.</DialogDescription>
              </DialogHeader>

              <VenueForm
                formData={formData}
                setFormData={setFormData}
                toggleFacility={toggleFacility}
              />

              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setIsCreateOpen(false)}
                >
                  Cancel
                </Button>
                <Button onClick={handleCreate}>Create</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* VENUES GRID */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {venues.map((venue) => (
            <Card key={venue.id} className="hover:shadow-md transition">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-base">{venue.name}</CardTitle>

                    <CardDescription className="flex items-center gap-1 mt-1">
                      <MapPin className="h-3 w-3" />
                      {venue.address}
                    </CardDescription>
                  </div>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreVertical />
                      </Button>
                    </DropdownMenuTrigger>

                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => openEditDialog(venue)}>
                        <Edit className="h-4 w-4 mr-2" /> Edit
                      </DropdownMenuItem>

                      <DropdownMenuItem
                        className="text-destructive"
                        onClick={() => setDeletingVenue(venue)}
                      >
                        <Trash2 className="h-4 w-4 mr-2" /> Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardHeader>

              <CardContent className="space-y-3">
                <div className="flex justify-between items-center text-sm">
                  <span className="flex items-center gap-1">
                    <Users className="h-4 w-4" />
                    Capacity: {venue.capacity}
                  </span>

                  <Badge>
                    {venue.status.charAt(0).toUpperCase() +
                      venue.status.slice(1)}
                  </Badge>
                </div>

                {venue.description && (
                  <p className="text-xs text-muted-foreground line-clamp-2">
                    {venue.description}
                  </p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* EDIT */}
        <Dialog
          open={!!editingVenue}
          onOpenChange={() => {
            setEditingVenue(null);
            resetForm();
          }}
        >
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Edit Venue</DialogTitle>
            </DialogHeader>

            <VenueForm
              formData={formData}
              setFormData={setFormData}
              toggleFacility={toggleFacility}
            />

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setEditingVenue(null);
                  resetForm();
                }}
              >
                Cancel
              </Button>
              <Button onClick={handleEdit}>Save Changes</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* DELETE */}
        <AlertDialog
          open={!!deletingVenue}
          onOpenChange={() => setDeletingVenue(null)}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>
                Delete venue "{deletingVenue?.name}"?
              </AlertDialogTitle>

              <AlertDialogDescription>
                This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>

            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                className="bg-destructive text-destructive-foreground"
                onClick={handleDelete}
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </main>
    </>
  );
}

/* ============================================
   FORM COMPONENT
============================================ */

function VenueForm({
  formData,
  setFormData,
  toggleFacility,
}: {
  formData: Partial<Venue>;
  setFormData: React.Dispatch<React.SetStateAction<Partial<Venue>>>;
  toggleFacility: (id: string) => void;
}) {
  return (
    <div className="grid gap-4 py-4">
      {/* NAME */}
      <div>
        <Label>Name *</Label>
        <Input
          value={formData.name || ""}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
        />
      </div>

      {/* ADDRESS */}
      <div>
        <Label>Address *</Label>
        <Input
          value={formData.address || ""}
          onChange={(e) =>
            setFormData({ ...formData, address: e.target.value })
          }
        />
      </div>

      {/* CAPACITY + STATUS */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Capacity</Label>
          <Input
            type="number"
            value={formData.capacity || 100}
            onChange={(e) =>
              setFormData({ ...formData, capacity: Number(e.target.value) })
            }
          />
        </div>

        <div>
          <Label>Status</Label>
          <Select
            value={formData.status || "available"}
            onValueChange={(v) =>
              setFormData({ ...formData, status: v as Venue["status"] })
            }
          >
            <SelectTrigger>
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

      {/* FACILITIES */}
      <div>
        <Label>Facilities</Label>

        <div className="grid grid-cols-2 gap-2">
          {FACILITIES.map((f) => (
            <div key={f.id} className="flex gap-2 items-center">
              <Checkbox
                checked={formData.facilities?.includes(f.id)}
                onCheckedChange={() => toggleFacility(f.id)}
              />
              <span className="flex gap-1 items-center">
                <f.icon className="h-3 w-3" />
                {f.label}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* DESCRIPTION */}
      <div>
        <Label>Description</Label>
        <Textarea
          value={formData.description || ""}
          onChange={(e) =>
            setFormData({ ...formData, description: e.target.value })
          }
        />
      </div>
    </div>
  );
}

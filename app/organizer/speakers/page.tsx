/* ============================================
   Organizer Speakers Page - CRUD Speakers
   Manage speakers for events
   ============================================ */

"use client"

import type React from "react"

import { useState } from "react"
import { Plus, Search, Edit, Trash2, Mail, Linkedin, MoreVertical } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
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
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { OrganizerHeader } from "@/components/organizer/header"
import { MOCK_SPEAKERS } from "@/lib/constants"
import type { Speaker } from "@/types"

export default function OrganizerSpeakersPage() {
  const [speakers, setSpeakers] = useState<Speaker[]>(MOCK_SPEAKERS)
  const [searchQuery, setSearchQuery] = useState("")
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [editingSpeaker, setEditingSpeaker] = useState<Speaker | null>(null)
  const [deletingSpeaker, setDeletingSpeaker] = useState<Speaker | null>(null)

  // Form state
  const [formData, setFormData] = useState<Partial<Speaker>>({
    name: "",
    title: "",
    company: "",
    bio: "",
    email: "",
    linkedIn: "",
  })

  const filteredSpeakers = speakers.filter(
    (speaker) =>
      speaker.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      speaker.company?.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  // Handle create
  const handleCreate = () => {
    const newSpeaker: Speaker = {
      id: `speaker-${Date.now()}`,
      name: formData.name || "",
      title: formData.title || "",
      company: formData.company,
      bio: formData.bio,
      email: formData.email,
      linkedIn: formData.linkedIn,
      avatar: "/placeholder.svg?key=new-speaker",
    }
    setSpeakers([...speakers, newSpeaker])
    setFormData({ name: "", title: "", company: "", bio: "", email: "", linkedIn: "" })
    setIsCreateOpen(false)
  }

  // Handle edit
  const handleEdit = () => {
    if (!editingSpeaker) return
    setSpeakers(speakers.map((s) => (s.id === editingSpeaker.id ? { ...s, ...formData } : s)))
    setEditingSpeaker(null)
    setFormData({ name: "", title: "", company: "", bio: "", email: "", linkedIn: "" })
  }

  // Handle delete
  const handleDelete = () => {
    if (!deletingSpeaker) return
    setSpeakers(speakers.filter((s) => s.id !== deletingSpeaker.id))
    setDeletingSpeaker(null)
  }

  // Open edit dialog
  const openEditDialog = (speaker: Speaker) => {
    setFormData({
      name: speaker.name,
      title: speaker.title,
      company: speaker.company,
      bio: speaker.bio,
      email: speaker.email,
      linkedIn: speaker.linkedIn,
    })
    setEditingSpeaker(speaker)
  }

  return (
    <>
      <OrganizerHeader title="Speakers" />

      <main className="flex-1 p-4 lg:p-6 space-y-6">
        {/* Actions Bar */}
        <div className="flex flex-col sm:flex-row gap-4 justify-between">
          <div className="relative max-w-sm flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search speakers..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>

          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button className="rounded-full">
                <Plus className="h-4 w-4 mr-2" />
                Add Speaker
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Speaker</DialogTitle>
                <DialogDescription>Add a new speaker to your speaker pool for events.</DialogDescription>
              </DialogHeader>
              <SpeakerForm formData={formData} setFormData={setFormData} />
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsCreateOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreate} disabled={!formData.name || !formData.title}>
                  Add Speaker
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Speakers Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredSpeakers.map((speaker) => (
            <Card key={speaker.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-start gap-4">
                  <Avatar className="h-16 w-16">
                    <AvatarImage src={speaker.avatar || "/placeholder.svg"} alt={speaker.name} />
                    <AvatarFallback>{speaker.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-semibold text-foreground">{speaker.name}</h3>
                        <p className="text-sm text-muted-foreground">{speaker.title}</p>
                        {speaker.company && (
                          <Badge variant="secondary" className="mt-1 text-xs">
                            {speaker.company}
                          </Badge>
                        )}
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => openEditDialog(speaker)}>
                            <Edit className="h-4 w-4 mr-2" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => setDeletingSpeaker(speaker)} className="text-destructive">
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                    {speaker.bio && <p className="text-xs text-muted-foreground mt-2 line-clamp-2">{speaker.bio}</p>}
                    <div className="flex gap-2 mt-3">
                      {speaker.email && (
                        <Button variant="ghost" size="icon" className="h-7 w-7" asChild>
                          <a href={`mailto:${speaker.email}`}>
                            <Mail className="h-3.5 w-3.5" />
                          </a>
                        </Button>
                      )}
                      {speaker.linkedIn && (
                        <Button variant="ghost" size="icon" className="h-7 w-7" asChild>
                          <a href={speaker.linkedIn} target="_blank" rel="noopener noreferrer">
                            <Linkedin className="h-3.5 w-3.5" />
                          </a>
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredSpeakers.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">No speakers found. Add your first speaker!</div>
        )}

        {/* Edit Dialog */}
        <Dialog open={!!editingSpeaker} onOpenChange={() => setEditingSpeaker(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Speaker</DialogTitle>
              <DialogDescription>Update speaker information.</DialogDescription>
            </DialogHeader>
            <SpeakerForm formData={formData} setFormData={setFormData} />
            <DialogFooter>
              <Button variant="outline" onClick={() => setEditingSpeaker(null)}>
                Cancel
              </Button>
              <Button onClick={handleEdit}>Save Changes</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation */}
        <AlertDialog open={!!deletingSpeaker} onOpenChange={() => setDeletingSpeaker(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Speaker?</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete {deletingSpeaker?.name}? This action cannot be undone.
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

// Speaker Form Component
function SpeakerForm({
  formData,
  setFormData,
}: {
  formData: Partial<Speaker>
  setFormData: React.Dispatch<React.SetStateAction<Partial<Speaker>>>
}) {
  return (
    <div className="grid gap-4 py-4">
      <div className="grid gap-2">
        <Label htmlFor="name">Name *</Label>
        <Input
          id="name"
          value={formData.name || ""}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          placeholder="Dr. Nguyen Van A"
        />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="title">Title *</Label>
        <Input
          id="title"
          value={formData.title || ""}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          placeholder="AI Research Lead"
        />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="company">Company</Label>
        <Input
          id="company"
          value={formData.company || ""}
          onChange={(e) => setFormData({ ...formData, company: e.target.value })}
          placeholder="FPT Software"
        />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="bio">Bio</Label>
        <Textarea
          id="bio"
          value={formData.bio || ""}
          onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
          placeholder="Brief biography..."
          rows={3}
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="grid gap-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            value={formData.email || ""}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            placeholder="email@example.com"
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="linkedin">LinkedIn</Label>
          <Input
            id="linkedin"
            value={formData.linkedIn || ""}
            onChange={(e) => setFormData({ ...formData, linkedIn: e.target.value })}
            placeholder="https://linkedin.com/in/..."
          />
        </div>
      </div>
    </div>
  )
}

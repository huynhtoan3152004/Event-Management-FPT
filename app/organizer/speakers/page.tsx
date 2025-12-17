/* ============================================
   Organizer Speakers Page - CRUD Speakers
============================================ */

"use client";

import type React from "react";
import { useState, useEffect } from "react";

import {
  Plus,
  Search,
  Edit,
  Trash2,
  Mail,
  Linkedin,
  MoreVertical,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { OrganizerHeader } from "@/components/organizer/header";

import { toast } from "react-toastify";
import { speakerService } from "@/lib/services/speaker.service";

/* ============================================
   Speaker Type
============================================ */
export interface Speaker {
  id: string;
  name: string;
  title?: string;
  company?: string;
  bio?: string;
  email?: string;
  linkedIn?: string;
  avatar?: string;
  phone?: string | null;
}

/* ============================================
   MAIN PAGE COMPONENT
============================================ */

export default function OrganizerSpeakersPage() {
  const [speakers, setSpeakers] = useState<Speaker[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [searchQuery, setSearchQuery] = useState("");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingSpeaker, setEditingSpeaker] = useState<Speaker | null>(null);
  const [deletingSpeaker, setDeletingSpeaker] = useState<Speaker | null>(null);

  // Form state
  const [formData, setFormData] = useState<Partial<Speaker>>({});
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // ⬇️ THÊM validateForm() ngay dưới đây
  const validateForm = () => {
    const errors: string[] = [];

    if (!formData.name || formData.name.trim() === "") {
      errors.push("Name is required.");
    }

    if (!formData.title || formData.title.trim() === "") {
      errors.push("Title is required.");
    }

    if (formData.email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        errors.push("Invalid email format.");
      }
    }

    if (formData.linkedIn) {
      try {
        new URL(formData.linkedIn);
      } catch {
        errors.push("LinkedIn must be a valid URL.");
      }
    }

   

    if (errors.length > 0) {
      errors.forEach((err) => toast.error(err));
      return false;
    }

    return true;
  };
  /* ============================================
     GET SPEAKERS
  ============================================ */
  useEffect(() => {
    const fetchSpeakers = async () => {
      try {
        setIsLoading(true);
        const res = await speakerService.getAll();

        if (res.success && res.data) {
          const mapped = res.data.map((sp: any) => ({
            id: sp.speakerId,
            name: sp.name,
            title: sp.title,
            company: sp.company,
            bio: sp.bio,
            email: sp.email,
            linkedIn: sp.linkedinUrl,
            avatar: sp.avatarUrl || "/placeholder.svg",
            phone: sp.phone,
          }));

          setSpeakers(mapped);
        } else {
          toast.error("Không thể lấy danh sách speakers");
        }
      } catch (err) {
        console.error(err);
        toast.error("Lỗi khi tải speakers.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchSpeakers();
  }, []);

  /* ============================================
     FILTER SEARCH
  ============================================ */
  const filteredSpeakers = speakers.filter(
    (speaker) =>
      speaker.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      speaker.company?.toLowerCase().includes(searchQuery.toLowerCase())
  );
  /* ============================================
     CREATE (Local Only)
  ============================================ */
  /* ============================================
   CREATE (API)
============================================ */
  const handleCreate = async () => {
    if (!validateForm()) return;
  try {
    setIsSubmitting(true);

    const payload = {
      name: formData.name || "",
      title: formData.title,
      company: formData.company,
      bio: formData.bio,
      email: formData.email,
      linkedIn: formData.linkedIn,
      phone: formData.phone,
      imageFile: selectedImage || null,
    };

    const res = await speakerService.create(payload);

    if (res.success) {
      toast.success("Created speaker successfully!");

      // 🔥 Map speaker mới từ API trả về
      const newSpeaker: Speaker = {
        id: res.data.speakerId,
        name: res.data.name,
        title: res.data.title,
        company: res.data.company,
        bio: res.data.bio,
        email: res.data.email,
        linkedIn: res.data.linkedinUrl,
        avatar: res.data.avatarUrl || "/placeholder.svg",
        phone: res.data.phone,
      };

      setSpeakers((prev) => [newSpeaker, ...prev]);

      // Reset form
      setFormData({});
      setPreviewImage(null);
      setSelectedImage(null);
      setIsCreateOpen(false);
    } else {
      toast.error(res.message || "Failed to create speaker.");
    }
  } catch (err) {
    console.error(err);
    toast.error("Error while creating speaker.");
  } finally {
    setIsSubmitting(false);
  }
};


  /* ============================================
     UPDATE (API)
  ============================================ */
  const handleEdit = async () => {
      if (!validateForm()) return;
    if (!editingSpeaker) return;

    try {
      setIsSubmitting(true);

      const payload = {
        name: formData.name || "",
        title: formData.title,
        company: formData.company,
        bio: formData.bio,
        email: formData.email,
        linkedIn: formData.linkedIn,
        phone: formData.phone,
        imageFile: selectedImage || null,
      };

      const res = await speakerService.update(editingSpeaker.id, payload);

      if (res.success) {
        toast.success("Updated speaker successfully!");

        setSpeakers((prev) =>
          prev.map((s) =>
            s.id === editingSpeaker.id
              ? {
                  ...s,
                  ...formData,
                  avatar: previewImage || s.avatar,
                }
              : s
          )
        );

        setEditingSpeaker(null);
        setFormData({});
        setPreviewImage(null);
        setSelectedImage(null);
      } else {
        toast.error(res.message || "Failed to update.");
      }
    } catch (err) {
      console.error(err);
      toast.error("Error while updating.");
    } finally {
      setIsSubmitting(false);
    }
  };

  /* ============================================
     DELETE (API)
  ============================================ */
  const handleDelete = async () => {
    if (!deletingSpeaker) return;

    try {
      const res = await speakerService.delete(deletingSpeaker.id);

      if (res.success) {
        setSpeakers((prev) => prev.filter((s) => s.id !== deletingSpeaker.id));
        toast.success("Deleted speaker successfully!");
      } else {
        toast.error(res.message || "Failed to delete.");
      }
    } catch (err) {
      console.error(err);
      toast.error("Error while deleting.");
    }

    setDeletingSpeaker(null);
  };

  /* ============================================
     OPEN EDIT DIALOG
  ============================================ */
  const openEditDialog = (speaker: Speaker) => {
    setFormData(speaker);
    setPreviewImage(speaker.avatar || null);
    setSelectedImage(null);
    setEditingSpeaker(speaker);
  };

  /* ============================================
     UI RENDER
  ============================================ */
  return (
    <>
      <OrganizerHeader title="Speakers" />

      <main className="flex-1 p-4 lg:p-6 space-y-6">
        {/* Header Tools */}
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

          {/* CREATE BUTTON */}
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
              </DialogHeader>

              <SpeakerForm
                formData={formData}
                setFormData={setFormData}
                selectedImage={selectedImage}
                setSelectedImage={setSelectedImage}
                previewImage={previewImage}
                setPreviewImage={setPreviewImage}
              />

              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setIsCreateOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  disabled={!formData.name || isSubmitting}
                  onClick={handleCreate}
                >
                  {isSubmitting ? "Creating..." : "Add Speaker"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* SPEAKERS GRID */}
        {isLoading ? (
          <div className="text-center text-muted-foreground py-10">
            Loading speakers...
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredSpeakers.map((speaker) => (
              <Card
                key={speaker.id}
                className="hover:shadow-md transition-shadow rounded-xl p-4"
              >
                <CardContent className="p-0">
                  <div className="flex items-start gap-4">
                    <Avatar className="h-16 w-16">
                      <AvatarImage src={speaker.avatar} />
                      <AvatarFallback>{speaker.name.charAt(0)}</AvatarFallback>
                    </Avatar>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-semibold text-lg line-clamp-1">
                            {speaker.name}
                          </h3>
                          <p className="text-sm text-muted-foreground line-clamp-2">
                            {speaker.title}
                          </p>

                          {speaker.company && (
                            <Badge variant="secondary" className="mt-1 text-xs">
                              {speaker.company}
                            </Badge>
                          )}
                        </div>

                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>

                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() => openEditDialog(speaker)}
                            >
                              <Edit className="h-4 w-4 mr-2" /> Edit
                            </DropdownMenuItem>

                            <DropdownMenuItem
                              className="text-destructive"
                              onClick={() => setDeletingSpeaker(speaker)}
                            >
                              <Trash2 className="h-4 w-4 mr-2" /> Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>

                      {speaker.bio && (
                        <p className="text-sm text-muted-foreground mt-3 line-clamp-3">
                          {speaker.bio}
                        </p>
                      )}

                      <div className="flex gap-3 mt-4">
                        {speaker.email && (
                          <a href={`mailto:${speaker.email}`}>
                            <Mail className="h-5 w-5 opacity-80 hover:opacity-100" />
                          </a>
                        )}

                        {speaker.linkedIn && (
                          <a href={speaker.linkedIn} target="_blank">
                            <Linkedin className="h-5 w-5 opacity-80 hover:opacity-100" />
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* NO RESULT */}
        {!isLoading && filteredSpeakers.length === 0 && (
          <div className="text-center py-16 text-muted-foreground">
            No speakers found.
          </div>
        )}

        {/* EDIT DIALOG */}
        <Dialog
          open={!!editingSpeaker}
          onOpenChange={() => setEditingSpeaker(null)}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Speaker</DialogTitle>
            </DialogHeader>

            <SpeakerForm
              formData={formData}
              setFormData={setFormData}
              selectedImage={selectedImage}
              setSelectedImage={setSelectedImage}
              previewImage={previewImage}
              setPreviewImage={setPreviewImage}
            />

            <DialogFooter>
              <Button variant="outline" onClick={() => setEditingSpeaker(null)}>
                Cancel
              </Button>
              <Button disabled={isSubmitting} onClick={handleEdit}>
                {isSubmitting ? "Saving..." : "Save Changes"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* DELETE CONFIRM */}
        <AlertDialog
          open={!!deletingSpeaker}
          onOpenChange={() => setDeletingSpeaker(null)}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Speaker?</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete "{deletingSpeaker?.name}"?
              </AlertDialogDescription>
            </AlertDialogHeader>

            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                className="bg-destructive"
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
   SPEAKER FORM COMPONENT
============================================ */

function SpeakerForm({
  formData,
  setFormData,
  selectedImage,
  setSelectedImage,
  previewImage,
  setPreviewImage,
}: any) {
  return (
    <div className="grid gap-4 py-4">
      {/* Avatar */}
      <div className="flex flex-col items-center gap-3">
        <Avatar className="h-20 w-20">
          <AvatarImage
            src={previewImage || formData.avatar || "/placeholder.svg"}
          />
          <AvatarFallback>{formData.name?.charAt(0)}</AvatarFallback>
        </Avatar>

        <Input
          type="file"
          accept="image/*"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) {
              setSelectedImage(file);
              setPreviewImage(URL.createObjectURL(file));
            }
          }}
        />
      </div>

      <div className="grid gap-2">
        <Label>Name *</Label>
        <Input
          maxLength={50}
          value={formData.name || ""}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
        />
        <p className="text-xs text-muted-foreground text-right">
          {formData.name?.length || 0}/50
        </p>
      </div>

      <div className="grid gap-2">
        <Label>Title *</Label>
        <Input
          maxLength={60}
          value={formData.title || ""}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
        />
        <p className="text-xs text-muted-foreground text-right">
          {formData.title?.length || 0}/60
        </p>
      </div>

      <div className="grid gap-2">
        <Label>Company</Label>
        <Input
          value={formData.company || ""}
          onChange={(e) =>
            setFormData({ ...formData, company: e.target.value })
          }
        />
      </div>

      <div className="grid gap-2">
        <Label>Bio</Label>
        <Textarea
          rows={4}
          maxLength={180}
          value={formData.bio || ""}
          onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
        />
        <p className="text-xs text-muted-foreground text-right">
          {formData.bio?.length || 0}/180
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="grid gap-2">
          <Label>Email</Label>
          <Input
            value={formData.email || ""}
            onChange={(e) =>
              setFormData({ ...formData, email: e.target.value })
            }
          />
        </div>

        <div className="grid gap-2">
          <Label>LinkedIn</Label>
          <Input
            value={formData.linkedIn || ""}
            onChange={(e) =>
              setFormData({ ...formData, linkedIn: e.target.value })
            }
          />
        </div>
      </div>
    </div>
  );
}

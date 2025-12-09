/* ============================================
   Edit Event Page (Organizer)
   Form chỉnh sửa sự kiện, gửi multipart/form-data
   ============================================ */

"use client"

import { useEffect, useState, useRef } from "react"
import { useRouter, useParams } from "next/navigation"
import { toast } from "react-toastify"
import {
  Calendar,
  Clock,
  MapPin,
  Rows,
  Upload,
  Users,
  LayoutGrid,
  Tag,
  Loader2,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { eventService, EventDetailDto } from "@/lib/services/event.service"
import apiClient from "@/lib/api/client"
import Image from "next/image"

type Hall = {
  hallId: string
  name: string
  location?: string
  capacity?: number
  status?: string
}

type Speaker = {
  speakerId: string
  name: string
  bio?: string
}

export default function EditEventPage() {
  const router = useRouter()
  const params = useParams()
  const eventId = params.id as string
  
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [eventData, setEventData] = useState<EventDetailDto | null>(null)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [currentImageUrl, setCurrentImageUrl] = useState<string | null>(null)
  const [halls, setHalls] = useState<Hall[]>([])
  const [isHallsLoading, setIsHallsLoading] = useState(false)
  const [selectedHallId, setSelectedHallId] = useState<string | undefined>(undefined)
  const [speakers, setSpeakers] = useState<Speaker[]>([])
  const [isSpeakersLoading, setIsSpeakersLoading] = useState(false)
  const [selectedSpeakerIds, setSelectedSpeakerIds] = useState<string[]>([])
  
  const formRef = useRef<HTMLFormElement>(null)

  // Fetch event data
  useEffect(() => {
    const fetchEvent = async () => {
      if (!eventId) return
      
      try {
        setIsLoading(true)
        const response = await eventService.getEventById(eventId)
        
        if (response.success && response.data) {
          setEventData(response.data)
          setSelectedHallId(response.data.hallId || undefined)
          setCurrentImageUrl(response.data.imageUrl || null)
          
          // Set selected speakers
          if (response.data.speakers && response.data.speakers.length > 0) {
            setSelectedSpeakerIds(response.data.speakers.map(s => s.speakerId))
          }
          
          // Pre-fill form after a short delay to ensure form is rendered
          setTimeout(() => {
            if (formRef.current) {
              const form = formRef.current
              const data = response.data
              
              // Set form values
              const titleInput = form.querySelector<HTMLInputElement>('#title')
              if (titleInput) titleInput.value = data.title || ''
              
              const descInput = form.querySelector<HTMLTextAreaElement>('#description')
              if (descInput) descInput.value = data.description || ''
              
              const dateInput = form.querySelector<HTMLInputElement>('#date')
              if (dateInput) dateInput.value = data.date || ''
              
              const startTimeInput = form.querySelector<HTMLInputElement>('#startTime')
              if (startTimeInput && data.startTime) {
                startTimeInput.value = data.startTime.substring(0, 5) // HH:mm
              }
              
              const endTimeInput = form.querySelector<HTMLInputElement>('#endTime')
              if (endTimeInput && data.endTime) {
                endTimeInput.value = data.endTime.substring(0, 5) // HH:mm
              }
              
              const locationInput = form.querySelector<HTMLInputElement>('#location')
              if (locationInput) locationInput.value = data.location || ''
              
              const clubNameInput = form.querySelector<HTMLInputElement>('#clubName')
              if (clubNameInput) clubNameInput.value = data.clubName || ''
              
              const totalSeatsInput = form.querySelector<HTMLInputElement>('#totalSeats')
              if (totalSeatsInput) totalSeatsInput.value = String(data.totalSeats || 0)
              
              // Note: Backend doesn't return NumberOfRows and SeatsPerRow in EventDetailDto
              // We need to calculate or get from event entity if available
              // For now, we'll calculate based on totalSeats (simple approximation)
              const rowsInput = form.querySelector<HTMLInputElement>('#rows')
              // Try to get from eventData if available, otherwise calculate
              const estimatedRows = data.totalSeats ? Math.ceil(Math.sqrt(data.totalSeats)) : 0
              if (rowsInput) rowsInput.value = String(estimatedRows)
              
              const seatsPerRowInput = form.querySelector<HTMLInputElement>('#seatsPerRow')
              const estimatedSeatsPerRow = estimatedRows > 0 ? Math.ceil(data.totalSeats / estimatedRows) : 0
              if (seatsPerRowInput) seatsPerRowInput.value = String(estimatedSeatsPerRow)
              
              const tagsInput = form.querySelector<HTMLInputElement>('#tags')
              if (tagsInput) tagsInput.value = data.tags || ''
              
              const maxTicketsInput = form.querySelector<HTMLInputElement>('#maxTicketsPerUser')
              if (maxTicketsInput && data.maxTicketsPerUser) {
                maxTicketsInput.value = String(data.maxTicketsPerUser)
              }
              
              // Set registration dates
              if (data.registrationStart) {
                const regStartInput = form.querySelector<HTMLInputElement>('#registrationStart')
                if (regStartInput) {
                  const regStart = new Date(data.registrationStart)
                  regStartInput.value = regStart.toISOString().slice(0, 16) // YYYY-MM-DDTHH:mm
                }
              }
              
              if (data.registrationEnd) {
                const regEndInput = form.querySelector<HTMLInputElement>('#registrationEnd')
                if (regEndInput) {
                  const regEnd = new Date(data.registrationEnd)
                  regEndInput.value = regEnd.toISOString().slice(0, 16) // YYYY-MM-DDTHH:mm
                }
              }
            }
          }, 100)
        } else {
          toast.error(response.message || 'Không tìm thấy sự kiện')
          router.push('/organizer/events')
        }
      } catch (error: any) {
        console.error('Error fetching event:', error)
        toast.error('Không thể tải thông tin sự kiện. Vui lòng thử lại.')
        router.push('/organizer/events')
      } finally {
        setIsLoading(false)
      }
    }

    fetchEvent()
  }, [eventId, router])

  useEffect(() => {
    const fetchHalls = async () => {
      try {
        setIsHallsLoading(true)
        const res = await apiClient.get<{ success: boolean; data: Hall[] }>("/api/Halls")
        if (Array.isArray(res.data?.data)) {
          setHalls(res.data.data)
        }
      } catch (error) {
        toast.error("Không tải được danh sách hall, hãy thử lại hoặc nhập Location thủ công.")
      } finally {
        setIsHallsLoading(false)
      }
    }
    fetchHalls()
  }, [])

  useEffect(() => {
    const fetchSpeakers = async () => {
      try {
        setIsSpeakersLoading(true)
        const res = await apiClient.get<{ success: boolean; data: Speaker[] }>("/api/Speakers")
        if (Array.isArray(res.data?.data)) {
          setSpeakers(res.data.data)
        }
      } catch (error) {
        toast.error("Không tải được danh sách speaker, bạn có thể nhập thủ công ở backend.")
      } finally {
        setIsSpeakersLoading(false)
      }
    }
    fetchSpeakers()
  }, [])

  const handleSubmit = async (formData: FormData) => {
    if (!eventId) return
    
    try {
      setIsSubmitting(true)

      // Extract values
      const payload = {
        title: formData.get("title") as string,
        description: (formData.get("description") as string) || undefined,
        date: formData.get("date") as string,
        startTime: formData.get("startTime") as string,
        endTime: formData.get("endTime") as string,
        location: (formData.get("location") as string) || undefined,
        hallId: selectedHallId || undefined,
        clubName: (formData.get("clubName") as string) || undefined,
        totalSeats: Number(formData.get("totalSeats") || 0),
        rows: Number(formData.get("rows") || 0),
        seatsPerRow: Number(formData.get("seatsPerRow") || 0),
        registrationStart: (formData.get("registrationStart") as string) || undefined,
        registrationEnd: (formData.get("registrationEnd") as string) || undefined,
        tags:
          (formData.get("tags") as string)
            ?.split(",")
            .map((t) => t.trim())
            .filter(Boolean) || [],
        maxTicketsPerUser: formData.get("maxTicketsPerUser")
          ? Number(formData.get("maxTicketsPerUser"))
          : undefined,
        imageFile: imageFile || undefined, // Chỉ gửi nếu có file mới
      }

      if (!payload.title || !payload.date || !payload.startTime || !payload.endTime) {
        toast.error("Vui lòng nhập đủ Title, Date, StartTime, EndTime")
        setIsSubmitting(false)
        return
      }

      if (!payload.totalSeats || !payload.rows || !payload.seatsPerRow) {
        toast.error("Vui lòng nhập TotalSeats, Rows, SeatsPerRow")
        setIsSubmitting(false)
        return
      }

      await eventService.updateEvent(eventId, payload)
      toast.success("Cập nhật sự kiện thành công!")
      router.push("/organizer/events")
    } catch (error: any) {
      let message = "Cập nhật sự kiện thất bại. Vui lòng kiểm tra lại dữ liệu."
      
      if (error?.response?.data) {
        message = error.response.data.message || error.response.data.error || message
      } else if (error?.message) {
        message = error.message
      }
      
      console.error('Error updating event:', error)
      toast.error(message, {
        position: 'top-right',
        autoClose: 6000,
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const form = new FormData(e.currentTarget)
    handleSubmit(form)
  }

  if (isLoading) {
    return (
      <main className="min-h-screen bg-muted/30 py-6">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        </div>
      </main>
    )
  }

  if (!eventData) {
    return null
  }

  return (
    <main className="min-h-screen bg-muted/30 py-6">
      <div className="max-w-6xl mx-auto px-4 space-y-6">
        <div>
          <p className="text-sm text-muted-foreground mb-1">Organizer / Events</p>
          <h1 className="text-2xl font-bold text-foreground">Chỉnh sửa sự kiện</h1>
          <p className="text-muted-foreground text-sm">
            Cập nhật thông tin chi tiết sự kiện.
          </p>
        </div>

        <form ref={formRef} onSubmit={onSubmit} className="grid lg:grid-cols-3 gap-4">
          {/* Left column */}
          <div className="lg:col-span-2 space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Thông tin chính</CardTitle>
                <CardDescription>Tiêu đề, mô tả, thời gian và địa điểm</CardDescription>
              </CardHeader>
              <CardContent className="grid md:grid-cols-2 gap-4">
                <div className="md:col-span-2 space-y-2">
                  <Label htmlFor="title">Tiêu đề *</Label>
                  <Input id="title" name="title" placeholder="FPTU Tech Summit 2025" required />
                </div>

                <div className="md:col-span-2 space-y-2">
                  <Label htmlFor="description">Mô tả</Label>
                  <Textarea
                    id="description"
                    name="description"
                    placeholder="Mô tả ngắn gọn về sự kiện..."
                    rows={4}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="date">Ngày *</Label>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <Input id="date" name="date" type="date" required />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="startTime">Giờ bắt đầu *</Label>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <Input id="startTime" name="startTime" type="time" required />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="endTime">Giờ kết thúc *</Label>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <Input id="endTime" name="endTime" type="time" required />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="location">Địa điểm</Label>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <Input id="location" name="location" placeholder="Hall A, FPTU HCMC" />
                  </div>
                  <p className="text-xs text-muted-foreground">Nếu chọn Hall phía dưới, Location có thể để trống.</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Chỗ ngồi & Vé</CardTitle>
                <CardDescription>Thiết lập Rows, SeatsPerRow và giới hạn vé</CardDescription>
              </CardHeader>
              <CardContent className="grid md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="totalSeats">TotalSeats *</Label>
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <Input
                      id="totalSeats"
                      name="totalSeats"
                      type="number"
                      min={1}
                      placeholder="500"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="rows">Rows *</Label>
                  <div className="flex items-center gap-2">
                    <Rows className="h-4 w-4 text-muted-foreground" />
                    <Input id="rows" name="rows" type="number" min={1} placeholder="10" required />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="seatsPerRow">SeatsPerRow *</Label>
                  <div className="flex items-center gap-2">
                    <LayoutGrid className="h-4 w-4 text-muted-foreground" />
                    <Input
                      id="seatsPerRow"
                      name="seatsPerRow"
                      type="number"
                      min={1}
                      placeholder="50"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="registrationStart">Registration Start</Label>
                  <Input id="registrationStart" name="registrationStart" type="datetime-local" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="registrationEnd">Registration End</Label>
                  <Input id="registrationEnd" name="registrationEnd" type="datetime-local" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="maxTicketsPerUser">MaxTicketsPerUser</Label>
                  <Input
                    id="maxTicketsPerUser"
                    name="maxTicketsPerUser"
                    type="number"
                    min={1}
                    placeholder="1"
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Thông tin bổ sung</CardTitle>
                <CardDescription>Hall, Club, Tags, Speakers, Ảnh</CardDescription>
              </CardHeader>
              <CardContent className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="hallId">Hall (tuỳ chọn)</Label>
                  {isHallsLoading ? (
                    <Skeleton className="h-10 w-full" />
                  ) : halls.length > 0 ? (
                    <Select
                      value={selectedHallId ?? undefined}
                      onValueChange={(value) =>
                        setSelectedHallId(value === "__none" ? undefined : (value as string | undefined))
                      }
                    >
                      <SelectTrigger id="hallId">
                        <SelectValue placeholder="Chọn hall (nếu có)" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="__none">(Không chọn hall)</SelectItem>
                        {halls.map((hall) => (
                          <SelectItem key={hall.hallId} value={hall.hallId}>
                            {hall.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    <p className="text-xs text-muted-foreground">
                      Không tải được hall. Bạn có thể nhập Location thủ công.
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="clubName">ClubName</Label>
                  <Input id="clubName" name="clubName" placeholder="FPTU Event Club" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="tags">Tags (phân tách bởi dấu phẩy)</Label>
                  <div className="flex items-center gap-2">
                    <Tag className="h-4 w-4 text-muted-foreground" />
                    <Input id="tags" name="tags" placeholder="tech, ai, seminar" />
                  </div>
                </div>

                <div className="md:col-span-2 space-y-2">
                  <Label>Speakers (tuỳ chọn)</Label>
                  {isSpeakersLoading ? (
                    <Skeleton className="h-10 w-full" />
                  ) : speakers.length > 0 ? (
                    <div className="grid gap-2">
                      <div className="rounded-lg border bg-card p-3 space-y-3 max-h-64 overflow-y-auto">
                        {speakers.map((sp) => {
                          const checked = selectedSpeakerIds.includes(sp.speakerId)
                          return (
                            <label
                              key={sp.speakerId}
                              className="flex items-start gap-3 text-sm cursor-pointer rounded-md border hover:border-primary/50 transition-colors p-2"
                            >
                              <input
                                type="checkbox"
                                className="h-4 w-4 mt-0.5 accent-primary"
                                checked={checked}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setSelectedSpeakerIds((prev) => [...prev, sp.speakerId])
                                  } else {
                                    setSelectedSpeakerIds((prev) => prev.filter((id) => id !== sp.speakerId))
                                  }
                                }}
                              />
                              <div className="space-y-1">
                                <div className="font-semibold text-foreground">{sp.name}</div>
                                {sp.bio && (
                                  <div className="text-xs text-muted-foreground leading-snug line-clamp-2">
                                    {sp.bio}
                                  </div>
                                )}
                              </div>
                            </label>
                          )
                        })}
                      </div>
                      {selectedSpeakerIds.length > 0 && (
                        <p className="text-xs text-muted-foreground">
                          Đã chọn {selectedSpeakerIds.length} speaker
                        </p>
                      )}
                    </div>
                  ) : (
                    <p className="text-xs text-muted-foreground">Chưa có speaker. Vui lòng thêm speaker trước.</p>
                  )}
                </div>

                <div className="md:col-span-2 space-y-2">
                  <Label htmlFor="imageFile">Ảnh sự kiện</Label>
                  {currentImageUrl && !imageFile && (
                    <div className="relative w-full h-48 mb-2 rounded-lg overflow-hidden border">
                      <Image
                        src={currentImageUrl}
                        alt="Current event image"
                        fill
                        className="object-cover"
                      />
                    </div>
                  )}
                  <div className="flex items-center gap-3">
                    <Button
                      type="button"
                      variant="outline"
                      className="gap-2"
                      onClick={() => document.getElementById("imageFile")?.click()}
                    >
                      <Upload className="h-4 w-4" />
                      {imageFile ? "Thay đổi ảnh" : currentImageUrl ? "Thay đổi ảnh" : "Chọn ảnh"}
                    </Button>
                    <span className="text-sm text-muted-foreground">
                      {imageFile ? imageFile.name : currentImageUrl ? "Giữ nguyên ảnh hiện tại" : "Chưa chọn ảnh"}
                    </span>
                  </div>
                  <Input
                    id="imageFile"
                    name="imageFile"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0]
                      if (file) {
                        const maxSize = 5 * 1024 * 1024 // 5MB
                        if (file.size > maxSize) {
                          toast.error(`Ảnh quá lớn. Vui lòng chọn ảnh nhỏ hơn 5MB. (Hiện tại: ${(file.size / 1024 / 1024).toFixed(2)}MB)`, {
                            position: 'top-right',
                            autoClose: 5000,
                          })
                          e.target.value = ''
                          setImageFile(null)
                          return
                        }
                        setImageFile(file)
                        setCurrentImageUrl(null) // Clear current image preview when new file selected
                      } else {
                        setImageFile(null)
                      }
                    }}
                  />
                  <p className="text-xs text-muted-foreground">
                    Kích thước tối đa: 5MB. Định dạng: JPG, PNG, GIF. Để trống để giữ nguyên ảnh hiện tại.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right column - Summary & submit */}
          <div className="space-y-4">
            <Card className="sticky top-20">
              <CardHeader>
                <CardTitle>Cập nhật sự kiện</CardTitle>
                <CardDescription>Xác nhận thông tin trước khi cập nhật</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-sm text-muted-foreground space-y-1">
                  <p>- Title, Date, StartTime, EndTime, TotalSeats, Rows, SeatsPerRow là bắt buộc.</p>
                  <p>- RegistrationStart/End nên là dạng datetime-local.</p>
                  <p>- Tags nhập danh sách, phân tách dấu phẩy.</p>
                </div>
                <Separator />
                <Button type="submit" disabled={isSubmitting} className="w-full rounded-full">
                  {isSubmitting ? "Đang cập nhật..." : "Cập nhật sự kiện"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="w-full rounded-full"
                  onClick={() => router.push("/organizer/events")}
                  disabled={isSubmitting}
                >
                  Hủy
                </Button>
              </CardContent>
            </Card>
          </div>
        </form>
      </div>
    </main>
  )
}


/* ============================================
   Create Event Page (Organizer)
   Form tạo sự kiện, gửi multipart/form-data
   ============================================ */

"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
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
  Image as ImageIcon,
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
import { eventService } from "@/lib/services/event.service"
import apiClient from "@/lib/api/client"

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

export default function CreateEventPage() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [halls, setHalls] = useState<Hall[]>([])
  const [isHallsLoading, setIsHallsLoading] = useState(false)
  const [selectedHallId, setSelectedHallId] = useState<string | undefined>(undefined)
  const [speakers, setSpeakers] = useState<Speaker[]>([])
  const [isSpeakersLoading, setIsSpeakersLoading] = useState(false)
  const [selectedSpeakerIds, setSelectedSpeakerIds] = useState<string[]>([])

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
        imageFile,
        speakerIds: selectedSpeakerIds,
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

      // Validate Rows * SeatsPerRow = TotalSeats (backend requirement)
      if (payload.rows * payload.seatsPerRow !== payload.totalSeats) {
        toast.error(`Tổng số ghế phải bằng Số hàng × Số ghế mỗi hàng (${payload.rows} × ${payload.seatsPerRow} = ${payload.rows * payload.seatsPerRow}). Bạn đã nhập ${payload.totalSeats}.`)
        setIsSubmitting(false)
        return
      }

      // Validate date không được ở quá khứ
      const eventDate = new Date(payload.date)
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      if (eventDate < today) {
        toast.error("Ngày sự kiện không được ở quá khứ")
        setIsSubmitting(false)
        return
      }

      // Validate EndTime > StartTime
      const startTimeParts = payload.startTime.split(':').map(Number)
      const endTimeParts = payload.endTime.split(':').map(Number)
      const startMinutes = startTimeParts[0] * 60 + (startTimeParts[1] || 0)
      const endMinutes = endTimeParts[0] * 60 + (endTimeParts[1] || 0)
      
      if (endMinutes <= startMinutes) {
        toast.error("Thời gian kết thúc phải sau thời gian bắt đầu")
        setIsSubmitting(false)
        return
      }

      await eventService.createEvent(payload)
      toast.success("Tạo sự kiện thành công!")
      router.push("/organizer/events")
    } catch (error: any) {
      // Xử lý lỗi chi tiết hơn
      let message = "Tạo sự kiện thất bại. Vui lòng kiểm tra lại dữ liệu."
      
      // Kiểm tra xem có response từ server không (nếu có thì không phải CORS)
      if (error?.response) {
        // Có response từ server - đây là lỗi từ server, không phải CORS
        const status = error.response.status
        const data = error.response.data
        
        if (data) {
          // Có data trong response - kiểm tra nhiều format khác nhau
          if (typeof data === 'string') {
            // Response là string trực tiếp
            message = data
          } else if (data.message) {
            // Response có format { message: ... }
            message = data.message
          } else if (data.error) {
            // Response có format { error: ... }
            message = data.error
          } else if (Array.isArray(data) && data.length > 0) {
            // Response là array of errors
            message = data.join(', ')
          } else if (data.errors && Array.isArray(data.errors)) {
            // Validation errors format
            message = data.errors.join(', ')
          } else {
            // Có data nhưng không parse được - log để debug
            message = JSON.stringify(data) || `Lỗi server (${status}). Vui lòng thử lại sau.`
          }
        } else {
          // Response nhưng không có body - có thể là exception không được handle ở backend
          message = `Lỗi server (${status}). Có thể do dữ liệu không hợp lệ hoặc lỗi xử lý ở backend. Vui lòng kiểm tra lại dữ liệu.`
        }
      } else if (error?.request) {
        // Request được gửi nhưng không nhận được response - có thể là CORS hoặc network
        if (error.message === 'Network Error' || error.code === 'ERR_NETWORK') {
          message = "Lỗi kết nối: Backend không phản hồi hoặc bị chặn bởi CORS. Vui lòng kiểm tra cấu hình server."
        } else {
          message = "Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng."
        }
      } else if (error?.message) {
        message = error.message
      }
      
      // Log chi tiết để debug
      console.error('❌ Error creating event:', {
        hasResponse: !!error?.response,
        status: error?.response?.status,
        statusText: error?.response?.statusText,
        responseData: error?.response?.data,
        errorMessage: error?.message,
        errorCode: error?.code,
        fullError: error,
      })
      
      // Log chi tiết response từ server
      if (error?.response) {
        console.error('📥 Server Response:', {
          status: error.response.status,
          statusText: error.response.statusText,
          headers: error.response.headers,
          data: error.response.data,
          dataType: typeof error.response.data,
          dataStringified: JSON.stringify(error.response.data, null, 2),
        })
      }
      
      // Log request details để debug
      if (error?.config) {
        console.error('📤 Request Details:', {
          url: error.config.url,
          method: error.config.method,
          data: error.config.data,
        })
      }
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

  return (
    <main className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-background py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Header Section */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>Organizer</span>
            <span>/</span>
            <span>Events</span>
            <span>/</span>
            <span className="text-foreground font-medium">Create</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
            Tạo sự kiện mới
          </h1>
          <p className="text-muted-foreground text-sm sm:text-base max-w-2xl">
            Điền thông tin chi tiết sự kiện. Hệ thống sẽ tự động tạo chỗ ngồi dựa trên Rows và SeatsPerRow.
          </p>
        </div>

        <form onSubmit={onSubmit} className="grid lg:grid-cols-3 gap-6">
          {/* Left column */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="border-2 shadow-lg hover:shadow-xl transition-shadow duration-300">
              <CardHeader className="bg-gradient-to-r from-primary/5 to-primary/10 border-b">
                <CardTitle className="text-xl flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-primary" />
                  Thông tin chính
                </CardTitle>
                <CardDescription className="text-sm mt-1">Tiêu đề, mô tả, thời gian và địa điểm</CardDescription>
              </CardHeader>
              <CardContent className="grid md:grid-cols-2 gap-5 p-6">
                <div className="md:col-span-2 space-y-2">
                  <Label htmlFor="title" className="text-sm font-semibold">Tiêu đề *</Label>
                  <Input 
                    id="title" 
                    name="title" 
                    placeholder="FPTU Tech Summit 2025" 
                    required 
                    className="h-11 border-2 focus:border-primary transition-colors"
                  />
                </div>

                <div className="md:col-span-2 space-y-2">
                  <Label htmlFor="description" className="text-sm font-semibold">Mô tả</Label>
                  <Textarea
                    id="description"
                    name="description"
                    placeholder="Mô tả ngắn gọn về sự kiện..."
                    rows={4}
                    className="border-2 focus:border-primary transition-colors resize-none"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="date" className="text-sm font-semibold flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-primary" />
                    Ngày *
                  </Label>
                  <Input 
                    id="date" 
                    name="date" 
                    type="date" 
                    required 
                    className="h-11 border-2 focus:border-primary transition-colors"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="startTime" className="text-sm font-semibold flex items-center gap-2">
                    <Clock className="h-4 w-4 text-primary" />
                    Giờ bắt đầu *
                  </Label>
                  <Input 
                    id="startTime" 
                    name="startTime" 
                    type="time" 
                    required 
                    className="h-11 border-2 focus:border-primary transition-colors"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="endTime" className="text-sm font-semibold flex items-center gap-2">
                    <Clock className="h-4 w-4 text-primary" />
                    Giờ kết thúc *
                  </Label>
                  <Input 
                    id="endTime" 
                    name="endTime" 
                    type="time" 
                    required 
                    className="h-11 border-2 focus:border-primary transition-colors"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="location" className="text-sm font-semibold flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-primary" />
                    Địa điểm
                  </Label>
                  <Input 
                    id="location" 
                    name="location" 
                    placeholder="Hall A, FPTU HCMC" 
                    className="h-11 border-2 focus:border-primary transition-colors"
                  />
                  <p className="text-xs text-muted-foreground">Nếu chọn Hall phía dưới, Location có thể để trống.</p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-2 shadow-lg hover:shadow-xl transition-shadow duration-300">
              <CardHeader className="bg-gradient-to-r from-primary/5 to-primary/10 border-b">
                <CardTitle className="text-xl flex items-center gap-2">
                  <Users className="h-5 w-5 text-primary" />
                  Chỗ ngồi & Vé
                </CardTitle>
                <CardDescription className="text-sm mt-1">Thiết lập Rows, SeatsPerRow và giới hạn vé</CardDescription>
              </CardHeader>
              <CardContent className="grid md:grid-cols-3 gap-5 p-6">
                <div className="space-y-2">
                  <Label htmlFor="totalSeats" className="text-sm font-semibold flex items-center gap-2">
                    <Users className="h-4 w-4 text-primary" />
                    TotalSeats *
                  </Label>
                  <Input
                    id="totalSeats"
                    name="totalSeats"
                    type="number"
                    min={1}
                    placeholder="500"
                    required
                    className="h-11 border-2 focus:border-primary transition-colors"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="rows" className="text-sm font-semibold flex items-center gap-2">
                    <Rows className="h-4 w-4 text-primary" />
                    Rows *
                  </Label>
                  <Input 
                    id="rows" 
                    name="rows" 
                    type="number" 
                    min={1} 
                    placeholder="10" 
                    required 
                    className="h-11 border-2 focus:border-primary transition-colors"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="seatsPerRow" className="text-sm font-semibold flex items-center gap-2">
                    <LayoutGrid className="h-4 w-4 text-primary" />
                    SeatsPerRow *
                  </Label>
                  <Input
                    id="seatsPerRow"
                    name="seatsPerRow"
                    type="number"
                    min={1}
                    placeholder="50"
                    required
                    className="h-11 border-2 focus:border-primary transition-colors"
                  />
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

            <Card className="border-2 shadow-lg hover:shadow-xl transition-shadow duration-300">
              <CardHeader className="bg-gradient-to-r from-primary/5 to-primary/10 border-b">
                <CardTitle className="text-xl flex items-center gap-2">
                  <Tag className="h-5 w-5 text-primary" />
                  Thông tin bổ sung
                </CardTitle>
                <CardDescription className="text-sm mt-1">Hall, Club, Tags, Speakers, Ảnh</CardDescription>
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
                  <div className="flex items-center gap-3">
                    <Button
                      type="button"
                      variant="outline"
                      className="gap-2"
                      onClick={() => document.getElementById("imageFile")?.click()}
                    >
                      <Upload className="h-4 w-4" />
                      Chọn ảnh
                    </Button>
                    <span className="text-sm text-muted-foreground">
                      {imageFile ? imageFile.name : "Chưa chọn ảnh"}
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
                        // Giới hạn 5MB
                        const maxSize = 5 * 1024 * 1024 // 5MB
                        if (file.size > maxSize) {
                          toast.error(`Ảnh quá lớn. Vui lòng chọn ảnh nhỏ hơn 5MB. (Hiện tại: ${(file.size / 1024 / 1024).toFixed(2)}MB)`, {
                            position: 'top-right',
                            autoClose: 5000,
                          })
                          e.target.value = '' // Reset input
                          setImageFile(null)
                          return
                        }
                        setImageFile(file)
                      } else {
                        setImageFile(null)
                      }
                    }}
                  />
                  <p className="text-xs text-muted-foreground">
                    Kích thước tối đa: 5MB. Định dạng: JPG, PNG, GIF
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right column - Summary & submit */}
          <div className="space-y-6">
            <Card className="sticky top-24 border-2 shadow-xl bg-gradient-to-br from-card to-card/50 backdrop-blur-sm">
              <CardHeader className="bg-gradient-to-r from-primary/10 to-primary/5 border-b">
                <CardTitle className="text-xl flex items-center gap-2">
                  <Upload className="h-5 w-5 text-primary" />
                  Gửi sự kiện
                </CardTitle>
                <CardDescription className="text-sm mt-1">Xác nhận thông tin trước khi tạo</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 pt-6">
                <div className="text-sm text-muted-foreground space-y-2 bg-muted/50 p-4 rounded-lg border">
                  <p className="flex items-start gap-2">
                    <span className="text-primary font-semibold">•</span>
                    <span>Title, Date, StartTime, EndTime, TotalSeats, Rows, SeatsPerRow là bắt buộc.</span>
                  </p>
                  <p className="flex items-start gap-2">
                    <span className="text-primary font-semibold">•</span>
                    <span>RegistrationStart/End nên là dạng datetime-local.</span>
                  </p>
                  <p className="flex items-start gap-2">
                    <span className="text-primary font-semibold">•</span>
                    <span>Tags/SpeakerIds nhập danh sách, phân tách dấu phẩy.</span>
                  </p>
                </div>
                <Separator />
                <Button 
                  type="submit" 
                  disabled={isSubmitting} 
                  className="w-full rounded-full h-11 text-base font-semibold bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Đang tạo...
                    </>
                  ) : (
                    <>
                      <Upload className="h-4 w-4 mr-2" />
                      Tạo sự kiện
                    </>
                  )}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="w-full rounded-full h-11 text-base border-2 hover:bg-muted transition-all duration-300"
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


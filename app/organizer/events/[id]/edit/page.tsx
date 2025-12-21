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
  
  // Validation states
  const [dateError, setDateError] = useState<string>("")
  const [timeError, setTimeError] = useState<string>("")
  const [registrationStartError, setRegistrationStartError] = useState<string>("")
  const [registrationEndError, setRegistrationEndError] = useState<string>("")
  
  const formRef = useRef<HTMLFormElement>(null)
  
  // Get today's date in YYYY-MM-DD format for min attribute
  const today = new Date().toISOString().split('T')[0]
  
  // Get date 3 days from now for min attribute of event date
  const minEventDate = new Date()
  minEventDate.setDate(minEventDate.getDate() + 3)
  const minEventDateStr = minEventDate.toISOString().split("T")[0]
  
  // Get current datetime in format for datetime-local input (YYYY-MM-DDTHH:mm)
  const getCurrentDateTimeLocal = () => {
    const now = new Date()
    const year = now.getFullYear()
    const month = String(now.getMonth() + 1).padStart(2, '0')
    const day = String(now.getDate()).padStart(2, '0')
    const hours = String(now.getHours()).padStart(2, '0')
    const minutes = String(now.getMinutes()).padStart(2, '0')
    return `${year}-${month}-${day}T${hours}:${minutes}`
  }
  
  const minDateTimeLocal = getCurrentDateTimeLocal()
  
  /**
   * CONVERT DATETIME-LOCAL TO UTC ISO STRING (giống create event)
   * 
   * Backend lưu datetime ở UTC, nhưng datetime-local input không có timezone info
   * Giải pháp: Frontend cần gửi datetime ở UTC (không có timezone offset)
   * 
   * Input: "2025-01-20T08:00" (local time từ datetime-local input)
   * Output: "2025-01-20T01:00:00Z" (UTC, nếu local timezone là +07:00)
   * 
   * Logic:
   * 1. Parse datetime-local string như local time
   * 2. Convert sang UTC bằng toISOString()
   * 3. Backend sẽ nhận UTC và lưu đúng
   */
  const toLocalISOStringWithOffset = (local: string) => {
    // local: "2025-01-20T08:00" (datetime-local format, không có timezone)
    // JavaScript sẽ parse nó như local time của browser
    const d = new Date(local)
    
    // Convert sang UTC và trả về ISO string với "Z" (UTC)
    // Ví dụ: "2025-01-20T01:00:00.000Z" nếu local timezone là +07:00
    return d.toISOString()
  }
  
  // Convert backend datetime to local datetime-local format (YYYY-MM-DDTHH:mm)
  // Backend trả về UTC datetime, nhưng không convert timezone, chỉ parse và format lại
  const convertUTCToLocalDateTimeLocal = (dateString: string) => {
    const trimmed = dateString.trim()
    
    // Parse datetime string
    const date = new Date(trimmed)
    
    if (isNaN(date.getTime())) {
      console.error('Failed to parse date:', dateString)
      return trimmed // Fallback: return original string
    }
    
    // Lấy UTC hours/minutes để không bị convert timezone
    // Nếu backend trả về UTC, lấy UTC hours/minutes sẽ giữ nguyên giá trị
    const year = date.getUTCFullYear()
    const month = String(date.getUTCMonth() + 1).padStart(2, '0')
    const day = String(date.getUTCDate()).padStart(2, '0')
    const hours = String(date.getUTCHours()).padStart(2, '0')
    const minutes = String(date.getUTCMinutes()).padStart(2, '0')
    
    return `${year}-${month}-${day}T${hours}:${minutes}`
  }
  
  // Check if current event date is in the past (to allow editing old events)
  const isCurrentDateInPast = eventData?.date ? (new Date(eventData.date) < new Date(today)) : false
  
  // Validate time range
  const validateTimeRange = (startTime: string, endTime: string) => {
    if (!startTime || !endTime) {
      setTimeError("")
      return
    }
    
    const startTimeParts = startTime.split(':').map(Number)
    const endTimeParts = endTime.split(':').map(Number)
    const startMinutes = startTimeParts[0] * 60 + (startTimeParts[1] || 0)
    const endMinutes = endTimeParts[0] * 60 + (endTimeParts[1] || 0)
    
    if (endMinutes <= startMinutes) {
      setTimeError("Giờ kết thúc phải sau giờ bắt đầu")
    } else {
      setTimeError("")
    }
  }

  /**
   * VALIDATE NGÀY ĐĂNG KÝ VÀ NGÀY KẾT THÚC ĐĂNG KÝ
   * 
   * Rules:
   * 1. Không được chọn ngày/giờ trong quá khứ
   * 2. Ngày đăng ký phải trước ngày diễn ra sự kiện
   * 3. Ngày kết thúc đăng ký phải sau ngày bắt đầu đăng ký ít nhất 2 tiếng
   *    (Cho phép trùng ngày nhưng giờ phải cách nhau ít nhất 2 tiếng)
   * 4. Ngày kết thúc đăng ký phải trước ngày diễn ra sự kiện
   */
  const validateRegistrationDate = (registrationDate: string, field: 'start' | 'end') => {
    if (!registrationDate) {
      if (field === 'start') {
        setRegistrationStartError("")
      } else {
        setRegistrationEndError("")
      }
      return
    }

    const regDate = new Date(registrationDate)
    const now = new Date()
    now.setSeconds(0, 0) // Set seconds và milliseconds về 0 để so sánh chính xác

    // Rule 1: Không được chọn ngày trong quá khứ
    if (regDate < now) {
      const errorMsg = "Không được chọn ngày/giờ trong quá khứ"
      if (field === 'start') {
        setRegistrationStartError(errorMsg)
      } else {
        setRegistrationEndError(errorMsg)
      }
      return
    }

    const dateInput = document.getElementById('date') as HTMLInputElement
    const eventDate = dateInput?.value

    if (!eventDate) {
      // Nếu chưa chọn ngày sự kiện, chỉ validate không được quá khứ
      if (field === 'start') {
        setRegistrationStartError("")
      } else {
        setRegistrationEndError("")
      }
      return
    }

    const evtDate = new Date(eventDate)
    evtDate.setHours(0, 0, 0, 0)

    // Set registration date to start of day for fair comparison với event date
    const regDateOnly = new Date(regDate)
    regDateOnly.setHours(0, 0, 0, 0)

    // Rule 2: Registration date must be BEFORE event date
    if (regDateOnly >= evtDate) {
      const errorMsg = "Ngày đăng ký phải trước ngày diễn ra sự kiện"
      if (field === 'start') {
        setRegistrationStartError(errorMsg)
      } else {
        setRegistrationEndError(errorMsg)
      }
      return
    }

    // Rule 3: Nếu là ngày kết thúc, phải sau ngày bắt đầu đăng ký ít nhất 2 tiếng
    // Cho phép trùng ngày nhưng giờ phải cách nhau ít nhất 2 tiếng
    if (field === 'end') {
      const regStartInput = document.getElementById('registrationStart') as HTMLInputElement
      const regStartValue = regStartInput?.value
      
      if (regStartValue) {
        const regStartDate = new Date(regStartValue)
        
        // Tính số giờ chênh lệch (có thể âm nếu ngày kết thúc trước ngày bắt đầu)
        const hoursDiff = (regDate.getTime() - regStartDate.getTime()) / (1000 * 60 * 60)
        
        // Ngày kết thúc phải sau ngày bắt đầu ít nhất 2 tiếng
        if (hoursDiff < 2) {
          setRegistrationEndError("Ngày kết thúc đăng ký phải sau ngày bắt đầu đăng ký ít nhất 2 tiếng")
          return
        }
      }
    }

    // Nếu là ngày bắt đầu, kiểm tra ngày kết thúc có hợp lệ không
    if (field === 'start') {
      const regEndInput = document.getElementById('registrationEnd') as HTMLInputElement
      const regEndValue = regEndInput?.value
      
      if (regEndValue) {
        const regEndDate = new Date(regEndValue)
        const hoursDiff = (regEndDate.getTime() - regDate.getTime()) / (1000 * 60 * 60)
        
        // Ngày kết thúc phải sau ngày bắt đầu ít nhất 2 tiếng
        if (hoursDiff < 2) {
          setRegistrationEndError("Ngày kết thúc đăng ký phải sau ngày bắt đầu đăng ký ít nhất 2 tiếng")
        } else {
          setRegistrationEndError("")
        }
      }
    }

    // Clear error nếu tất cả validation đều pass
    if (field === 'start') {
      setRegistrationStartError("")
    } else {
      setRegistrationEndError("")
    }
  }

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
              
              const tagsInput = form.querySelector<HTMLInputElement>('#tags')
              if (tagsInput) tagsInput.value = data.tags || ''
              
               // Set registration dates - Convert UTC to local time
               if (data.registrationStart) {
                 const regStartInput = form.querySelector<HTMLInputElement>('#registrationStart')
                 if (regStartInput) {
                   // Debug: Log để kiểm tra format từ backend
                   console.log('Backend registrationStart (raw):', data.registrationStart)
                   console.log('Backend registrationStart (type):', typeof data.registrationStart)
                   
                   // Convert UTC datetime từ backend sang local datetime-local format
                   const localDateTime = convertUTCToLocalDateTimeLocal(data.registrationStart)
                   console.log('Converted to local:', localDateTime)
                   
                   // Debug: Kiểm tra timezone offset
                   const testDate = new Date(data.registrationStart.endsWith('Z') ? data.registrationStart : data.registrationStart + 'Z')
                   console.log('UTC Date object:', testDate.toISOString())
                   console.log('Local hours:', testDate.getHours())
                   console.log('UTC hours:', testDate.getUTCHours())
                   console.log('Timezone offset (minutes):', testDate.getTimezoneOffset())
                   
                   regStartInput.value = localDateTime
                   
                   // Set min cho registrationEnd = registrationStart + 2 tiếng (dùng local time)
                   const regEndInput = form.querySelector<HTMLInputElement>('#registrationEnd')
                   if (regEndInput) {
                     // Parse local datetime và thêm 2 tiếng
                     const regStartDate = new Date(localDateTime) // Parse như local time
                     regStartDate.setHours(regStartDate.getHours() + 2) // Thêm 2 tiếng
                     
                     // Format thành datetime-local format (YYYY-MM-DDTHH:mm) - local time
                     const year = regStartDate.getFullYear()
                     const month = String(regStartDate.getMonth() + 1).padStart(2, '0')
                     const day = String(regStartDate.getDate()).padStart(2, '0')
                     const hours = String(regStartDate.getHours()).padStart(2, '0')
                     const minutes = String(regStartDate.getMinutes()).padStart(2, '0')
                     regEndInput.min = `${year}-${month}-${day}T${hours}:${minutes}`
                   }
                 }
               }
               
               if (data.registrationEnd) {
                 const regEndInput = form.querySelector<HTMLInputElement>('#registrationEnd')
                 if (regEndInput) {
                   // Convert UTC datetime từ backend sang local datetime-local format
                   regEndInput.value = convertUTCToLocalDateTimeLocal(data.registrationEnd)
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
        toast.error("Không tải được danh sách hall, hãy thử lại.")
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
      const registrationStartRaw = (formData.get("registrationStart") as string) || undefined
      const registrationEndRaw = (formData.get("registrationEnd") as string) || undefined
      
      const payload = {
        title: formData.get("title") as string,
        description: (formData.get("description") as string) || undefined,
        date: formData.get("date") as string,
        startTime: formData.get("startTime") as string,
        endTime: formData.get("endTime") as string,
        hallId: selectedHallId || undefined,
        // Giữ nguyên datetime-local string để validate (giống create event)
        registrationStart: registrationStartRaw,
        registrationEnd: registrationEndRaw,
        tags:
          (formData.get("tags") as string)
            ?.split(",")
            .map((t) => t.trim())
            .filter(Boolean) || [],
        maxTicketsPerUser: 1, // Luôn set là 1
        imageFile: imageFile || undefined, // Chỉ gửi nếu có file mới
      }

      if (!payload.title || !payload.date || !payload.startTime || !payload.endTime) {
        toast.error("Vui lòng nhập đủ Title, Date, StartTime, EndTime")
        setIsSubmitting(false)
        return
      }

      // Validate date phải cách ngày hiện tại ít nhất 3 ngày
      if (!payload.date) {
        setDateError("Ngày sự kiện là bắt buộc")
        setIsSubmitting(false)
        return
      } else {
        const eventDate = new Date(payload.date)
        const minAllowedDate = new Date()
        minAllowedDate.setDate(minAllowedDate.getDate() + 3)
        minAllowedDate.setHours(0, 0, 0, 0) // Compare only date part
        if (eventDate < minAllowedDate) {
          setDateError("Ngày diễn ra phải cách ngày hiện tại ít nhất 3 ngày")
          setIsSubmitting(false)
          return
        }
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

      // Validate hallId phải có (bắt buộc)
      if (!payload.hallId) {
        toast.error("Vui lòng chọn Hall")
        setIsSubmitting(false)
        return
      }

      /**
       * VALIDATE NGÀY ĐĂNG KÝ VÀ NGÀY KẾT THÚC ĐĂNG KÝ
       * 
       * Rules:
       * 1. Không được chọn ngày/giờ trong quá khứ
       * 2. Ngày đăng ký phải trước ngày diễn ra sự kiện
       * 3. Ngày kết thúc đăng ký phải sau ngày bắt đầu đăng ký ít nhất 2 tiếng
       * 4. Ngày kết thúc đăng ký phải trước ngày diễn ra sự kiện
       */
      const now = new Date()
      now.setSeconds(0, 0) // Set seconds và milliseconds về 0 để so sánh chính xác

      if (payload.registrationStart) {
        const regStartDate = new Date(payload.registrationStart)
        
        // Rule 1: Không được chọn ngày/giờ trong quá khứ
        if (regStartDate < now) {
          setRegistrationStartError("Không được chọn ngày/giờ trong quá khứ")
          setIsSubmitting(false)
          return
        } else {
          // Rule 2: Ngày đăng ký phải trước ngày diễn ra sự kiện
          const evtDate = new Date(payload.date)
          evtDate.setHours(0, 0, 0, 0)
          const regStartDateOnly = new Date(regStartDate)
          regStartDateOnly.setHours(0, 0, 0, 0)
          
          if (regStartDateOnly >= evtDate) {
            setRegistrationStartError("Ngày bắt đầu đăng ký phải trước ngày diễn ra sự kiện")
            setIsSubmitting(false)
            return
          }
        }
      }
      
      if (payload.registrationEnd) {
        const regEndDate = new Date(payload.registrationEnd)
        
        // Rule 1: Không được chọn ngày/giờ trong quá khứ
        if (regEndDate < now) {
          setRegistrationEndError("Không được chọn ngày/giờ trong quá khứ")
          setIsSubmitting(false)
          return
        } else {
          // Rule 3: Ngày kết thúc đăng ký phải sau ngày bắt đầu đăng ký ít nhất 2 tiếng
          // Cho phép trùng ngày nhưng giờ phải cách nhau ít nhất 2 tiếng
          if (payload.registrationStart) {
            const regStartDate = new Date(payload.registrationStart)
            const hoursDiff = (regEndDate.getTime() - regStartDate.getTime()) / (1000 * 60 * 60)
            
            if (hoursDiff < 2) {
              setRegistrationEndError("Ngày kết thúc đăng ký phải sau ngày bắt đầu đăng ký ít nhất 2 tiếng")
              setIsSubmitting(false)
              return
            }
          }
          
          // Rule 4: Ngày kết thúc đăng ký phải trước ngày diễn ra sự kiện
          const evtDate = new Date(payload.date)
          evtDate.setHours(0, 0, 0, 0)
          const regEndDateOnly = new Date(regEndDate)
          regEndDateOnly.setHours(0, 0, 0, 0)
          
          if (regEndDateOnly >= evtDate) {
            setRegistrationEndError("Ngày kết thúc đăng ký phải trước ngày diễn ra sự kiện")
            setIsSubmitting(false)
            return
          }
        }
      }

      // Convert datetime-local sang UTC ISO string trước khi gửi lên backend (giống create event)
      const updatePayload = {
        ...payload,
        registrationStart: payload.registrationStart ? toLocalISOStringWithOffset(payload.registrationStart) : undefined,
        registrationEnd: payload.registrationEnd ? toLocalISOStringWithOffset(payload.registrationEnd) : undefined,
      }
      
      await eventService.updateEvent(eventId, updatePayload)
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
                <CardDescription>Tiêu đề, mô tả, thời gian và hall</CardDescription>
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
                    <div className="flex-1">
                      <Input 
                        id="date" 
                        name="date" 
                        type="date" 
                        required 
                        min={isCurrentDateInPast ? undefined : minEventDateStr}
                        className={dateError ? 'border-destructive' : ''}
                        onChange={(e) => {
                          const selectedDate = e.target.value
                          if (selectedDate) {
                            const eventDate = new Date(selectedDate)
                            const minAllowedDate = new Date()
                            minAllowedDate.setDate(minAllowedDate.getDate() + 3)
                            minAllowedDate.setHours(0, 0, 0, 0)
                            if (eventDate < minAllowedDate) {
                              setDateError("Ngày diễn ra phải cách ngày hiện tại ít nhất 3 ngày")
                            } else {
                              setDateError("")
                            }
                            
                            // Re-validate registration dates when event date changes
                            const regStartInput = document.getElementById('registrationStart') as HTMLInputElement
                            const regEndInput = document.getElementById('registrationEnd') as HTMLInputElement
                            if (regStartInput?.value) {
                              validateRegistrationDate(regStartInput.value, 'start')
                            }
                            if (regEndInput?.value) {
                              validateRegistrationDate(regEndInput.value, 'end')
                            }
                          } else {
                            setDateError("")
                          }
                        }}
                      />
                      {dateError && (
                        <p className="text-xs text-destructive flex items-center gap-1 mt-1">
                          <span>⚠</span>
                          {dateError}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="startTime">Giờ bắt đầu *</Label>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <Input 
                      id="startTime" 
                      name="startTime" 
                      type="time" 
                      required 
                      className={timeError ? 'border-destructive' : ''}
                      onChange={(e) => {
                        const startTime = e.target.value
                        const endTimeInput = document.getElementById('endTime') as HTMLInputElement
                        const endTime = endTimeInput?.value
                        if (startTime && endTime) {
                          validateTimeRange(startTime, endTime)
                        } else {
                          setTimeError("")
                        }
                      }}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="endTime">Giờ kết thúc *</Label>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <div className="flex-1">
                      <Input 
                        id="endTime" 
                        name="endTime" 
                        type="time" 
                        required 
                        className={timeError ? 'border-destructive' : ''}
                        onChange={(e) => {
                          const endTime = e.target.value
                          const startTimeInput = document.getElementById('startTime') as HTMLInputElement
                          const startTime = startTimeInput?.value
                          if (startTime && endTime) {
                            validateTimeRange(startTime, endTime)
                          } else {
                            setTimeError("")
                          }
                        }}
                      />
                      {timeError && (
                        <p className="text-xs text-destructive flex items-center gap-1 mt-1">
                          <span>⚠</span>
                          {timeError}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="hallId">Hall <span className="text-destructive">*</span></Label>
                  {isHallsLoading ? (
                    <Skeleton className="h-10 w-full" />
                  ) : halls.length > 0 ? (
                    <Select
                      value={selectedHallId ?? undefined}
                      onValueChange={(value) => {
                        if (value === "__none") {
                          setSelectedHallId(undefined)
                        } else {
                          setSelectedHallId(value as string)
                        }
                      }}
                    >
                      <SelectTrigger id="hallId">
                        <SelectValue placeholder="Chọn hall" />
                      </SelectTrigger>
                      <SelectContent>
                        {halls.map((hall) => (
                          <SelectItem key={hall.hallId} value={hall.hallId}>
                            {hall.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    <p className="text-xs text-destructive flex items-center gap-1">
                      <span>⚠</span>
                      Không tải được hall. Vui lòng thử lại.
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Thời gian đăng ký & Giới hạn vé</CardTitle>
                <CardDescription>Thiết lập thời gian đăng ký và giới hạn số vé mỗi người</CardDescription>
              </CardHeader>
              <CardContent className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="registrationStart">Registration Start</Label>
                  <Input 
                    id="registrationStart" 
                    name="registrationStart" 
                    type="datetime-local" 
                    min={minDateTimeLocal}
                    className={registrationStartError ? 'border-destructive' : ''}
                    onChange={(e) => {
                      validateRegistrationDate(e.target.value, 'start')
                      // Update min của registrationEnd khi registrationStart thay đổi
                      // Min = registrationStart + 2 tiếng (cho phép trùng ngày nhưng phải cách ít nhất 2 tiếng)
                      const regEndInput = document.getElementById('registrationEnd') as HTMLInputElement
                      if (regEndInput && e.target.value) {
                        const regStartDate = new Date(e.target.value)
                        regStartDate.setHours(regStartDate.getHours() + 2) // Thêm 2 tiếng
                        
                        // Format thành datetime-local format (YYYY-MM-DDTHH:mm)
                        const year = regStartDate.getFullYear()
                        const month = String(regStartDate.getMonth() + 1).padStart(2, '0')
                        const day = String(regStartDate.getDate()).padStart(2, '0')
                        const hours = String(regStartDate.getHours()).padStart(2, '0')
                        const minutes = String(regStartDate.getMinutes()).padStart(2, '0')
                        regEndInput.min = `${year}-${month}-${day}T${hours}:${minutes}`
                      }
                    }}
                  />
                  {registrationStartError && (
                    <p className="text-xs text-destructive flex items-center gap-1">
                      <span>⚠</span>
                      {registrationStartError}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="registrationEnd">Registration End</Label>
                  <Input 
                    id="registrationEnd" 
                    name="registrationEnd" 
                    type="datetime-local" 
                    min={minDateTimeLocal}
                    className={registrationEndError ? 'border-destructive' : ''}
                    onChange={(e) => {
                      validateRegistrationDate(e.target.value, 'end')
                    }}
                  />
                  {registrationEndError && (
                    <p className="text-xs text-destructive flex items-center gap-1">
                      <span>⚠</span>
                      {registrationEndError}
                    </p>
                  )}
                </div>

              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Thông tin bổ sung</CardTitle>
                <CardDescription>Tags, Speakers, Ảnh</CardDescription>
              </CardHeader>
              <CardContent className="grid md:grid-cols-2 gap-4">
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
                  <p className="text-xs text-muted-foreground mb-5">
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
                  <p>- Title, Date, StartTime, EndTime là bắt buộc.</p>
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
                  className="w-full rounded-full mb-5"
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


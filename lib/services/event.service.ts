/* ============================================
   Event Service
   Gọi API sự kiện (create, fetch)
   ============================================ */

import apiClient from '@/lib/api/client'
import { API_ENDPOINTS } from '@/lib/api/endpoints'

export interface CreateEventRequest {
  title: string
  description?: string
  date: string
  startTime: string
  endTime: string
  location?: string
  hallId?: string
  clubId?: string
  clubName?: string
  totalSeats: number
  rows: number
  seatsPerRow: number
  registrationStart?: string
  registrationEnd?: string
  tags?: string[]
  maxTicketsPerUser?: number
  imageFile?: File | null
  speakerIds?: string[]
}

export interface UpdateEventRequest {
  title: string
  description?: string
  date: string
  startTime: string
  endTime: string
  location?: string
  hallId?: string
  clubId?: string
  clubName?: string
  totalSeats: number
  rows: number
  seatsPerRow: number
  registrationStart?: string
  registrationEnd?: string
  tags?: string[]
  maxTicketsPerUser?: number
  imageFile?: File | null
}

export interface EventListItem {
  eventId: string
  title: string
  description?: string
  date: string
  startTime: string
  endTime: string
  location?: string
  imageUrl?: string
  status: string
  totalSeats: number
  registeredCount: number
  availableSeats?: number
  clubName?: string
  registrationStart?: string
  registrationEnd?: string
  createdAt: string
  organizerId?: string
}

export interface EventFilterParams {
  pageNumber?: number
  pageSize?: number
  search?: string
  status?: string
  dateFrom?: string
  dateTo?: string
  hallId?: string
  organizerId?: string
}

export interface PagedResponse<T> {
  success: boolean
  message: string
  data: T[]
  pagination?: {
    currentPage: number
    pageSize: number
    totalItems: number
    totalPages: number
    hasPrevious: boolean
    hasNext: boolean
  }
}

export interface SeatDto {
  seatId: string
  seatNumber: string
  rowLabel: string
  section?: string | null
  status: 'available' | 'reserved' | 'occupied' | 'blocked'
  hallId?: string
}

export interface EventDetailDto extends EventListItem {
  hallId?: string
  hallName?: string
  organizerName?: string
  clubId?: string
  checkedInCount?: number
  tags?: string
  maxTicketsPerUser?: number
  approvedBy?: string
  approvedAt?: string
  rejectionReason?: string
  updatedAt?: string
  speakers?: Array<{
    speakerId: string
    name: string
    title?: string
    organization?: string
    imageUrl?: string
  }>
}

export const eventService = {
  async getEventById(eventId: string): Promise<{ success: boolean; data: EventDetailDto; message?: string }> {
    const response = await apiClient.get<{ success: boolean; data: EventDetailDto; message?: string }>(
      API_ENDPOINTS.EVENTS.BY_ID(eventId)
    )
    return response.data
  },

  async getAllEvents(params?: EventFilterParams): Promise<PagedResponse<EventListItem>> {
    const queryParams = new URLSearchParams()
    
    if (params?.pageNumber) queryParams.append('pageNumber', String(params.pageNumber))
    if (params?.pageSize) queryParams.append('pageSize', String(params.pageSize))
    if (params?.search) queryParams.append('search', params.search)
    if (params?.status) queryParams.append('status', params.status)
    if (params?.dateFrom) queryParams.append('dateFrom', params.dateFrom)
    if (params?.dateTo) queryParams.append('dateTo', params.dateTo)
    if (params?.hallId) queryParams.append('hallId', params.hallId)
    if (params?.organizerId) queryParams.append('organizerId', params.organizerId)
    
    const queryString = queryParams.toString()
    const url = queryString ? `${API_ENDPOINTS.EVENTS.BASE}?${queryString}` : API_ENDPOINTS.EVENTS.BASE
    
    const response = await apiClient.get<PagedResponse<EventListItem>>(url)
    return response.data
  },

  async getEventSeats(eventId: string): Promise<{ success: boolean; data: SeatDto[]; message?: string }> {
    const response = await apiClient.get<{ success: boolean; data: SeatDto[]; message?: string }>(
      `${API_ENDPOINTS.EVENTS.BY_ID(eventId)}/seats`
    )
    return response.data
  },

  async createEvent(payload: CreateEventRequest) {
    const formData = new FormData()
    
    // Required fields - đảm bảo format đúng cho backend
    formData.append('Title', payload.title)
    
    // Date: input type="date" trả về format YYYY-MM-DD (đúng format cho DateOnly)
    formData.append('Date', payload.date)
    
    // Time: input type="time" trả về format HH:mm
    // Backend expect string($time) với format HH:mm:ss (có giây)
    // Nếu chưa có giây thì thêm :00
    const startTimeFormatted = payload.startTime.includes(':') && payload.startTime.split(':').length === 2
      ? `${payload.startTime}:00`
      : payload.startTime
    const endTimeFormatted = payload.endTime.includes(':') && payload.endTime.split(':').length === 2
      ? `${payload.endTime}:00`
      : payload.endTime
    formData.append('StartTime', startTimeFormatted)
    formData.append('EndTime', endTimeFormatted)
    
    formData.append('TotalSeats', String(payload.totalSeats))
    formData.append('Rows', String(payload.rows))
    formData.append('SeatsPerRow', String(payload.seatsPerRow))
    
    // Optional fields - chỉ append nếu có giá trị và không rỗng
    if (payload.description && payload.description.trim()) {
      formData.append('Description', payload.description)
    }
    if (payload.location && payload.location.trim()) {
      formData.append('Location', payload.location)
    }
    if (payload.hallId && payload.hallId.trim()) {
      formData.append('HallId', payload.hallId)
    }
    if (payload.clubId && payload.clubId.trim()) {
      formData.append('ClubId', payload.clubId)
    }
    if (payload.clubName && payload.clubName.trim()) {
      formData.append('ClubName', payload.clubName)
    }
    
    // RegistrationStart/End: Backend expect string($date-time) (ISO format)
    // Input datetime-local trả về "YYYY-MM-DDTHH:mm", cần thêm giây và timezone
    if (payload.registrationStart) {
      let regStart = payload.registrationStart
      // Nếu là datetime-local format (YYYY-MM-DDTHH:mm), thêm giây và Z
      if (regStart.includes('T') && !regStart.includes('Z') && !regStart.includes('+')) {
        // Thêm :00 nếu chưa có giây
        if (regStart.split(':').length === 2) {
          regStart = `${regStart}:00`
        }
        // Thêm Z để chỉ định UTC (hoặc có thể để backend tự xử lý)
        // Nhưng thường backend sẽ parse được mà không cần Z
      }
      formData.append('RegistrationStart', regStart)
    }
    if (payload.registrationEnd) {
      let regEnd = payload.registrationEnd
      if (regEnd.includes('T') && !regEnd.includes('Z') && !regEnd.includes('+')) {
        if (regEnd.split(':').length === 2) {
          regEnd = `${regEnd}:00`
        }
      }
      formData.append('RegistrationEnd', regEnd)
    }
    
    // Tags: Backend expect string, không phải array
    // Nếu tags là array thì join, nếu là string thì dùng trực tiếp
    if (payload.tags) {
      const tagsValue = Array.isArray(payload.tags) 
        ? payload.tags.join(',') 
        : payload.tags
      if (tagsValue && tagsValue.trim()) {
        formData.append('Tags', tagsValue)
      }
    }
    
    // MaxTicketsPerUser: chỉ gửi nếu có giá trị hợp lệ (1-10)
    // Backend có default = 1, nên không cần gửi nếu không có giá trị
    if (payload.maxTicketsPerUser !== undefined && payload.maxTicketsPerUser >= 1 && payload.maxTicketsPerUser <= 10) {
      formData.append('MaxTicketsPerUser', String(payload.maxTicketsPerUser))
    }
    
    // ImageFile: chỉ append nếu có file
    if (payload.imageFile) {
      formData.append('ImageFile', payload.imageFile)
    }
    
    // SpeakerIds: chỉ append nếu có danh sách
    if (payload.speakerIds && payload.speakerIds.length > 0) {
      payload.speakerIds.forEach((id) => formData.append('SpeakerIds', id))
    }

    // Log FormData để debug (chỉ trong development)
    if (process.env.NODE_ENV === 'development') {
      console.log('FormData contents (CREATE):')
      for (const [key, value] of formData.entries()) {
        console.log(`${key}:`, value)
      }
    }

    // Không set Content-Type thủ công - axios sẽ tự động set với boundary khi gửi FormData
    // Tăng timeout cho request upload file lớn
    const response = await apiClient.post(API_ENDPOINTS.EVENTS.CREATE, formData, {
      timeout: 120000, // 2 phút cho upload file lớn
      headers: {
        // Không set Content-Type - để axios tự động set với boundary
      },
    })
    return response.data
  },

  async updateEvent(eventId: string, payload: UpdateEventRequest) {
    const formData = new FormData()
    
    // Required fields - đảm bảo format đúng cho backend
    formData.append('Title', payload.title)
    
    // Date: input type="date" trả về format YYYY-MM-DD (đúng format cho DateOnly)
    formData.append('Date', payload.date)
    
    // Time: input type="time" trả về format HH:mm
    // Backend expect string($time) với format HH:mm:ss (có giây)
    const startTimeFormatted = payload.startTime.includes(':') && payload.startTime.split(':').length === 2
      ? `${payload.startTime}:00`
      : payload.startTime
    const endTimeFormatted = payload.endTime.includes(':') && payload.endTime.split(':').length === 2
      ? `${payload.endTime}:00`
      : payload.endTime
    formData.append('StartTime', startTimeFormatted)
    formData.append('EndTime', endTimeFormatted)
    
    formData.append('TotalSeats', String(payload.totalSeats))
    formData.append('Rows', String(payload.rows))
    formData.append('SeatsPerRow', String(payload.seatsPerRow))
    
    // Optional fields - chỉ append nếu có giá trị
    if (payload.description) formData.append('Description', payload.description)
    if (payload.location) formData.append('Location', payload.location)
    if (payload.hallId) formData.append('HallId', payload.hallId)
    if (payload.clubId) formData.append('ClubId', payload.clubId)
    if (payload.clubName) formData.append('ClubName', payload.clubName)
    
    // RegistrationStart/End: Backend expect string($date-time) (ISO format)
    if (payload.registrationStart) {
      let regStart = payload.registrationStart
      if (regStart.includes('T') && !regStart.includes('Z') && !regStart.includes('+')) {
        if (regStart.split(':').length === 2) {
          regStart = `${regStart}:00`
        }
      }
      formData.append('RegistrationStart', regStart)
    }
    if (payload.registrationEnd) {
      let regEnd = payload.registrationEnd
      if (regEnd.includes('T') && !regEnd.includes('Z') && !regEnd.includes('+')) {
        if (regEnd.split(':').length === 2) {
          regEnd = `${regEnd}:00`
        }
      }
      formData.append('RegistrationEnd', regEnd)
    }
    
    // Tags: Backend expect string, không phải array
    // Nếu tags là array thì join, nếu là string thì dùng trực tiếp
    if (payload.tags) {
      const tagsValue = Array.isArray(payload.tags) 
        ? payload.tags.join(',') 
        : payload.tags
      if (tagsValue && tagsValue.trim()) {
        formData.append('Tags', tagsValue)
      }
    }
    
    if (payload.maxTicketsPerUser !== undefined && payload.maxTicketsPerUser >= 1 && payload.maxTicketsPerUser <= 10) {
      formData.append('MaxTicketsPerUser', String(payload.maxTicketsPerUser))
    }
    
    // ImageFile: chỉ append nếu có file mới (nếu không có thì giữ nguyên ảnh cũ)
    if (payload.imageFile) {
      formData.append('ImageFile', payload.imageFile)
    }

    // Log FormData để debug (chỉ trong development)
    if (process.env.NODE_ENV === 'development') {
      console.log('FormData contents (UPDATE):')
      for (const [key, value] of formData.entries()) {
        console.log(`${key}:`, value)
      }
    }

    const response = await apiClient.put(API_ENDPOINTS.EVENTS.UPDATE(eventId), formData, {
      timeout: 120000, // 2 phút cho upload file lớn
    })
    return response.data
  },

  async deleteEvent(eventId: string): Promise<{ success: boolean; message?: string }> {
    const response = await apiClient.delete<{ success: boolean; message?: string }>(
      API_ENDPOINTS.EVENTS.DELETE(eventId)
    )
    return response.data
  },
}


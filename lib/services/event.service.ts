/* ============================================
   Event Service
   Gọi API sự kiện (create, fetch)
   ============================================ */

import apiClient from "@/lib/api/client"
import { API_ENDPOINTS } from "@/lib/api/endpoints"

/* =======================
   REQUEST / FILTER TYPES
   ======================= */

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
  registrationStart?: string
  registrationEnd?: string
  tags?: string[]
  maxTicketsPerUser?: number
  imageFile?: File | null
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

/* =======================
   EVENT TYPES
   ======================= */

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
  tags?: string
}

export interface EventDetailDto extends EventListItem {
  hallId?: string
  hallName?: string
  organizerName?: string
  clubId?: string
  checkedInCount?: number
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

/* =======================
   PAGINATION
   ======================= */

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

/* =======================
   SEAT (BASIC)
   ======================= */

export interface SeatDto {
  seatId: string
  seatNumber: string
  rowLabel: string
  section?: string | null
  status: "available" | "reserved" | "occupied" | "blocked"
  hallId?: string
}

/* =======================
   SEAT (CHECK-IN MAP)
   ======================= */

export interface SeatOccupantDto {
  studentId: string
  studentName: string
  studentCode?: string
  ticketCode: string
  registeredAt: string
  checkInTime?: string | null
  ticketStatus: string
}

export interface SeatCheckinDto {
  seatId: string
  rowNumber: number
  seatNumber: number
  label: string
  status: "available" | "reserved" | "occupied"
  occupant?: SeatOccupantDto | null
}

export interface SeatRowCheckinDto {
  rowNumber: number
  rowLabel: string
  seats: SeatCheckinDto[]
}

export interface EventSeatCheckinMapDto {
  eventId: string
  hallId: string
  hallName: string
  totalRows: number
  maxSeatsPerRow: number
  totalSeats: number
  availableSeats: number
  reservedSeats: number
  occupiedSeats: number
  rows: SeatRowCheckinDto[]
}

/* =======================
   EVENT SERVICE
   ======================= */

export const eventService = {
  /* ===== Statistics ===== */

  async getEventStatistics(eventId: string): Promise<{
    success: boolean
    data?: Record<string, unknown>
    message?: string
    errors?: string[]
  }> {
    const response = await apiClient.get(
      API_ENDPOINTS.EVENTS.STATISTICS(eventId)
    )
    return response.data
  },

  /* ===== Event Detail ===== */

  async getEventById(
    eventId: string
  ): Promise<{ success: boolean; data: EventDetailDto; message?: string }> {
    const response = await apiClient.get(
      API_ENDPOINTS.EVENTS.BY_ID(eventId)
    )
    return response.data
  },

  /* ===== Event List ===== */

  async getAllEvents(
    params?: EventFilterParams
  ): Promise<PagedResponse<EventListItem>> {
    const queryParams = new URLSearchParams()

    if (params?.pageNumber)
      queryParams.append("pageNumber", String(params.pageNumber))
    if (params?.pageSize)
      queryParams.append("pageSize", String(params.pageSize))
    if (params?.search) queryParams.append("search", params.search)
    if (params?.status) queryParams.append("status", params.status)
    if (params?.dateFrom) queryParams.append("dateFrom", params.dateFrom)
    if (params?.dateTo) queryParams.append("dateTo", params.dateTo)
    if (params?.hallId) queryParams.append("hallId", params.hallId)
    if (params?.organizerId)
      queryParams.append("organizerId", params.organizerId)

    const url =
      queryParams.toString().length > 0
        ? `${API_ENDPOINTS.EVENTS.BASE}?${queryParams}`
        : API_ENDPOINTS.EVENTS.BASE

    const response = await apiClient.get<PagedResponse<EventListItem>>(url)
    return response.data
  },

  /* ===== Seats (Basic) ===== */

  async getEventSeats(
    eventId: string
  ): Promise<{ success: boolean; data: SeatDto[]; message?: string }> {
    const response = await apiClient.get(
      `${API_ENDPOINTS.EVENTS.BY_ID(eventId)}/seats`
    )
    return response.data
  },

  async getEventSeatMap(eventId: string): Promise<{
    success: boolean
    data: Record<string, unknown>
    message?: string
  }> {
    const response = await apiClient.get(
      `/api/Seats/events/${eventId}/available-seats`
    )
    return response.data
  },

  /* ===== Seats (Check-in Map) ===== */

  async getEventSeatCheckinMap(
    eventId: string
  ): Promise<{
    success: boolean
    data: EventSeatCheckinMapDto
    message?: string
    errors?: string[] | Record<string, string[]>
  }> {
    const response = await apiClient.get(
      `/api/Seats/events/${eventId}/checkin-map`
    )
    return response.data
  },

  /* ===== Publish ===== */

  async publishEvent(eventId: string) {
    const response = await apiClient.post(
      API_ENDPOINTS.EVENTS.PUBLISH(eventId)
    )
    return response.data
  },

  /* ===== Update ===== */

  async updateEvent(eventId: string, payload: UpdateEventRequest) {
    const formData = new FormData()

    formData.append("Title", payload.title)
    formData.append("Date", payload.date)

    const startTime =
      payload.startTime.split(":").length === 2
        ? `${payload.startTime}:00`
        : payload.startTime
    const endTime =
      payload.endTime.split(":").length === 2
        ? `${payload.endTime}:00`
        : payload.endTime

    formData.append("StartTime", startTime)
    formData.append("EndTime", endTime)

    if (payload.description)
      formData.append("Description", payload.description)
    if (payload.location) formData.append("Location", payload.location)
    if (payload.hallId) formData.append("HallId", payload.hallId)
    if (payload.clubId) formData.append("ClubId", payload.clubId)
    if (payload.clubName) formData.append("ClubName", payload.clubName)

    if (payload.registrationStart)
      formData.append("RegistrationStart", payload.registrationStart)
    if (payload.registrationEnd)
      formData.append("RegistrationEnd", payload.registrationEnd)

    if (payload.tags) {
      const tagsValue = Array.isArray(payload.tags)
        ? payload.tags.join(",")
        : payload.tags
      if (tagsValue.trim()) formData.append("Tags", tagsValue)
    }

    if (
      payload.maxTicketsPerUser &&
      payload.maxTicketsPerUser >= 1 &&
      payload.maxTicketsPerUser <= 10
    ) {
      formData.append(
        "MaxTicketsPerUser",
        String(payload.maxTicketsPerUser)
      )
    }

    if (payload.imageFile) {
      formData.append("ImageFile", payload.imageFile)
    }

    const response = await apiClient.put(
      API_ENDPOINTS.EVENTS.UPDATE(eventId),
      formData
    )
    return response.data
  },

  /* ===== Delete ===== */

  async deleteEvent(
    eventId: string
  ): Promise<{ success: boolean; message?: string }> {
    const response = await apiClient.delete(
      API_ENDPOINTS.EVENTS.DELETE(eventId)
    )
    return response.data
  },
}

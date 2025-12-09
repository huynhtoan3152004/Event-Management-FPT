/* ============================================
   API Types
   Types cho API requests và responses
   ============================================ */

import type {
  Event,
  Ticket,
  Speaker,
  Venue,
  Seat,
  User,
  DashboardStats,
  AttendanceRecord,
  CheckInRecord,
} from '@/types'

// ========== Common Types ==========

export interface ApiResponse<T = any> {
  success: boolean
  data: T
  message?: string
  errors?: Record<string, string[]>
}

export interface PaginatedResponse<T> {
  data: T[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

export interface ApiError {
  message: string
  errors?: Record<string, string[]>
  statusCode?: number
}

// ========== Event Types ==========

export interface CreateEventDto {
  title: string
  description: string
  date: string
  time: string
  endTime?: string
  location: string
  venueId: string
  imageUrl?: string
  totalSeats: number
  speakerIds?: string[]
  tags?: string[]
  clubId?: string
}

export interface UpdateEventDto extends Partial<CreateEventDto> {
  id: string
}

export interface EventResponse extends ApiResponse<Event> {}
export interface EventsResponse extends ApiResponse<Event[]> {}
export interface PaginatedEventsResponse extends ApiResponse<PaginatedResponse<Event>> {}

// ========== Ticket Types ==========

export interface RegisterEventResponse extends ApiResponse<Ticket> {}

export interface CancelTicketDto {
  reason?: string
}

export interface TicketsResponse extends ApiResponse<Ticket[]> {}

// ========== Speaker Types ==========

export interface CreateSpeakerDto {
  name: string
  title: string
  company?: string
  bio?: string
  avatar?: string
  email?: string
  linkedIn?: string
}

export interface UpdateSpeakerDto extends Partial<CreateSpeakerDto> {
  id: string
}

export interface SpeakersResponse extends ApiResponse<Speaker[]> {}
export interface SpeakerResponse extends ApiResponse<Speaker> {}

// ========== Venue Types ==========

export interface CreateVenueDto {
  name: string
  address: string
  capacity: number
  facilities?: string[]
  imageUrl?: string
  status: 'available' | 'maintenance' | 'booked'
  description?: string
}

export interface UpdateVenueDto extends Partial<CreateVenueDto> {
  id: string
}

export interface VenuesResponse extends ApiResponse<Venue[]> {}
export interface VenueResponse extends ApiResponse<Venue> {}

// ========== Seat Types ==========

export interface UpdateSeatStatusDto {
  status: 'available' | 'reserved' | 'occupied' | 'blocked'
  ticketId?: string
}

export interface BulkUpdateSeatsDto {
  seatIds: string[]
  status: 'available' | 'reserved' | 'occupied' | 'blocked'
}

export interface SeatsResponse extends ApiResponse<Seat[]> {}

// ========== Check-in Types ==========

export interface CheckInDto {
  ticketCode: string
}

export interface CheckInResponse extends ApiResponse<{
  success: boolean
  status: 'entered' | 'already_used' | 'not_found' | 'cancelled' | 'expired'
  message: string
  attendeeName?: string
  ticketCode?: string
  seatInfo?: string
  checkInTime?: string
}> {}

export interface CheckInRecordsResponse extends ApiResponse<CheckInRecord[]> {}

export interface CheckInStatsResponse extends ApiResponse<{
  totalRegistered: number
  totalCheckedIn: number
  remaining: number
  checkInRate: number
}> {}

// ========== Attendance Types ==========

export interface AttendanceResponse extends ApiResponse<AttendanceRecord[]> {}
export interface AttendanceStatsResponse extends ApiResponse<{
  totalEvents: number
  attendedEvents: number
  missedEvents: number
  attendanceRate: number
}> {}

// ========== Report Types ==========

export interface DashboardStatsResponse extends ApiResponse<DashboardStats> {}

export interface AttendanceReportResponse extends ApiResponse<{
  eventId: string
  eventName: string
  date: string
  totalRegistered: number
  totalAttended: number
  attendanceRate: number
  checkinsByHour: { hour: string; count: number }[]
}> {}

// ========== Auth Types ==========

export interface LoginDto {
  email: string
  password: string
}

export interface RegisterDto {
  name: string
  email: string
  password: string
  studentId?: string
  phone?: string
}

export interface AuthResponse extends ApiResponse<{
  user: User
  token: string
  refreshToken?: string
}> {}

// ========== User Types ==========

export interface UpdateProfileDto {
  name?: string
  phone?: string
  avatar?: string
}

export interface UserResponse extends ApiResponse<User> {}

// ========== Upload Types ==========

export interface UploadResponse extends ApiResponse<{
  url: string
  filename: string
  size: number
  mimeType: string
}> {}

// ========== Query Params Types ==========

export interface EventsQueryParams {
  status?: 'draft' | 'upcoming' | 'ongoing' | 'past' | 'cancelled'
  search?: string
  page?: number
  limit?: number
  sortBy?: 'date' | 'title' | 'createdAt'
  sortOrder?: 'asc' | 'desc'
  venueId?: string
  clubId?: string
}

export interface TicketsQueryParams {
  status?: 'valid' | 'used' | 'expired' | 'cancelled' | 'pending'
  eventId?: string
  page?: number
  limit?: number
}

export interface SpeakersQueryParams {
  search?: string
  company?: string
  page?: number
  limit?: number
}

export interface VenuesQueryParams {
  search?: string
  status?: 'available' | 'maintenance' | 'booked'
  minCapacity?: number
  maxCapacity?: number
  page?: number
  limit?: number
}


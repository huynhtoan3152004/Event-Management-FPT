/* ============================================
   API Endpoints Constants
   Định nghĩa tất cả API endpoints
   ============================================ */

export const API_ENDPOINTS = {
  // ========== Authentication ==========
  AUTH: {
    LOGIN: "/api/Auth/login",
    LOGOUT: "/api/Auth/logout",
    REGISTER: "/api/Auth/register",
    REFRESH_TOKEN: "/api/Auth/refresh",
    ME: "/api/Auth/me",
    CHANGE_PASSWORD: "/api/Auth/change-password",
  },

  // ========== Events ==========
  EVENTS: {
    BASE: "/api/Events",
    BY_ID: (id: string) => `/api/Events/${id}`,
    CREATE: "/api/Events",
    UPDATE: (id: string) => `/api/Events/${id}`,
    DELETE: (id: string) => `/api/Events/${id}`,
    REGISTER: (eventId: string) => `/api/Events/${eventId}/register`,
    CANCEL_REGISTRATION: (eventId: string) =>
      `/api/Events/${eventId}/cancel-registration`,
    STATS: (id: string) => `/api/Events/${id}/stats`,
    STATISTICS: (id: string) => `/api/Events/${id}/statistics`,
    ATTENDANCE: (id: string) => `/api/Events/${id}/attendance`,
    PUBLISH: (id: string) => `/api/Events/${id}/publish`,
  },

  // ========== Tickets ==========
  TICKETS: {
    BASE: "/tickets",
    BY_ID: (id: string) => `/tickets/${id}`,
    MY_TICKETS: "/tickets/my",
    CANCEL: (id: string) => `/tickets/${id}/cancel`,
    DOWNLOAD: (id: string) => `/tickets/${id}/download`,
    QR_CODE: (id: string) => `/tickets/${id}/qr`,
  },

  // ========== Speakers ==========
  SPEAKERS: {
    BASE: "/api/Speakers",
    BY_ID: (id: string) => `/api/Speakers/${id}`,
    CREATE: "/api/Speakers",
    UPDATE: (id: string) => `/api/Speakers/${id}`,
    DELETE: (id: string) => `/api/Speakers/${id}`,
    EVENTS: (id: string) => `/api/Speakers/${id}/events`,
  },

  // ========== Venues (Halls) ==========
  VENUES: {
    BASE: "/api/Halls",
    BY_ID: (id: string) => `/api/Halls/${id}`,
    CREATE: "/api/Halls",
    UPDATE: (id: string) => `/api/Halls/${id}`,
    DELETE: (id: string) => `/api/Halls/${id}`,

    // Seats in Hall
    SEATS: (id: string) => `/api/Halls/${id}/seats`,
    GENERATE_SEATS: (id: string) => `/api/Halls/${id}/seats/generate`,

    // Availability
    AVAILABILITY: (id: string) => `/api/Halls/${id}/availability`,
  },

  // ========== Seats ==========
  SEATS: {
    BASE: "/seats",
    BY_VENUE: (venueId: string) => `/seats/venue/${venueId}`,
    BY_EVENT: (eventId: string) => `/seats/event/${eventId}`,
    UPDATE_STATUS: (seatId: string) => `/seats/${seatId}/status`,
    BULK_UPDATE: "/seats/bulk-update",
  },

  // ========== Check-in ==========
  CHECKIN: {
    CHECK_IN: (ticketCode: string) => `/api/tickets/${ticketCode}/checkin`,
    VERIFY_TICKET: (ticketCode: string) => `/checkin/verify/${ticketCode}`,
    RECORDS: (eventId: string) => `/checkin/${eventId}/records`,
    STATS: (eventId: string) => `/checkin/${eventId}/stats`,
    REALTIME: (eventId: string) => `/checkin/${eventId}/realtime`,
  },

  // ========== Attendance ==========
  ATTENDANCE: {
    BASE: "/attendance",
    MY_ATTENDANCE: "/attendance/my",
    BY_EVENT: (eventId: string) => `/attendance/event/${eventId}`,
    STATS: "/attendance/stats",
  },

  // ========== Reports ==========
  REPORTS: {
    BASE: "/reports",
    DASHBOARD: "/reports/dashboard",
    EVENTS: "/reports/events",
    SYSTEM_SUMMARY: "/api/Reports/system-summary",
    MONTHLY: "/api/Reports/monthly",
    LIST_EVENTS: "/api/Reports/ListEvents",
    ATTENDANCE: (eventId: string) => `/reports/attendance/${eventId}`,
    EXPORT_CSV: (eventId: string) => `/reports/export/csv/${eventId}`,
    EXPORT_PDF: (eventId: string) => `/reports/export/pdf/${eventId}`,
    EXPORT_EXCEL: (eventId: string) => `/reports/export/excel/${eventId}`,
  },

  // ========== Users ==========
  USERS: {
    BASE: "/users",
    BY_ID: (id: string) => `/users/${id}`,
    PROFILE: "/users/profile",
    UPDATE_PROFILE: "/users/profile",
    AVATAR: "/users/avatar",
  },

  // ========== Upload ==========
  UPLOAD: {
    IMAGE: "/upload/image",
    DOCUMENT: "/upload/document",
  },
} as const;

// Helper function để build query string
export const buildQueryString = (params: Record<string, any>): string => {
  const searchParams = new URLSearchParams()

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      if (Array.isArray(value)) {
        value.forEach((item) => searchParams.append(key, String(item)))
      } else {
        searchParams.append(key, String(value))
      }
    }
  })

  const queryString = searchParams.toString()
  return queryString ? `?${queryString}` : ''
}

// Helper function để build endpoint với query params
export const buildEndpoint = (
  endpoint: string,
  params?: Record<string, any>
): string => {
  if (!params) return endpoint
  return `${endpoint}${buildQueryString(params)}`
}


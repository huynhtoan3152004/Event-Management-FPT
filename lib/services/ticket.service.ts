/* ============================================
   TICKET SERVICE - Service gọi API vé và đăng ký
   
   MÔ TẢ:
   - Service này chứa tất cả các hàm gọi API liên quan đến Tickets
   * Bao gồm: đăng ký vé, lấy danh sách vé, hủy vé, check-in, check-out
   
   API ENDPOINTS SỬ DỤNG:
   - POST /api/Events/{eventId}/register - Đăng ký vé cho sự kiện
   - GET /api/users/me/tickets - Lấy danh sách vé của user hiện tại
   - GET /api/events/{eventId}/tickets - Lấy danh sách vé của 1 sự kiện
   - GET /api/tickets/{ticketCode} - Lấy thông tin vé theo mã vé
   - POST /api/tickets/{ticketId}/cancel - Hủy vé
   - POST /api/tickets/{ticketCode}/checkin - Check-in vé (scan QR code)
   - POST /api/tickets/{ticketCode}/checkout - Check-out vé
   
   BẢNG DATABASE LIÊN QUAN:
   - tickets: Bảng chính lưu thông tin vé
   *   + ticketId, eventId, studentId, seatId, ticketCode, status, registeredAt
   *   + checkInTime, cancelledAt, cancelReason
   - events: Bảng sự kiện (liên kết qua eventId)
   - seats: Bảng ghế (liên kết qua seatId)
   - users: Bảng user (liên kết qua studentId)
   - ticket_checkins: Bảng lưu lịch sử check-in (nếu có)
   ============================================ */

import apiClient from '@/lib/api/client'
import { API_ENDPOINTS } from '@/lib/api/endpoints'
import type { ApiResponse } from '@/lib/api/types'

export interface RegisterTicketRequest {
  seatPreference?: string
  seatId?: string
}

export interface TicketDto {
  ticketId: string
  ticketCode: string
  status: string
  eventId: string
  eventTitle?: string
  eventDate: string
  eventStartTime: string
  eventEndTime: string
  studentId: string
  seatId?: string
  seatNumber?: string
}

export interface CheckInResultDto {
  result: string
  ticketId?: string
  attendeeName?: string
  ticketCode?: string
  checkInTime?: string
  seatInfo?: string
}

export const ticketService = {
  /**
   * ĐĂNG KÝ VÉ CHO SỰ KIỆN
   * 
   * API: POST /api/Events/{eventId}/register
   * 
   * Request Body:
   * - seatId?: string - ID ghế đã chọn (từ Seats.seatId)
   * - seatPreference?: string - Preference (chưa được xử lý ở backend)
   * 
   * Backend xử lý:
   * 1. Validation:
   *    - Kiểm tra event tồn tại và status = "published"
   *    - Kiểm tra trong thời gian đăng ký (registrationStart <= now <= registrationEnd)
   *    - Kiểm tra còn ghế trống (availableSeats > 0)
   *    - Kiểm tra user chưa đăng ký hoặc chưa đạt maxTicketsPerUser
   *    - Kiểm tra seatId hợp lệ và available (nếu có)
   * 
   * 2. Tạo record mới trong bảng Tickets:
   *    - ticketId: GUID mới
   *    - eventId: ID sự kiện
   *    - studentId: ID user hiện tại (từ JWT token)
   *    - seatId: Ghế đã chọn hoặc tự động chọn ghế trống
   *    - ticketCode: Mã vé duy nhất (format: EVENT-{eventId}-{timestamp}-{random})
   *    - status: "active"
   *    - registeredAt: DateTime.UtcNow
   * 
   * 3. Cập nhật bảng Events:
   *    - registeredCount += 1
   * 
   * 4. Cập nhật bảng Seats (nếu có ghế):
   *    - status = "reserved" (ghế đã được đặt)
   * 
   * Response: ApiResponse<TicketDto>
   * - success: boolean
   * - data: TicketDto
   *   + ticketId, ticketCode, status, eventId, seatId, seatNumber
   *   + eventTitle, eventDate, eventStartTime, eventEndTime, studentId
   * - message: Thông báo kết quả
   * 
   * Sử dụng:
   * - Trang chi tiết sự kiện, khi user click "Đăng ký ngay"
   * - Sau khi đăng ký thành công, hiển thị QR code từ ticketCode
   */
  async registerTicket(
    eventId: string,
    request: RegisterTicketRequest
  ): Promise<ApiResponse<TicketDto>> {
    const response = await apiClient.post<ApiResponse<TicketDto>>(
      API_ENDPOINTS.EVENTS.REGISTER(eventId),
      request
    )
    return response.data
  },

  /**
   * LẤY DANH SÁCH VÉ CỦA USER HIỆN TẠI
   * 
   * API: GET /api/users/me/tickets
   * 
   * Authentication: Cần JWT token (tự động thêm vào header bởi apiClient interceptor)
   * 
   * Response: ApiResponse<TicketDto[]>
   * 
   * Dữ liệu trả về từ bảng Tickets:
   * - Filter theo studentId = user hiện tại (từ JWT token)
   * - Bao gồm: ticketId, ticketCode, status, eventId, seatId, seatNumber
   * - Join với Events để lấy: eventTitle, eventDate, eventStartTime, eventEndTime
   * 
   * Status có thể là:
   * - "active": Đã đăng ký, chưa check-in
   * - "checked-in": Đã check-in, đang tham dự
   * - "completed": Đã check-out, hoàn thành
   * - "abandoned": Tham dự nhưng không check-out
   * - "cancelled": Đã hủy vé
   * 
   * Sử dụng:
   * - Trang "Vé của tôi" để hiển thị danh sách vé
   * - Kiểm tra đã đăng ký sự kiện nào chưa
   * - Filter và hiển thị theo status
   */
  async getMyTickets(): Promise<ApiResponse<TicketDto[]>> {
    const response = await apiClient.get<ApiResponse<TicketDto[]>>(
      "/api/users/me/tickets"
    )
    return response.data
  },

  /**
   * Lấy danh sách vé của một sự kiện
   * @param eventId - ID của sự kiện
   */
  async getEventTickets(eventId: string): Promise<ApiResponse<TicketDto[]>> {
    const response = await apiClient.get<ApiResponse<TicketDto[]>>(
      `/api/events/${eventId}/tickets`
    )
    return response.data
  },

  /**
   * Lấy thông tin vé theo mã vé
   * @param ticketCode - Mã vé
   */
  async getTicketByCode(ticketCode: string): Promise<ApiResponse<TicketDto>> {
    const response = await apiClient.get<ApiResponse<TicketDto>>(
      `/api/tickets/${ticketCode}`
    )
    return response.data
  },

  /**
   * Hủy vé
   * @param ticketId - ID của vé
   */
  async cancelTicket(ticketId: string): Promise<ApiResponse<void>> {
    const response = await apiClient.post<ApiResponse<void>>(
      `/api/tickets/${ticketId}/cancel`
    )
    return response.data
  },

  /**
   * CHECK-IN VÉ BẰNG TICKET CODE (SCAN QR CODE)
   * 
   * API: POST /api/tickets/{ticketCode}/checkin
   * 
   * Request: Không có body (chỉ cần ticketCode trong URL)
   * 
   * Backend xử lý:
   * 1. Tìm ticket theo ticketCode trong bảng Tickets
   * 2. Validation:
   *    - Ticket tồn tại và status = "active"
   *    - Event đang diễn ra (now >= startDateTime && now <= endDateTime)
   *    - Chưa check-in (checkInTime == null)
   * 
   * 3. Cập nhật bảng Tickets:
   *    - status = "checked-in"
   *    - checkInTime = DateTime.UtcNow
   * 
   * 4. Cập nhật bảng Events:
   *    - checkedInCount += 1
   * 
   * 5. Cập nhật bảng Seats (nếu có):
   *    - status = "occupied"
   * 
   * Response: ApiResponse<CheckInResultDto>
   * - result: "success" | "already_checked_in" | "invalid_ticket" | "event_not_started" | "error"
   * - ticketId, attendeeName, ticketCode, checkInTime, seatInfo
   * 
   * Sử dụng:
   * - Staff scan QR code để check-in sinh viên
   * - Trang check-in của staff
   */
  async checkInByCode(
    ticketCode: string
  ): Promise<ApiResponse<CheckInResultDto>> {
    const response = await apiClient.post<ApiResponse<CheckInResultDto>>(
      API_ENDPOINTS.CHECKIN.CHECK_IN(ticketCode)
    )
    return response.data
  },

  /**
   * Check-out vé (STAFF xác nhận sinh viên rời sự kiện)
   */
  async checkoutByCode(ticketCode: string): Promise<void> {
    await apiClient.post(`/api/tickets/${ticketCode}/checkout`)
  },
}
   
   
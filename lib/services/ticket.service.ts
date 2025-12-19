/* ============================================
   Ticket Service
   Gọi API đăng ký vé và quản lý ticket
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
   * Đăng ký vé cho sự kiện
   * @param eventId - ID của sự kiện
   * @param request - Thông tin đăng ký (seatPreference, seatId)
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
   * Lấy danh sách vé của user hiện tại
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
   * Check-in vé bằng ticket code
   * @param ticketCode - Mã vé (từ QR code)
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
   
   
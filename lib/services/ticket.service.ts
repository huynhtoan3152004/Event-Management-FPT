/* ============================================
   Ticket Service
   Gọi API đăng ký vé và quản lý ticket
   ============================================ */

import apiClient from '@/lib/api/client'

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

export interface ApiResponse<T> {
  success: boolean
  message?: string
  data?: T
  errors?: string[]
}

class TicketService {
  /**
   * Đăng ký vé cho sự kiện
   * @param eventId - ID của sự kiện
   * @param request - Thông tin đăng ký (seatPreference, seatId)
   */
  async registerTicket(
    eventId: string,
    request: RegisterTicketRequest
  ): Promise<ApiResponse<TicketDto>> {
    try {
      const response = await apiClient.post<ApiResponse<TicketDto>>(
        `/api/events/${eventId}/register`,
        request
      )
      return response.data
    } catch (error: any) {
      // Error đã được xử lý trong interceptor, chỉ cần throw lại
      throw error
    }
  }

  /**
   * Lấy danh sách vé của user hiện tại
   */
  async getMyTickets(): Promise<ApiResponse<TicketDto[]>> {
    try {
      const response = await apiClient.get<ApiResponse<TicketDto[]>>(
        '/api/users/me/tickets'
      )
      return response.data
    } catch (error: any) {
      throw error
    }
  }

  /**
   * Lấy thông tin vé theo mã vé
   * @param ticketCode - Mã vé
   */
  async getTicketByCode(ticketCode: string): Promise<ApiResponse<TicketDto>> {
    try {
      const response = await apiClient.get<ApiResponse<TicketDto>>(
        `/api/tickets/${ticketCode}`
      )
      return response.data
    } catch (error: any) {
      throw error
    }
  }

  /**
   * Hủy vé
   * @param ticketId - ID của vé
   */
  async cancelTicket(ticketId: string): Promise<ApiResponse<void>> {
    try {
      const response = await apiClient.post<ApiResponse<void>>(
        `/api/tickets/${ticketId}/cancel`
      )
      return response.data
    } catch (error: any) {
      throw error
    }
  }
}

export const ticketService = new TicketService()


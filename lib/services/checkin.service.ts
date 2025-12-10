/* ============================================
   Check-in Service
   Gọi API check-in và quản lý check-in records
   ============================================ */

import apiClient from '@/lib/api/client'
import { API_ENDPOINTS } from '@/lib/api/endpoints'

export interface CheckInRecord {
  id: string
  attendeeName: string
  ticketCode: string
  checkInTime: string
  status: 'entered' | 'already_used' | 'not_found' | 'cancelled'
  seatInfo?: string
}

export interface CheckInStats {
  checkedIn: number
  totalRegistered: number
  checkInRate: number
}

export interface ApiResponse<T> {
  success: boolean
  message?: string
  data?: T
  errors?: string[]
}

class CheckInService {
  /**
   * Check-in vé bằng ticket code
   * @param ticketCode - Mã vé (từ QR code)
   */
  async checkIn(ticketCode: string): Promise<ApiResponse<{ result: string }>> {
    try {
      const response = await apiClient.post<ApiResponse<{ result: string }>>(
        API_ENDPOINTS.CHECKIN.CHECK_IN(ticketCode)
      )
      return response.data
    } catch (error: any) {
      throw error
    }
  }

  /**
   * Lấy danh sách check-in records của một event
   * @param eventId - ID của event
   */
  async getCheckInRecords(eventId: string): Promise<ApiResponse<CheckInRecord[]>> {
    try {
      const response = await apiClient.get<ApiResponse<CheckInRecord[]>>(
        API_ENDPOINTS.CHECKIN.RECORDS(eventId)
      )
      return response.data
    } catch (error: any) {
      // If 404, return failure response instead of throwing
      if (error?.response?.status === 404) {
        return {
          success: false,
          message: "Check-in records endpoint not available",
          data: [],
        }
      }
      throw error
    }
  }

  /**
   * Lấy thống kê check-in của một event
   * @param eventId - ID của event
   */
  async getCheckInStats(eventId: string): Promise<ApiResponse<CheckInStats>> {
    try {
      const response = await apiClient.get<ApiResponse<CheckInStats>>(
        API_ENDPOINTS.CHECKIN.STATS(eventId)
      )
      return response.data
    } catch (error: any) {
      // If 404, return failure response instead of throwing
      if (error?.response?.status === 404) {
        return {
          success: false,
          message: "Check-in stats endpoint not available",
        }
      }
      throw error
    }
  }
}

export const checkInService = new CheckInService()

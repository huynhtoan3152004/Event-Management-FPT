/* ============================================
   Check-in Service
   Gọi API check-in và quản lý check-in records
   ============================================ */

import apiClient from '@/lib/api/client'
import { API_ENDPOINTS } from '@/lib/api/endpoints'
import type { ApiResponse } from '@/lib/api/types'

export interface CheckInRecord {
  id: string
  attendeeName: string
  ticketCode: string
  checkInTime: string
  status: 'entered' | 'already_used' | 'not_found' | 'cancelled' | 'checked_out'
  seatInfo?: string
}

export interface CheckInStats {
  checkedIn: number
  totalRegistered: number
  checkInRate: number
}

export const checkInService = {
  /**
   * Check-in vé bằng ticket code
   * @param ticketCode - Mã vé (từ QR code)
   */
  async checkIn(ticketCode: string): Promise<ApiResponse<{ result: string }>> {
    const response = await apiClient.post<ApiResponse<{ result: string }>>(
      API_ENDPOINTS.CHECKIN.CHECK_IN(ticketCode)
    )
    return response.data
  },

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
    } catch (error: unknown) {
      // If 404, return failure response instead of throwing
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as { response?: { status?: number } }
        if (axiosError.response?.status === 404) {
          return {
            success: false,
            message: "Check-in records endpoint not available",
            data: [],
          }
        }
      }
      throw error
    }
  },

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
    } catch (error: unknown) {
      // If 404, return failure response instead of throwing
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as { response?: { status?: number } }
        if (axiosError.response?.status === 404) {
          return {
            success: false,
            message: "Check-in stats endpoint not available",
          }
        }
      }
      throw error
    }
  },
}

/* ============================================
   Report Service
   Gọi API reports và analytics
   ============================================ */

import apiClient from '@/lib/api/client'
import { API_ENDPOINTS, buildEndpoint } from '@/lib/api/endpoints'

export interface SystemSummaryResponse {
  success: boolean
  message: string
  data: {
    totalEvents: number
    totalStudentsParticipated: number
    totalTickets: number
    totalCheckins: number
    eventsByMonth: Array<{
      year: number
      month: number
      eventCount: number
    }>
    attendanceByMonth: Array<{
      year: number
      month: number
      participantCount: number
    }>
  }
  errors: null | any
}

export interface SystemSummaryParams {
  From?: string // date-time
  To?: string // date-time
  EventStatus?: string
}

export const reportService = {
  /**
   * Lấy system summary report
   */
  async getSystemSummary(params?: SystemSummaryParams): Promise<SystemSummaryResponse> {
    const endpoint = buildEndpoint(API_ENDPOINTS.REPORTS.SYSTEM_SUMMARY, params)
    const response = await apiClient.get<SystemSummaryResponse>(endpoint)
    return response.data
  },
}


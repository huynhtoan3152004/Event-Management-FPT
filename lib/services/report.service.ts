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
    totalRegistrations: number
    participatedCount: number
    notParticipatedCount: number
    participatedPercent: number
    notParticipatedPercent: number
    abandonedCount: number
    // Optional fields for backward compatibility
    totalStudentsParticipated?: number
    totalTickets?: number
    totalCheckins?: number
    eventsByMonth?: Array<{
      year: number
      month: number
      eventCount: number
    }>
    attendanceByMonth?: Array<{
      year: number
      month: number
      participantCount: number
    }>
  }
  errors: null | string[] | Record<string, string[]>
}

export interface SystemSummaryParams {
  From?: string // date-time
  To?: string // date-time
  EventStatus?: string
}

export interface MonthlyReportItem {
  year: number
  month: number
  totalRegistrations: number
  participatedCount: number
  notParticipatedCount: number
  abandonedCount: number
}

export interface MonthlyReportResponse {
  success: boolean
  message: string
  data: MonthlyReportItem[]
  errors: null | string[] | Record<string, string[]>
}

export interface MonthlyReportParams {
  fromDate?: string // date
  toDate?: string // date
}

export interface EventReportItem {
  eventName: string
  eventDate: string
  totalRegistrations: number
  participatedCount: number
  notParticipatedCount: number
  participatedPercent: number
  notParticipatedPercent: number
  abandonedCount: number
}

export interface EventListReportResponse {
  success: boolean
  message: string
  data: EventReportItem[]
  errors: null | string[] | Record<string, string[]>
}

export interface EventListReportParams {
  fromDate?: string // date
  toDate?: string // date
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

  /**
   * Lấy monthly report data
   */
  async getMonthlyReport(params?: MonthlyReportParams): Promise<MonthlyReportResponse> {
    const endpoint = buildEndpoint(API_ENDPOINTS.REPORTS.MONTHLY, params)
    const response = await apiClient.get<MonthlyReportResponse>(endpoint)
    return response.data
  },

  /**
   * Lấy danh sách events report
   */
  async getEventListReport(params?: EventListReportParams): Promise<EventListReportResponse> {
    const endpoint = buildEndpoint(API_ENDPOINTS.REPORTS.LIST_EVENTS, params)
    const response = await apiClient.get<EventListReportResponse>(endpoint)
    return response.data
  },
}


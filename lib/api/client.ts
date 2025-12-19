/* ============================================
   API CLIENT - Axios instance với interceptors
   
   MÔ TẢ:
   - File này tạo axios instance với cấu hình chung cho tất cả API calls
   - Có request interceptor để tự động thêm JWT token vào header
   * - Có response interceptor để xử lý lỗi chung
   * - Tự động xử lý FormData (multipart/form-data) cho upload file
   
   CẤU HÌNH:
   - baseURL: Từ env variable NEXT_PUBLIC_API_URL (ví dụ: "http://localhost:5000")
   - timeout: 8000ms (8 giây)
   - headers: Content-Type: application/json (mặc định)
   
   REQUEST INTERCEPTOR:
   - Tự động lấy JWT token từ localStorage
   - Thêm Authorization header: "Bearer {token}"
   - Xử lý FormData: Xóa Content-Type để axios tự set boundary
   - Log request trong development mode
   
   RESPONSE INTERCEPTOR:
   - Log response trong development mode
   - Xử lý lỗi HTTP chung (401, 403, 500, etc.) qua handleHttpError
   - Tự động redirect đến login nếu 401 (token hết hạn)
   
   SỬ DỤNG:
   - Tất cả service files (event.service, ticket.service, auth.service, etc.)
   * - Import: import apiClient from '@/lib/api/client'
   * - Gọi: apiClient.get(), apiClient.post(), apiClient.put(), apiClient.delete()
   ============================================ */

import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig, AxiosResponse } from 'axios'
import { handleHttpError } from './error-handler'

/**
 * TẠO AXIOS INSTANCE VỚI CẤU HÌNH CHUNG
 * 
 * baseURL: URL backend API (từ env variable)
 * timeout: 8000ms - Thời gian chờ tối đa cho mỗi request
 * headers: Content-Type mặc định là application/json
 * 
 * Lưu ý: Content-Type sẽ được tự động điều chỉnh:
 * - application/json: Cho JSON data
 * - multipart/form-data: Cho FormData (upload file) - axios tự set boundary
 */
const apiClient: AxiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  timeout: Number(process.env.NEXT_PUBLIC_API_TIMEOUT) || 8000,
  headers: {
    'Content-Type': 'application/json',
  },
})

/**
 * REQUEST INTERCEPTOR - Xử lý trước khi gửi request
 * 
 * Logic:
 * 1. Xử lý FormData:
 *    - Nếu data là FormData, xóa Content-Type header
 *    - Để axios tự động set Content-Type: multipart/form-data với boundary
 *    - Cần thiết cho upload file (ảnh sự kiện, avatar, etc.)
 * 
 * 2. Thêm JWT token:
 *    - Lấy token từ localStorage (key: "token")
 *    - Thêm vào header: Authorization: "Bearer {token}"
 *    - Tất cả API calls đều có token (trừ login/register)
 * 
 * 3. Log request (chỉ trong development):
 *    - Log method, URL, data, params để debug
 * 
 * Chạy trước mỗi API call
 */
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Remove Content-Type for FormData to let axios set boundary automatically
    if (config.data instanceof FormData && config.headers) {
      delete config.headers['Content-Type']
    }

    // Get token from localStorage
    // Token được lưu khi login (authService.saveAuthData)
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null

    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`
    }

    // Log request in development
    if (process.env.NODE_ENV === 'development') {
      console.log(`[API Request] ${config.method?.toUpperCase()} ${config.url}`, {
        data: config.data,
        params: config.params,
      })
    }

    return config
  },
  (error: AxiosError) => {
    return Promise.reject(error)
  }
)

/**
 * RESPONSE INTERCEPTOR - Xử lý sau khi nhận response
 * 
 * Logic:
 * 1. Log response (chỉ trong development):
 *    - Log method, URL, status, data để debug
 * 
 * 2. Xử lý lỗi HTTP:
 *    - Gọi handleHttpError để xử lý lỗi chung
 *    - 401: Token hết hạn → Redirect đến login
 *    - 403: Không có quyền → Hiển thị thông báo
 *    - 500: Lỗi server → Hiển thị thông báo
 *    - Các lỗi khác → Hiển thị message từ backend
 * 
 * Chạy sau mỗi API response (cả success và error)
 */
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    // Log response in development
    if (process.env.NODE_ENV === 'development') {
      console.log(`[API Response] ${response.config.method?.toUpperCase()} ${response.config.url}`, {
        status: response.status,
        data: response.data,
      })
    }

    return response
  },
  (error: AxiosError) => {
    // Handle HTTP errors
    // Xử lý 401, 403, 500, network errors, etc.
    handleHttpError(error)

    return Promise.reject(error)
  }
)

// Export default client
export default apiClient

// Export types
export type { AxiosError, AxiosResponse } from 'axios'


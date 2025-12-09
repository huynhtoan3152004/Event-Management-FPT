
import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from 'axios'
import { toast } from 'sonner'

// Tạo axios instance
const apiClient: AxiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://s4kc4gkkkc4ssko484sscow8.14.225.231.92.sslip.io',
  timeout: Number(process.env.NEXT_PUBLIC_API_TIMEOUT) || 10000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request Interceptor - Thêm token vào header
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Lấy token từ localStorage hoặc cookies
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null

    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`
    }

    // Log request trong development
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

// Response Interceptor - Xử lý response và errors
apiClient.interceptors.response.use(
  (response: any) => {
    // Log response trong development
    if (process.env.NODE_ENV === 'development') {
      console.log(`[API Response] ${response.config.method?.toUpperCase()} ${response.config.url}`, {
        status: response.status,
        data: response.data,
      })
    }

    return response
  },
  (error: AxiosError) => {
    // Xử lý lỗi
    if (error.response) {
      // Server trả về error response
      const status = error.response.status
      const data = error.response.data as { message?: string; error?: string }

      // Xử lý các status code cụ thể
      switch (status) {
        case 401:
          // Unauthorized - Xóa token và redirect đến login
          if (typeof window !== 'undefined') {
            localStorage.removeItem('token')
            localStorage.removeItem('user')
            // Có thể redirect đến login page
            // window.location.href = '/login'
          }
          toast.error('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.')
          break

        case 403:
          toast.error('Bạn không có quyền thực hiện hành động này.')
          break

        case 404:
          toast.error('Không tìm thấy dữ liệu.')
          break

        case 422:
          // Validation error
          const message = data?.message || data?.error || 'Dữ liệu không hợp lệ.'
          toast.error(message)
          break

        case 429:
          toast.error('Quá nhiều yêu cầu. Vui lòng thử lại sau.')
          break

        case 500:
          toast.error('Lỗi server. Vui lòng thử lại sau.')
          break

        default:
          const errorMessage = data?.message || data?.error || 'Đã xảy ra lỗi không xác định.'
          toast.error(errorMessage)
      }
    } else if (error.request) {
      // Request được gửi nhưng không nhận được response
      toast.error('Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng.')
    } else {
      // Lỗi khi setup request
      toast.error('Đã xảy ra lỗi khi gửi yêu cầu.')
    }

    // Log error trong development
    if (process.env.NODE_ENV === 'development') {
      console.error('[API Error]', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
      })
    }

    return Promise.reject(error)
  }
)

// Export default client
export default apiClient

// Export types
export type { AxiosError, AxiosResponse } from 'axios'


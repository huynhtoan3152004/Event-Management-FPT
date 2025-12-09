
import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from 'axios'
import { toast } from 'react-toastify'

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
    // Nếu data là FormData, xóa Content-Type để axios tự động set với boundary
    if (config.data instanceof FormData && config.headers) {
      delete config.headers['Content-Type']
    }

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
          toast.error('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.', {
            position: 'top-right',
            autoClose: 4000,
          })
          break

        case 403:
          toast.error('Bạn không có quyền thực hiện hành động này.', {
            position: 'top-right',
            autoClose: 4000,
          })
          break

        case 404:
          toast.error('Không tìm thấy dữ liệu.', {
            position: 'top-right',
            autoClose: 3000,
          })
          break

        case 415:
          toast.error('Định dạng dữ liệu không được hỗ trợ. Vui lòng thử lại.', {
            position: 'top-right',
            autoClose: 4000,
          })
          break

        case 422:
          // Validation error
          const message = data?.message || data?.error || 'Dữ liệu không hợp lệ.'
          toast.error(message, {
            position: 'top-right',
            autoClose: 4000,
          })
          break

        case 429:
          toast.error('Quá nhiều yêu cầu. Vui lòng thử lại sau.', {
            position: 'top-right',
            autoClose: 4000,
          })
          break

        case 500:
          // 500 Internal Server Error - có response từ server, không phải CORS
          // Kiểm tra xem có data không (có thể response body rỗng)
          let serverError = 'Lỗi server. Vui lòng thử lại sau.'
          
          // Kiểm tra nhiều format khác nhau của error response
          if (data) {
            if (typeof data === 'string') {
              // Response là string
              serverError = data
            } else if (data.message) {
              // Response có format { message: ... }
              serverError = data.message
            } else if (data.error) {
              // Response có format { error: ... }
              serverError = data.error
            } else if (Array.isArray(data) && data.length > 0) {
              // Response là array of errors
              serverError = data.join(', ')
            } else {
              // Có data nhưng không parse được
              serverError = JSON.stringify(data) || serverError
            }
          } else {
            // Response 500 nhưng không có body - có thể là exception không được handle ở backend
            serverError = 'Lỗi server (500). Có thể do dữ liệu không hợp lệ hoặc lỗi xử lý ở backend. Vui lòng kiểm tra lại dữ liệu.'
          }
          
          toast.error(serverError, {
            position: 'top-right',
            autoClose: 6000,
          })
          break

        default:
          const errorMessage = data?.message || data?.error || 'Đã xảy ra lỗi không xác định.'
          toast.error(errorMessage, {
            position: 'top-right',
            autoClose: 4000,
          })
      }
    } else if (error.request) {
      // Request được gửi nhưng không nhận được response
      // Kiểm tra nếu là CORS error
      if (error.message === 'Network Error' || error.code === 'ERR_NETWORK') {
        toast.error('Lỗi CORS: Backend không cho phép request từ frontend. Vui lòng kiểm tra cấu hình CORS trên server.', {
          position: 'top-right',
          autoClose: 6000,
        })
      } else {
        toast.error('Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng.', {
          position: 'top-right',
          autoClose: 4000,
        })
      }
    } else {
      // Lỗi khi setup request
      toast.error('Đã xảy ra lỗi khi gửi yêu cầu.', {
        position: 'top-right',
        autoClose: 4000,
      })
    }

    // Log error chi tiết để debug
    if (process.env.NODE_ENV === 'development') {
      console.error('[API Error]', {
        message: error.message,
        code: error.code,
        response: error.response?.data,
        status: error.response?.status,
        statusText: error.response?.statusText,
        headers: error.response?.headers,
        request: error.request ? 'Request sent but no response' : 'No request sent',
        isCorsError: error.message === 'Network Error' || error.code === 'ERR_NETWORK',
        fullError: error,
      })
      
      // Log chi tiết response nếu có
      if (error.response) {
        console.error('[API Error Response Details]', {
          status: error.response.status,
          statusText: error.response.statusText,
          data: error.response.data,
          headers: error.response.headers,
        })
      }
    }

    return Promise.reject(error)
  }
)

// Export default client
export default apiClient

// Export types
export type { AxiosError, AxiosResponse } from 'axios'


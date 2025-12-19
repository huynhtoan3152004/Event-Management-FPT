/* ============================================
   API Error Handler Utilities
   Helper functions for handling API errors
   ============================================ */

import { AxiosError } from 'axios'
import { toast } from 'react-toastify'

interface ErrorResponseData {
  message?: string
  error?: string
}

/**
 * Check if current route is a protected route
 */
function isProtectedRoute(): boolean {
  if (typeof window === 'undefined') return false
  
  const pathname = window.location.pathname
  return (
    pathname.startsWith('/dashboard') ||
    pathname.startsWith('/organizer') ||
    pathname.startsWith('/staff') ||
    pathname.startsWith('/login') ||
    pathname.startsWith('/register')
  )
}

/**
 * Handle 401 Unauthorized errors
 */
export function handleUnauthorized(): void {
  if (typeof window === 'undefined') return
  
  if (isProtectedRoute()) {
    // Clear auth data
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    localStorage.removeItem('expiresAt')
    
    // Show toast only for protected routes (excluding login/register)
    const pathname = window.location.pathname
    if (pathname.startsWith('/dashboard') || pathname.startsWith('/organizer') || pathname.startsWith('/staff')) {
      toast.error('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.', {
        position: 'top-right',
        autoClose: 4000,
      })
    }
    
    // Redirect to login
    window.location.href = '/login'
  }
}

/**
 * Extract error message from error response data
 */
function extractErrorMessage(data: unknown): string {
  if (!data) {
    return 'Lỗi server. Vui lòng thử lại sau.'
  }
  
  if (typeof data === 'string') {
    return data
  }
  
  if (typeof data === 'object') {
    const errorData = data as ErrorResponseData
    
    if (errorData.message) {
      return errorData.message
    }
    
    if (errorData.error) {
      return errorData.error
    }
    
    if (Array.isArray(data) && data.length > 0) {
      return data.join(', ')
    }
    
    // Try to stringify if it's an object
    try {
      const stringified = JSON.stringify(data)
      if (stringified !== '{}') {
        return stringified
      }
    } catch {
      // Ignore JSON.stringify errors
    }
  }
  
  return 'Lỗi server. Vui lòng thử lại sau.'
}

/**
 * Handle HTTP error responses
 */
export function handleHttpError(error: AxiosError): void {
  if (!error.response) {
    // Network error or request setup error
    toast.error('Đã xảy ra lỗi khi gửi yêu cầu.', {
      position: 'top-right',
      autoClose: 4000,
    })
    return
  }
  
  const status = error.response.status
  const data = error.response.data
  
  switch (status) {
    case 401:
      handleUnauthorized()
      break
      
    case 403:
      toast.error('Bạn không có quyền thực hiện hành động này.', {
        position: 'top-right',
        autoClose: 4000,
      })
      break
      
    case 404:
      // Don't show toast for 404 - let components handle it
      break
      
    case 415:
      toast.error('Định dạng dữ liệu không được hỗ trợ. Vui lòng thử lại.', {
        position: 'top-right',
        autoClose: 4000,
      })
      break
      
    case 422:
      // Validation error
      const validationMessage = extractErrorMessage(data)
      toast.error(validationMessage, {
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
      // Server error with detailed message extraction
      const serverError = extractErrorMessage(data) || 
        'Lỗi server (500). Có thể do dữ liệu không hợp lệ hoặc lỗi xử lý ở backend. Vui lòng kiểm tra lại dữ liệu.'
      toast.error(serverError, {
        position: 'top-right',
        autoClose: 6000,
      })
      break
      
    default:
      const errorMessage = extractErrorMessage(data) || 'Đã xảy ra lỗi không xác định.'
      toast.error(errorMessage, {
        position: 'top-right',
        autoClose: 4000,
      })
  }
}


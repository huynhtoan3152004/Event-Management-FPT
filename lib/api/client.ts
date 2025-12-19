/* ============================================
   API Client
   Axios instance với interceptors cho authentication và error handling
   ============================================ */

import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig, AxiosResponse } from 'axios'
import { handleHttpError } from './error-handler'

// Create axios instance
const apiClient: AxiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  timeout: Number(process.env.NEXT_PUBLIC_API_TIMEOUT) || 8000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request Interceptor - Add token to header
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Remove Content-Type for FormData to let axios set boundary automatically
    if (config.data instanceof FormData && config.headers) {
      delete config.headers['Content-Type']
    }

    // Get token from localStorage
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

// Response Interceptor - Handle responses and errors
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
    handleHttpError(error)

    return Promise.reject(error)
  }
)

// Export default client
export default apiClient

// Export types
export type { AxiosError, AxiosResponse } from 'axios'


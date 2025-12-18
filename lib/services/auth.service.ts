/* ============================================
   Auth Service
   Xử lý authentication API calls
   ============================================ */

import apiClient from '@/lib/api/client'
import { API_ENDPOINTS } from '@/lib/api/endpoints'
import type { LoginRequest, RegisterRequest, AuthResponse, ApiResponse } from '@/lib/api/types'

export const authService = {
  /**
   * Đăng nhập bằng email và password
   */
  async login(data: LoginRequest): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>(API_ENDPOINTS.AUTH.LOGIN, data)
    return response.data
  },

  /**
   * Đăng ký tài khoản mới
   */
  async register(data: RegisterRequest): Promise<ApiResponse<null>> {
    const response = await apiClient.post<ApiResponse<null>>(API_ENDPOINTS.AUTH.REGISTER, data)
    return response.data
  },

  /**
   * Lấy thông tin user hiện tại
   */
  async getCurrentUser(): Promise<{ userId: string; email: string; role: string }> {
    const response = await apiClient.get<{ userId: string; email: string; role: string }>(
      API_ENDPOINTS.AUTH.ME
    )
    return response.data
  },

  /**
   * Đăng xuất (xóa token ở client side)
   */
  logout(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      localStorage.removeItem('expiresAt')
    }
  },

  /**
   * Lưu token và user info vào localStorage
   */
  saveAuthData(authData: AuthResponse): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem('token', authData.accessToken)
      localStorage.setItem('user', JSON.stringify({
        userId: authData.userId,
        email: authData.email,
        name: authData.name,
        roleId: authData.roleId,
        roleName: authData.roleName,
      }))
      localStorage.setItem('expiresAt', authData.expiresAt.toString())
    }
  },

  /**
   * Lấy token từ localStorage
   */
  getToken(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('token')
    }
    return null
  },

  /**
   * Lấy user info từ localStorage
   */
  getUser(): { userId: string; email: string; name: string; roleId: string | null; roleName: string | null; avatar?: string } | null {
    if (typeof window !== 'undefined') {
      const userStr = localStorage.getItem('user')
      if (userStr) {
        return JSON.parse(userStr)
      }
    }
    return null
  },

  /**
   * Kiểm tra user đã đăng nhập chưa
   * Note: Đã tắt check expiry để hỗ trợ demo với time hệ thống khác
   */
  isAuthenticated(): boolean {
    const token = this.getToken()
    if (!token) return false

    // DEMO MODE: Bỏ check expiry để có thể chỉnh time hệ thống khi demo
    // Uncomment đoạn dưới nếu muốn bật lại check expiry sau khi demo
    /*
    const expiresAt = localStorage.getItem('expiresAt')
    if (expiresAt) {
      const expiryDate = new Date(expiresAt)
      if (expiryDate < new Date()) {
        this.logout()
        return false
      }
    }
    */

    return true
  },
}


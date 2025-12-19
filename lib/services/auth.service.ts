/* ============================================
   AUTH SERVICE - Service xử lý authentication
   
   MÔ TẢ:
   - Service này chứa tất cả các hàm liên quan đến authentication
   * - Bao gồm: đăng nhập, đăng ký, lấy thông tin user, quản lý token
   
   API ENDPOINTS SỬ DỤNG:
   - POST /api/Auth/login - Đăng nhập
   - POST /api/Auth/register - Đăng ký tài khoản mới
   - GET /api/Auth/me - Lấy thông tin user hiện tại
   - POST /api/Auth/logout - Đăng xuất (client-side)
   - POST /api/Auth/change-password - Đổi mật khẩu
   
   BẢNG DATABASE LIÊN QUAN:
   - users: Bảng user (userId, email, passwordHash, name, roleId, etc.)
   - roles: Bảng vai trò (roleId, roleName: Student, Organizer, Staff, Admin)
   - user_auth_providers: Bảng xác thực (nếu có OAuth)
   
   TOKEN MANAGEMENT:
   - Token được lưu trong localStorage (key: "token")
   - User info được lưu trong localStorage (key: "user")
   - ExpiresAt được lưu trong localStorage (key: "expiresAt")
   - Token được tự động thêm vào header bởi apiClient interceptor
   ============================================ */

import apiClient from '@/lib/api/client'
import { API_ENDPOINTS } from '@/lib/api/endpoints'
import type { LoginRequest, RegisterRequest, AuthResponse, ApiResponse } from '@/lib/api/types'

export const authService = {
  /**
   * ĐĂNG NHẬP BẰNG EMAIL VÀ PASSWORD
   * 
   * API: POST /api/Auth/login
   * 
   * Request Body (LoginRequest):
   * - email: string - Email đăng nhập
   * - password: string - Mật khẩu
   * 
   * Backend xử lý:
   * 1. Tìm user theo email trong bảng Users
   * 2. Verify password (hash và so sánh)
   * 3. Tạo JWT token với thông tin: userId, email, roleId, roleName
   * 4. Trả về token và user info
   * 
   * Response (AuthResponse):
   * - success: boolean
   * - accessToken: string - JWT token (lưu vào localStorage)
   * - userId: string - ID user (từ Users.userId)
   * - email: string - Email (từ Users.email)
   * - name: string - Tên user (từ Users.name)
   * - roleId: string - ID vai trò (từ Users.roleId)
   * - roleName: string - Tên vai trò (từ Roles.roleName: Student, Organizer, Staff, Admin)
   * - expiresAt: DateTime - Thời gian hết hạn token
   * 
   * Sau khi login thành công:
   * - Gọi saveAuthData() để lưu token và user info vào localStorage
   * - Redirect đến trang dashboard tương ứng với role
   * 
   * Sử dụng:
   * - Trang login (/login)
   */
  async login(data: LoginRequest): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>(API_ENDPOINTS.AUTH.LOGIN, data)
    return response.data
  },

  /**
   * ĐĂNG KÝ TÀI KHOẢN MỚI
   * 
   * API: POST /api/Auth/register
   * 
   * Request Body (RegisterRequest):
   * - email: string - Email đăng ký
   * - password: string - Mật khẩu
   * - name?: string - Tên (tùy chọn)
   * - roleId?: string - Vai trò (mặc định: Student)
   * 
   * Backend xử lý:
   * 1. Kiểm tra email chưa tồn tại trong bảng Users
   * 2. Hash password
   * 3. Tạo record mới trong bảng Users:
   *    - userId: GUID mới
   *    - email, passwordHash, name
   *    - roleId: Mặc định là Student (hoặc từ request)
   *    - createdAt: DateTime.UtcNow
   * 4. Trả về success message
   * 
   * Response: ApiResponse<null>
   * - success: boolean
   * - message: string - Thông báo kết quả
   * 
   * Sau khi đăng ký thành công:
   * - Có thể tự động login hoặc redirect đến trang login
   * 
   * Sử dụng:
   * - Trang đăng ký (/register)
   */
  async register(data: RegisterRequest): Promise<ApiResponse<null>> {
    const response = await apiClient.post<ApiResponse<null>>(API_ENDPOINTS.AUTH.REGISTER, data)
    return response.data
  },

  /**
   * LẤY THÔNG TIN USER HIỆN TẠI
   * 
   * API: GET /api/Auth/me
   * 
   * Authentication: Cần JWT token (tự động thêm vào header)
   * 
   * Backend xử lý:
   * 1. Decode JWT token để lấy userId
   * 2. Tìm user trong bảng Users theo userId
   * 3. Join với bảng Roles để lấy roleName
   * 4. Trả về thông tin user
   * 
   * Response: { userId: string, email: string, role: string }
   * - userId: ID user (từ Users.userId)
   * - email: Email (từ Users.email)
   * - role: Tên vai trò (từ Roles.roleName)
   * 
   * Sử dụng:
   * - Kiểm tra user đã đăng nhập chưa
   * - Lấy thông tin user để hiển thị trên UI
   * - Kiểm tra quyền truy cập (role-based access control)
   */
  async getCurrentUser(): Promise<{ userId: string; email: string; role: string }> {
    const response = await apiClient.get<{ userId: string; email: string; role: string }>(
      API_ENDPOINTS.AUTH.ME
    )
    return response.data
  },

  /**
   * ĐĂNG XUẤT (XÓA TOKEN Ở CLIENT SIDE)
   * 
   * Logic:
   * - Xóa token, user info, expiresAt khỏi localStorage
   * - Không cần gọi API (token sẽ tự động invalid khi hết hạn)
   * 
   * Sau khi logout:
   * - Redirect đến trang login
   * - Clear tất cả state liên quan đến user
   * 
   * Sử dụng:
   * - Khi user click "Đăng xuất"
   * - Khi token hết hạn (tự động logout)
   */
  logout(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      localStorage.removeItem('expiresAt')
    }
  },

  /**
   * LƯU TOKEN VÀ USER INFO VÀO LOCALSTORAGE
   * 
   * Input: AuthResponse từ API login
   * - accessToken: JWT token
   * - userId, email, name, roleId, roleName
   * - expiresAt: Thời gian hết hạn
   * 
   * Lưu vào localStorage:
   * - "token": JWT token (để thêm vào header mỗi API call)
   * - "user": JSON string của user info (để hiển thị trên UI)
   * - "expiresAt": Thời gian hết hạn (để check token còn hợp lệ)
   * 
   * Sử dụng:
   * - Sau khi login thành công
   * - Token được tự động thêm vào header bởi apiClient interceptor
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
   * LẤY TOKEN TỪ LOCALSTORAGE
   * 
   * Return: JWT token hoặc null
   * 
   * Sử dụng:
   * - Kiểm tra user đã đăng nhập chưa
   * - Thêm vào header API call (tự động bởi apiClient interceptor)
   */
  getToken(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('token')
    }
    return null
  },

  /**
   * LẤY USER INFO TỪ LOCALSTORAGE
   * 
   * Return: User object hoặc null
   * - userId, email, name, roleId, roleName, avatar (nếu có)
   * 
   * Dữ liệu từ: localStorage.getItem('user') - JSON string
   * 
   * Sử dụng:
   * - Hiển thị tên user trên UI
   * - Kiểm tra role để điều hướng (Student → /dashboard, Organizer → /organizer)
   * - Kiểm tra quyền truy cập
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
   * KIỂM TRA USER ĐÃ ĐĂNG NHẬP CHƯA
   * 
   * Logic:
   * 1. Kiểm tra có token trong localStorage không
   * 2. (Tùy chọn) Kiểm tra token còn hết hạn không
   * 
   * Lưu ý: Hiện tại đã tắt check expiry để hỗ trợ demo
   * - Có thể chỉnh time hệ thống khi demo mà không bị logout
   * - Nên bật lại check expiry trong production
   * 
   * Return: true nếu đã đăng nhập, false nếu chưa
   * 
   * Sử dụng:
   * - Protected routes (chỉ cho phép truy cập khi đã login)
   * - Redirect đến login nếu chưa đăng nhập
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


/* ============================================
   Auth Hooks
   React hooks cho authentication
   ============================================ */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { toast } from 'react-toastify'
import { authService } from '@/lib/services/auth.service'
import type { LoginRequest, RegisterRequest } from '@/lib/api/types'

/**
 * Hook để đăng nhập
 */
export function useLogin() {
  const router = useRouter()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: LoginRequest) => authService.login(data),
    onSuccess: (data) => {
      // Lưu token và user info
      authService.saveAuthData(data)

      // Invalidate queries để refresh data
      queryClient.invalidateQueries({ queryKey: ['user'] })

      toast.success('Đăng nhập thành công!', {
        position: 'top-right',
        autoClose: 2000,
      })

      // Redirect dựa trên role
      const roleId = data.roleId?.toLowerCase()
      switch (roleId) {
        case 'student':
          router.push('/dashboard')
          break
        case 'organizer':
          router.push('/organizer')
          break
        case 'staff':
          router.push('/staff')
          break
        default:
          router.push('/dashboard')
      }
    },
    onError: (error: any) => {
      const errorMessage =
        error.response?.data?.message ||
        error.response?.data?.error ||
        'Đăng nhập thất bại. Vui lòng kiểm tra lại email và mật khẩu.'
      toast.error(errorMessage, {
        position: 'top-right',
        autoClose: 4000,
      })
    },
  })
}

/**
 * Hook để đăng ký
 */
export function useRegister() {
  const router = useRouter()

  return useMutation({
    mutationFn: (data: RegisterRequest) => authService.register(data),
    onSuccess: (data) => {
      // Hiển thị toast thành công với message từ backend
      const successMessage = data.message || 'Đăng ký thành công! Vui lòng đăng nhập để tiếp tục.'
      toast.success(successMessage, {
        position: 'top-right',
        autoClose: 3000,
      })

      // Redirect đến login page sau khi đăng ký thành công
      setTimeout(() => {
        router.push('/login')
      }, 2000)
    },
    onError: (error: any) => {
      // Xử lý lỗi validation từ backend
      if (error.response?.data?.errors && Array.isArray(error.response.data.errors)) {
        const errors = error.response.data.errors
        errors.forEach((err: string) =>
          toast.error(err, {
            position: 'top-right',
            autoClose: 4000,
          })
        )
      } else {
        const errorMessage =
          error.response?.data?.message ||
          error.response?.data?.error ||
          'Đăng ký thất bại. Vui lòng thử lại.'
        toast.error(errorMessage, {
          position: 'top-right',
          autoClose: 4000,
        })
      }
    },
  })
}

/**
 * Hook để lấy thông tin user hiện tại
 */
export function useCurrentUser() {
  return useQuery({
    queryKey: ['user', 'current'],
    queryFn: () => authService.getCurrentUser(),
    enabled: authService.isAuthenticated(),
    retry: false,
  })
}

/**
 * Hook để đăng xuất
 */
export function useLogout() {
  const router = useRouter()
  const queryClient = useQueryClient()

  return {
    logout: () => {
      authService.logout()
      queryClient.clear()
      toast.success('Đăng xuất thành công!', {
        position: 'top-right',
        autoClose: 2000,
      })
      router.push('/login')
    },
  }
}


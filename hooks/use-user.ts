/* ============================================
   User Hook
   Hook để lấy thông tin user từ localStorage hoặc API
   ============================================ */

import { useQuery } from '@tanstack/react-query'
import { authService } from '@/lib/services/auth.service'
import { useState, useEffect } from 'react'

export interface UserInfo {
  userId: string
  email: string
  name: string
  roleId: string | null
  roleName: string | null
  avatar?: string
}

/**
 * Hook để lấy thông tin user hiện tại
 * Ưu tiên lấy từ localStorage (nhanh), sau đó fetch từ API để cập nhật
 */
export function useUser() {
  const [localUser, setLocalUser] = useState<UserInfo | null>(() => {
    if (typeof window !== 'undefined') {
      return authService.getUser()
    }
    return null
  })

  // Fetch user từ API nếu đã đăng nhập
  const { data: apiUser, isLoading } = useQuery({
    queryKey: ['user', 'current'],
    queryFn: async () => {
      try {
        const userData = await authService.getCurrentUser()
        // Lấy thông tin đầy đủ từ localStorage
        const localUserData = authService.getUser()
        return {
          userId: userData.userId,
          email: userData.email,
          name: localUserData?.name || userData.email.split('@')[0],
          roleId: localUserData?.roleId || null,
          roleName: localUserData?.roleName || null,
          avatar: localUserData?.avatar,
        } as UserInfo
      } catch (error) {
        // Nếu API fail, trả về user từ localStorage
        return localUser
      }
    },
    enabled: authService.isAuthenticated() && !!localUser,
    retry: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })

  // Update local user khi có thay đổi từ localStorage
  useEffect(() => {
    const handleStorageChange = () => {
      const user = authService.getUser()
      setLocalUser(user)
    }

    // Listen for storage changes
    window.addEventListener('storage', handleStorageChange)
    
    // Check localStorage periodically (for same-tab updates)
    const interval = setInterval(() => {
      const user = authService.getUser()
      if (user && JSON.stringify(user) !== JSON.stringify(localUser)) {
        setLocalUser(user)
      }
    }, 1000)

    return () => {
      window.removeEventListener('storage', handleStorageChange)
      clearInterval(interval)
    }
  }, [localUser])

  // Return API user nếu có, nếu không thì dùng local user
  const user = apiUser || localUser

  return {
    user,
    isLoading: isLoading && !localUser,
    isAuthenticated: !!user && authService.isAuthenticated(),
  }
}


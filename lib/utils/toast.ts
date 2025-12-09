/* ============================================
   Toast Utility
   Helper functions để sử dụng toast dễ dàng hơn
   Sử dụng react-toastify
   ============================================ */

import { toast, ToastOptions } from 'react-toastify'

/**
 * Hiển thị toast thành công
 */
export const showSuccessToast = (message: string, options?: ToastOptions) => {
  return toast.success(message, {
    position: 'top-right',
    autoClose: 3000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
    ...options,
  })
}

/**
 * Hiển thị toast lỗi
 */
export const showErrorToast = (message: string, options?: ToastOptions) => {
  return toast.error(message, {
    position: 'top-right',
    autoClose: 4000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
    ...options,
  })
}

/**
 * Hiển thị toast cảnh báo
 */
export const showWarningToast = (message: string, options?: ToastOptions) => {
  return toast.warning(message, {
    position: 'top-right',
    autoClose: 3000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
    ...options,
  })
}

/**
 * Hiển thị toast thông tin
 */
export const showInfoToast = (message: string, options?: ToastOptions) => {
  return toast.info(message, {
    position: 'top-right',
    autoClose: 3000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
    ...options,
  })
}

/**
 * Hiển thị toast loading
 */
export const showLoadingToast = (message: string, options?: ToastOptions) => {
  return toast.loading(message, {
    position: 'top-right',
    autoClose: false,
    hideProgressBar: true,
    closeOnClick: false,
    pauseOnHover: true,
    draggable: false,
    ...options,
  })
}

/**
 * Dismiss toast
 */
export const dismissToast = (toastId?: string | number) => {
  toast.dismiss(toastId)
}

/**
 * Update toast (dùng cho loading toast)
 */
export const updateToast = (toastId: string | number, message: string, type: 'success' | 'error' | 'info' | 'warning' = 'success') => {
  toast.update(toastId, {
    render: message,
    type,
    isLoading: false,
    autoClose: 3000,
  })
}


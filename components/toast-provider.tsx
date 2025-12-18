/* ============================================
   Toast Provider Component
   Component chung để hiển thị toast notifications
   Sử dụng react-toastify cho toàn bộ ứng dụng
   ============================================ */

'use client'

import { useEffect, useState } from 'react'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

export function ToastProvider() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Only render ToastContainer on client to avoid hydration mismatch
  if (!mounted) {
    return null
  }

  return (
    <ToastContainer
      position="top-right"
      autoClose={3000}
      hideProgressBar={false}
      newestOnTop={false}
      closeOnClick
      rtl={false}
      pauseOnFocusLoss
      draggable
      pauseOnHover
      theme="light"
      toastClassName="toast-custom"
      limit={5}
    />
  )
}


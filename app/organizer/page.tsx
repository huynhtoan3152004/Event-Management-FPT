"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

export default function OrganizerDashboardPage() {
  const router = useRouter()

  useEffect(() => {
    router.replace("/organizer/events")
  }, [router])

  return null
}

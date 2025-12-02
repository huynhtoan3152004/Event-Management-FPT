import type React from "react"
/* ============================================
   FPTU Event Hub - Type Definitions
   Centralized types for the entire application
   Updated: Added Speaker, Venue, Seat types
   ============================================ */

// User roles in the system
export type UserRole = "student" | "organizer" | "staff" | "admin"

// User interface
export interface User {
  id: string
  name: string
  email: string
  avatar?: string
  role: UserRole
  studentId?: string
  phone?: string
}

// Event status
export type EventStatus = "draft" | "upcoming" | "ongoing" | "past" | "cancelled"

export interface Event {
  id: string
  title: string
  description: string
  date: string
  time: string
  endTime?: string
  location: string
  venueId?: string
  imageUrl: string
  clubId: string
  clubName: string
  status: EventStatus
  totalSeats: number
  registeredCount: number
  checkedInCount?: number
  speakers?: Speaker[]
  tags?: string[]
  createdAt?: string
  updatedAt?: string
}

// Club interface
export interface Club {
  id: string
  name: string
  description: string
  imageUrl: string
  memberCount: number
  category: string
}

export interface Speaker {
  id: string
  name: string
  title: string
  company?: string
  bio?: string
  avatar?: string
  email?: string
  linkedIn?: string
}

export interface Venue {
  id: string
  name: string
  address: string
  capacity: number
  facilities?: string[]
  imageUrl?: string
  status: "available" | "maintenance" | "booked"
  description?: string
}

export interface Seat {
  id: string
  venueId: string
  seatNumber: string
  row: string
  section?: string
  status: "available" | "reserved" | "occupied" | "blocked"
  ticketId?: string
}

// Ticket status with more states
export type TicketStatus = "valid" | "used" | "expired" | "cancelled" | "pending"

// Ticket interface
export interface Ticket {
  id: string
  eventId: string
  eventTitle: string
  userId: string
  userName?: string
  userEmail?: string
  ticketCode: string
  qrCode: string
  status: TicketStatus
  checkInTime?: string
  seatId?: string
  seatInfo?: string
  createdAt?: string
  cancelledAt?: string
  cancelReason?: string
}

// Attendance record
export interface AttendanceRecord {
  id: string
  eventId: string
  eventTitle: string
  date: string
  status: "attended" | "missed"
}

// Check-in record for staff portal
export type CheckInStatus = "entered" | "already_used" | "not_found" | "cancelled" | "expired"

export interface CheckInRecord {
  id: string
  attendeeName: string
  ticketCode: string
  checkInTime: string
  status: CheckInStatus
  seatInfo?: string
}

// Dashboard statistics
export interface DashboardStats {
  totalEvents: number
  totalRegistrations: number
  averageAttendanceRate: number
  eventsThisMonth: number
  registrationsThisMonth: number
}

export interface EventStats {
  totalRegistered: number
  totalCheckedIn: number
  remaining: number
  checkInRate: number
}

// Navigation item for menus
export interface NavItem {
  label: string
  href: string
  icon?: React.ComponentType<{ className?: string }>
  badge?: string | number
}

export interface AttendanceReport {
  eventId: string
  eventName: string
  date: string
  totalRegistered: number
  totalAttended: number
  attendanceRate: number
  checkinsByHour: { hour: string; count: number }[]
}

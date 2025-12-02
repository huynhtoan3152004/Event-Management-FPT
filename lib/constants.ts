/* ============================================
   FPTU Event Hub - Constants & Mock Data
   Centralized data for demonstration
   Updated: Added Speakers, Venues, enhanced events
   ============================================ */

import type {
  Event,
  Club,
  Ticket,
  AttendanceRecord,
  CheckInRecord,
  DashboardStats,
  Speaker,
  Venue,
  EventStats,
} from "@/types"

// Navigation links for public pages
export const PUBLIC_NAV_LINKS = [
  { label: "Sự kiện", href: "/events" },
  { label: "Giới thiệu", href: "/about" },
]

export const MOCK_SPEAKERS: Speaker[] = [
  {
    id: "speaker-1",
    name: "Dr. Nguyen Van A",
    title: "AI Research Lead",
    company: "FPT Software",
    bio: "Chuyên gia AI với hơn 10 năm kinh nghiệm trong machine learning và deep learning.",
    avatar: "/male-asian-professional.jpg",
    email: "nguyenvana@fpt.com",
    linkedIn: "https://linkedin.com/in/nguyenvana",
  },
  {
    id: "speaker-2",
    name: "Ms. Tran Thi B",
    title: "Startup Founder & CEO",
    company: "TechViet",
    bio: "Founder của 3 startup thành công trong lĩnh vực EdTech.",
    avatar: "/female-asian-businesswoman.jpg",
    email: "tranthib@techviet.vn",
  },
  {
    id: "speaker-3",
    name: "Mr. Le Hoang C",
    title: "Senior Software Engineer",
    company: "Google",
    bio: "Software Engineer tại Google với expertise về distributed systems.",
    avatar: "/male-developer-professional.jpg",
    email: "lehoangc@google.com",
  },
]

export const MOCK_VENUES: Venue[] = [
  {
    id: "venue-1",
    name: "Grand Hall",
    address: "Building A, FPT University HCMC",
    capacity: 500,
    facilities: ["Projector", "Sound System", "AC", "WiFi", "Stage"],
    status: "available",
    description: "Hội trường lớn nhất của trường, phù hợp cho các sự kiện quy mô lớn.",
  },
  {
    id: "venue-2",
    name: "Hall A",
    address: "Building B, FPT University HCMC",
    capacity: 250,
    facilities: ["Projector", "Sound System", "AC", "WiFi"],
    status: "available",
    description: "Phòng hội thảo vừa, thích hợp cho workshop và talkshow.",
  },
  {
    id: "venue-3",
    name: "Innovation Hub",
    address: "Building C, FPT University HCMC",
    capacity: 100,
    facilities: ["Smart TV", "Whiteboard", "AC", "WiFi", "Recording Equipment"],
    status: "available",
    description: "Không gian sáng tạo với thiết bị hiện đại.",
  },
  {
    id: "venue-4",
    name: "Exhibition Hall",
    address: "Building D, FPT University HCMC",
    capacity: 200,
    facilities: ["Display Panels", "Lighting", "AC", "WiFi"],
    status: "maintenance",
    description: "Khu vực triển lãm với không gian mở.",
  },
  {
    id: "venue-5",
    name: "Main Auditorium",
    address: "Main Campus, FPT University HCMC",
    capacity: 800,
    facilities: ["Stage", "Professional Sound", "Lighting", "Backstage", "WiFi"],
    status: "available",
    description: "Sân khấu chính dành cho các sự kiện lớn nhất.",
  },
]

// Mock Events Data - Enhanced with speakers and venues
export const MOCK_EVENTS: Event[] = [
  {
    id: "1",
    title: "F-Code Workshop: Mastering React",
    description: "Học cách xây dựng ứng dụng React chuyên nghiệp với các best practices mới nhất.",
    date: "28/10/2024",
    time: "18:00",
    endTime: "21:00",
    location: "Hall A",
    venueId: "venue-2",
    imageUrl: "/coding-workshop-react-programming.jpg",
    clubId: "1",
    clubName: "F-Code Club",
    status: "upcoming",
    totalSeats: 100,
    registeredCount: 85,
    speakers: [MOCK_SPEAKERS[2]],
    tags: ["Technology", "Workshop", "React"],
  },
  {
    id: "2",
    title: "Business Idea Pitching Contest",
    description: "Cuộc thi ý tưởng kinh doanh dành cho sinh viên với giải thưởng hấp dẫn.",
    date: "29/10/2024",
    time: "09:00",
    endTime: "17:00",
    location: "Innovation Hub",
    venueId: "venue-3",
    imageUrl: "/business-meeting-presentation-pitch.jpg",
    clubId: "3",
    clubName: "Business Club",
    status: "upcoming",
    totalSeats: 200,
    registeredCount: 150,
    speakers: [MOCK_SPEAKERS[1]],
    tags: ["Business", "Competition", "Startup"],
  },
  {
    id: "3",
    title: "FPTU Music Festival 2024",
    description: "Đêm nhạc hội lớn nhất trong năm với nhiều ca sĩ nổi tiếng.",
    date: "03/11/2024",
    time: "19:00",
    endTime: "23:00",
    location: "Main Auditorium",
    venueId: "venue-5",
    imageUrl: "/music-festival-concert-stage-lights.jpg",
    clubId: "4",
    clubName: "Music Club",
    status: "upcoming",
    totalSeats: 500,
    registeredCount: 480,
    tags: ["Music", "Festival", "Entertainment"],
  },
  {
    id: "4",
    title: "AI Talk: Future of GenAI",
    description: "Talkshow về tương lai của Generative AI và ứng dụng trong thực tế.",
    date: "06/11/2024",
    time: "14:00",
    endTime: "16:30",
    location: "Grand Hall",
    venueId: "venue-1",
    imageUrl: "/ai-artificial-intelligence-technology-talk.jpg",
    clubId: "1",
    clubName: "F-Code Club",
    status: "upcoming",
    totalSeats: 300,
    registeredCount: 250,
    speakers: [MOCK_SPEAKERS[0]],
    tags: ["Technology", "AI", "Talkshow"],
  },
]

// Mock Clubs Data
export const MOCK_CLUBS: Club[] = [
  {
    id: "1",
    name: "F-Code Club",
    description: "Kết nối những người đam mê lập trình và các kỹ sư phần mềm tương lai.",
    imageUrl: "/abstract-green-mint-gradient-circle-tech.jpg",
    memberCount: 250,
    category: "Technology",
  },
  {
    id: "2",
    name: "Japanese Club - FJC",
    description: "Khám phá văn hóa, ngôn ngữ và truyền thống Nhật Bản.",
    imageUrl: "/abstract-dark-green-nature-gradient-circle.jpg",
    memberCount: 180,
    category: "Culture",
  },
  {
    id: "3",
    name: "FPTU Business Club",
    description: "Thúc đẩy tinh thần khởi nghiệp và kinh doanh trong sinh viên.",
    imageUrl: "/abstract-teal-wave-gradient-circle-business.jpg",
    memberCount: 200,
    category: "Business",
  },
  {
    id: "4",
    name: "Vovinam Club",
    description: "Luyện tập và phát triển võ thuật truyền thống của Việt Nam.",
    imageUrl: "/abstract-green-leaf-nature-circle.jpg",
    memberCount: 120,
    category: "Sports",
  },
]

// Mock user data for student dashboard
export const MOCK_STUDENT_USER = {
  id: "student-1",
  name: "An Nguyen",
  email: "annguyen@fpt.edu.vn",
  avatar: "/female-asian-student-avatar.jpg",
  role: "student" as const,
  studentId: "SE171234",
}

// Mock staff user
export const MOCK_STAFF_USER = {
  id: "staff-1",
  name: "Minh Tuan",
  email: "minhtuan@fpt.edu.vn",
  avatar: "/male-asian-staff-avatar.jpg",
  role: "staff" as const,
}

// Mock tickets for student
export const MOCK_TICKETS: Ticket[] = [
  {
    id: "ticket-1",
    eventId: "3",
    eventTitle: "FPTU Talk #5: GenAI",
    userId: "student-1",
    ticketCode: "FPTU...X5F",
    qrCode: "/qr-code-ticket.jpg",
    status: "valid",
    createdAt: "2024-10-20",
  },
]

// Mock attendance records
export const MOCK_ATTENDANCE: AttendanceRecord[] = [
  { id: "1", eventId: "1", eventTitle: "Orientation Day 2024", date: "Sep 05, 2024", status: "attended" },
  { id: "2", eventId: "2", eventTitle: "Hackathon: Code & Create", date: "Oct 12, 2024", status: "attended" },
  { id: "3", eventId: "3", eventTitle: "Halloween Night Party", date: "Oct 31, 2024", status: "attended" },
]

// Mock check-in records for staff - Enhanced with seat info
export const MOCK_CHECKIN_RECORDS: CheckInRecord[] = [
  {
    id: "1",
    attendeeName: "Le Thi B",
    ticketCode: "FPTU...X5F",
    checkInTime: "10:02 AM",
    status: "entered",
    seatInfo: "A-12",
  },
  {
    id: "2",
    attendeeName: "Tran Van C",
    ticketCode: "FPTU...Y8G",
    checkInTime: "10:01 AM",
    status: "entered",
    seatInfo: "A-13",
  },
  {
    id: "3",
    attendeeName: "Hoang Thi D",
    ticketCode: "FPTU...Z9H",
    checkInTime: "09:58 AM",
    status: "entered",
    seatInfo: "B-05",
  },
  { id: "4", attendeeName: "Nguyen Van A", ticketCode: "FPTU...A1B", checkInTime: "09:15 AM", status: "already_used" },
  {
    id: "5",
    attendeeName: "Pham Van E",
    ticketCode: "FPTU...B2C",
    checkInTime: "09:45 AM",
    status: "entered",
    seatInfo: "B-08",
  },
  {
    id: "6",
    attendeeName: "Vu Thi F",
    ticketCode: "FPTU...C3D",
    checkInTime: "09:42 AM",
    status: "entered",
    seatInfo: "C-01",
  },
  {
    id: "7",
    attendeeName: "Dinh Van G",
    ticketCode: "FPTU...D4E",
    checkInTime: "09:30 AM",
    status: "entered",
    seatInfo: "C-02",
  },
]

// Mock dashboard stats for organizer
export const MOCK_DASHBOARD_STATS: DashboardStats = {
  totalEvents: 12,
  totalRegistrations: 1540,
  averageAttendanceRate: 85,
  eventsThisMonth: 2,
  registrationsThisMonth: 120,
}

export const MOCK_EVENT_STATS: EventStats = {
  totalRegistered: 500,
  totalCheckedIn: 152,
  remaining: 348,
  checkInRate: 30.4,
}

// Organizer events table data
export const MOCK_ORGANIZER_EVENTS = [
  {
    id: "1",
    name: 'Music Festival "Soundwave"',
    date: "Oct 28, 2023",
    hall: "Grand Hall",
    registered: "500 / 500",
    checkedIn: 450,
  },
  {
    id: "2",
    name: "Tech Conference 2023",
    date: "Nov 05, 2023",
    hall: "Hall A",
    registered: "230 / 250",
    checkedIn: 198,
  },
  {
    id: "3",
    name: "Art Exhibition: Modern Era",
    date: "Nov 12, 2023",
    hall: "Exhibition Hall",
    registered: "150 / 200",
    checkedIn: 145,
  },
  {
    id: "4",
    name: "Annual Hackathon",
    date: "Dec 01, 2023",
    hall: "Main Auditorium",
    registered: "98 / 100",
    checkedIn: 95,
  },
]

export const MOCK_STAFF_EVENTS = [
  {
    id: "1",
    name: "FPT Tech Day 2024",
    date: "October 26, 2024",
    time: "08:00 AM - 05:00 PM",
    location: "FPT University HCMC",
    venueId: "venue-1",
    status: "ongoing" as const,
    totalRegistered: 500,
    checkedIn: 152,
    speakers: [MOCK_SPEAKERS[0], MOCK_SPEAKERS[2]],
  },
  {
    id: "2",
    name: "Code War 2024",
    date: "November 15, 2024",
    time: "09:00 AM - 04:00 PM",
    location: "Innovation Hub",
    venueId: "venue-3",
    status: "upcoming" as const,
    totalRegistered: 100,
    checkedIn: 0,
    speakers: [MOCK_SPEAKERS[2]],
  },
  {
    id: "3",
    name: "Music Festival",
    date: "December 05, 2024",
    time: "06:00 PM - 11:00 PM",
    location: "Main Auditorium",
    venueId: "venue-5",
    status: "upcoming" as const,
    totalRegistered: 800,
    checkedIn: 0,
  },
]

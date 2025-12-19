/* ============================================
   Services Module Export
   Centralized export for all service modules
   ============================================ */

export { authService } from './auth.service'
export { checkInService } from './checkin.service'
export { eventService } from './event.service'
export { reportService } from './report.service'
export { speakerService } from './speaker.service'
export { ticketService } from './ticket.service'
export { userService } from './user.service'
export { venueService } from './venue.service'

// Export types
export type { RegisterTicketRequest, TicketDto, CheckInResultDto } from './ticket.service'
export type { CheckInRecord, CheckInStats } from './checkin.service'
export type {
  EventListItem,
  EventDetailDto,
  EventFilterParams,
  UpdateEventRequest,
  PagedResponse,
  SeatDto,
  SeatOccupantDto,
  SeatCheckinDto,
  SeatRowCheckinDto,
  EventSeatCheckinMapDto,
} from './event.service'
export type {
  SystemSummaryResponse,
  SystemSummaryParams,
  MonthlyReportItem,
  MonthlyReportResponse,
  MonthlyReportParams,
  EventReportItem,
  EventListReportResponse,
  EventListReportParams,
} from './report.service'
export type { SpeakerRequest, SpeakerDto } from './speaker.service'
export type { StudentProfile } from './user.service'
export type {
  CreateVenueRequest,
  UpdateVenueRequest,
  GenerateSeatsRequest,
  VenueDto,
} from './venue.service'


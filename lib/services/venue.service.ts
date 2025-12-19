import apiClient from "@/lib/api/client";
import { API_ENDPOINTS } from "@/lib/api/endpoints";

/* ============================================
   REQUEST TYPES
============================================ */

/** CREATE HALL (theo Swagger POST /api/Halls) */
export interface CreateVenueRequest {
  name: string;
  location: string;
  capacity: number;
  maxRows: number;
  maxSeatsPerRow: number;
  description: string;
  facilities: string;
}

/** UPDATE HALL (cho phép update từng phần) */
export interface UpdateVenueRequest {
  name?: string;
  location?: string;
  capacity?: number;
  maxRows?: number;
  maxSeatsPerRow?: number;
  description?: string;
  facilities?: string;
}
export interface GenerateSeatsRequest {
  rows: number;
  seatsPerRow: number;
}
/* ============================================
   RESPONSE DTO
============================================ */

export interface VenueDto {
  hallId: string;
  name: string;
  capacity: number;
  location?: string;
  description?: string;
  status?: string;

  maxRows?: number;
  maxSeatsPerRow?: number;
  totalSeats?: number;

  facilities?: string;

  createdAt?: string;
  updatedAt?: string | null;
  
}
interface Seat {
  seatId: string;
  label: string;
  status: string;
}

interface SeatRow {
  rowLabel: string;
  seats: Seat[];
}
/* ============================================
   VENUE SERVICE
============================================ */

export const venueService = {
  /* ---------------------- GET ALL ---------------------- */
  async getAll() {
    const res = await apiClient.get<{
      success: boolean;
      data: VenueDto[];
    }>(API_ENDPOINTS.VENUES.BASE);

    return res.data;
  },

  /* ---------------------- GET BY ID ---------------------- */
  async getById(id: string) {
    const res = await apiClient.get<{
      success: boolean;
      data: VenueDto;
    }>(API_ENDPOINTS.VENUES.BY_ID(id));

    return res.data;
  },
  async getSeatMap(hallId: string) {
    const res = await apiClient.get<{
      success: boolean;
      data: {
        hallId: string;
        hallName: string;
        rows: {
          rowLabel: string;
          seats: {
            seatId: string;
            label: string;
            status: string;
          }[];
        }[];
      };
    }>(`/api/Seats/halls/${hallId}/seat-map`);

    return res.data;
  },
  /* ---------------------- CREATE ---------------------- */
  async create(payload: CreateVenueRequest) {
    const res = await apiClient.post<{
      success: boolean;
      data: VenueDto;
    }>(API_ENDPOINTS.VENUES.CREATE, payload);

    return res.data;
  },

  /* ---------------------- UPDATE ---------------------- */
  async update(id: string, payload: UpdateVenueRequest) {
    const res = await apiClient.put<{
      success: boolean;
      data: VenueDto;
    }>(API_ENDPOINTS.VENUES.UPDATE(id), payload);

    return res.data;
  },

  /* ---------------------- DELETE ---------------------- */
  async delete(id: string) {
    const res = await apiClient.delete<{
      success: boolean;
    }>(API_ENDPOINTS.VENUES.DELETE(id));

    return res.data;
  },

  /* ---------------------- GET SEATS ---------------------- */
  async getSeats(id: string) {
    const res = await apiClient.get<{
      success: boolean;
      data: Array<{
        seatId: string;
        label: string;
        status: string;
        rowLabel?: string;
        section?: string;
      }>;
    }>(API_ENDPOINTS.VENUES.SEATS(id));

    return res.data;
  },
  /* ---------------------- GENERATE SEATS ---------------------- */
  async generateSeats(
    id: string,
    payload: {
      rows: number;
      seatsPerRow: number;
    }
  ) {
    const res = await apiClient.post<{
      success: boolean;
    }>(API_ENDPOINTS.VENUES.GENERATE_SEATS(id), payload);

    return res.data;
  },

  /* ---------------------- AVAILABILITY ---------------------- */
  async getAvailability(id: string) {
    const res = await apiClient.get<{
      success: boolean;
      data: {
        hallId: string;
        availableDates?: string[];
        bookedDates?: string[];
        conflicts?: Array<{
          eventId: string;
          eventName: string;
          date: string;
        }>;
      };
    }>(API_ENDPOINTS.VENUES.AVAILABILITY(id));

    return res.data;
  },
};

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
      data: any[];
    }>(API_ENDPOINTS.VENUES.SEATS(id));

    return res.data;
  },

  /* ---------------------- GENERATE SEATS ---------------------- */
  async generateSeats(id: string) {
    const res = await apiClient.post<{
      success: boolean;
    }>(API_ENDPOINTS.VENUES.GENERATE_SEATS(id));

    return res.data;
  },

  /* ---------------------- AVAILABILITY ---------------------- */
  async getAvailability(id: string) {
    const res = await apiClient.get<{
      success: boolean;
      data: any;
    }>(API_ENDPOINTS.VENUES.AVAILABILITY(id));

    return res.data;
  },
};

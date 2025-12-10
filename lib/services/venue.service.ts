import apiClient from "@/lib/api/client";
import { API_ENDPOINTS } from "@/lib/api/endpoints";

export interface VenueRequest {
  name: string;
  capacity?: number;
  location?: string;
  description?: string;
}

export interface VenueDto {
  hallId: string;
  name: string;
  capacity: number;
  location?: string;
  description?: string;
  status?: string; // <-- thêm
  totalSeats?: number;
  createdAt?: string;
  updatedAt?: string | null;
  facilities?: string;
}

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
  async create(payload: VenueRequest) {
    const res = await apiClient.post(API_ENDPOINTS.VENUES.CREATE, payload);
    return res.data;
  },

  /* ---------------------- UPDATE ---------------------- */
  async update(id: string, payload: VenueRequest) {
    const res = await apiClient.put(API_ENDPOINTS.VENUES.UPDATE(id), payload);
    return res.data;
  },

  /* ---------------------- DELETE ---------------------- */
  async delete(id: string) {
    const res = await apiClient.delete(API_ENDPOINTS.VENUES.DELETE(id));
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
    const res = await apiClient.post(API_ENDPOINTS.VENUES.GENERATE_SEATS(id));
    return res.data;
  },

  /* ---------------------- AVAILABILITY ---------------------- */
  async getAvailability(id: string) {
    const res = await apiClient.get(API_ENDPOINTS.VENUES.AVAILABILITY(id));
    return res.data;
  },
};

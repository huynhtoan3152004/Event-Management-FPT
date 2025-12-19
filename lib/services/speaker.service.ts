/* ============================================
   Speaker Service
   CRUD Speakers theo API backend
============================================ */

import apiClient from "@/lib/api/client";
import { API_ENDPOINTS } from "@/lib/api/endpoints";

export interface SpeakerRequest {
  name: string;
  title?: string;
  company?: string;
  bio?: string;
  email?: string;
  phone?: string | null; // ✅ FIX: accept null
  linkedIn?: string;
  imageFile?: File | null; // AvatarFile
}

export interface SpeakerDto {
  speakerId: string;
  name: string;
  title?: string;
  company?: string;
  bio?: string;
  email?: string;
  phone?: string | null;
  linkedinUrl?: string;
  avatarUrl?: string;
  createdAt?: string;
  updatedAt?: string | null;
}

export const speakerService = {
  /* ---------------------- GET ALL ---------------------- */
  async getAll() {
    const res = await apiClient.get<{
      success: boolean;
      data: SpeakerDto[];
      pagination?: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
      };
    }>(API_ENDPOINTS.SPEAKERS.BASE);

    return res.data;
  },

  /* ---------------------- GET BY ID ---------------------- */
  async getById(id: string) {
    const res = await apiClient.get<{ success: boolean; data: SpeakerDto }>(
      API_ENDPOINTS.SPEAKERS.BY_ID(id)
    );
    return res.data;
  },

  /* ---------------------- CREATE ---------------------- */
  async create(payload: SpeakerRequest) {
    const form = new FormData();

    form.append("Name", payload.name);
    if (payload.title) form.append("Title", payload.title);
    if (payload.company) form.append("Company", payload.company);
    if (payload.bio) form.append("Bio", payload.bio);
    if (payload.email) form.append("Email", payload.email);

    // ✅ FIX: ensure Phone never sends undefined
    form.append("Phone", payload.phone ?? "");

    if (payload.linkedIn) form.append("LinkedinUrl", payload.linkedIn);

    // Avatar
    if (payload.imageFile instanceof File) {
      form.append("AvatarFile", payload.imageFile);
    }

    const res = await apiClient.post(API_ENDPOINTS.SPEAKERS.CREATE, form);
    return res.data;
  },

  /* ---------------------- UPDATE ---------------------- */
  async update(id: string, payload: SpeakerRequest) {
    const form = new FormData();

    form.append("Name", payload.name);
    if (payload.title) form.append("Title", payload.title);
    if (payload.company) form.append("Company", payload.company);
    if (payload.bio) form.append("Bio", payload.bio);
    if (payload.email) form.append("Email", payload.email);

    // ✅ FIX: always append phone safely
    form.append("Phone", payload.phone ?? "");

    if (payload.linkedIn) form.append("LinkedinUrl", payload.linkedIn);

    // Avatar update
    if (payload.imageFile instanceof File) {
      form.append("AvatarFile", payload.imageFile);
    }

    const res = await apiClient.put(API_ENDPOINTS.SPEAKERS.UPDATE(id), form);
    return res.data;
  },

  /* ---------------------- DELETE ---------------------- */
  async delete(id: string) {
    const res = await apiClient.delete(API_ENDPOINTS.SPEAKERS.DELETE(id));
    return res.data;
  },

  /* ---------------------- GET SPEAKER EVENTS ---------------------- */
  async getEvents(id: string) {
    const res = await apiClient.get<{ 
      success: boolean; 
      data: Array<{
        eventId: string;
        title: string;
        date: string;
        location?: string;
      }> 
    }>(
      API_ENDPOINTS.SPEAKERS.EVENTS(id)
    );
    return res.data;
  },
};

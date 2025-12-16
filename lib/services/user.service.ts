import apiClient from "@/lib/api/client";

/* =========================
   Types
========================= */
export interface StudentProfile {
  userId: string;
  roleId: string;
  roleName: string;

  name: string;
  email: string;
  phone?: string;
  avatarUrl?: string | null;

  status: string;
  studentCode?: string | null;
  organization?: string | null;
  department?: string | null;
  emailVerified: boolean;

  lastLoginAt?: string;
  createdAt?: string;
  updatedAt?: string;
}

/* =========================
   API calls
========================= */
export const userService = {
  /* GET profile */
  getProfile() {
    return apiClient.get("/api/users/profile");
  },

  /* UPDATE profile */
  updateProfile(payload: {
    name: string;
    phone?: string;
    studentCode?: string | null;
  }) {
    return apiClient.put("/api/users/profile", payload);
  },
};

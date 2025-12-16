import apiClient from "@/lib/api/client";

/* =========================
   Types
========================= */
export interface AdminUser {
  userId: string;
  name: string;
  email: string;
  phone?: string | null;
  roleId: string;
  roleName: string;
  status: string;
  isDeleted: boolean;
  createdAt: string;
}

export interface AdminUserListResponse {
  data: AdminUser[];
  pagination: {
    currentPage: number;
    pageSize: number;
    totalItems: number;
    totalPages: number;
    hasPrevious: boolean;
    hasNext: boolean;
  };
}

/* =========================
   API calls
========================= */
export const adminUserService = {
  /* GET users by role */
  getUsersByRole(params: { role: string; page?: number; pageSize?: number }) {
    return apiClient.get<AdminUserListResponse>("/api/admin/users", {
      params,
    });
  },

  /* CREATE user by role */
  createUser(formData: FormData) {
  return apiClient.post(
    "/api/admin/users/create-user",
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );
},
  updateUserRole(userId: string, roleId: string) {
    return apiClient.patch(`/api/admin/users/${userId}/role`, {
      roleId,
    });
  },
};

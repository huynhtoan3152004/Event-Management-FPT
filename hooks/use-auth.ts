/* ============================================
   Auth Hooks
   React hooks cho authentication
   ============================================ */

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { authService } from "@/lib/services/auth.service";
import type { LoginRequest, RegisterRequest } from "@/lib/api/types";

/**
 * Hook để đăng nhập + hỗ trợ redirect sau login
 */
export function useLogin() {
  const router = useRouter();
  const queryClient = useQueryClient();

  return useMutation({
    // ⚠️ Không gửi redirectUrl lên API
    mutationFn: (data: any) => {
      const { redirectUrl, ...loginData } = data;
      return authService.login(loginData);
    },

    // onSuccess nhận được biến variables (chứa redirectUrl)
    onSuccess: (data, variables) => {
      const redirectUrl = variables?.redirectUrl || null;

      // Lưu token + thông tin user
      authService.saveAuthData(data);

      queryClient.invalidateQueries({ queryKey: ["user"] });

      toast.success("Đăng nhập thành công!", {
        position: "top-right",
        autoClose: 2000,
      });

      // Nếu có redirectUrl từ event → quay lại đúng sự kiện
      if (redirectUrl) {
        router.push(redirectUrl);
        return;
      }

      // Nếu không có redirectUrl → dùng logic theo role
      const roleId = data.roleId?.toLowerCase();
      switch (roleId) {
        case "student":
          router.push("/dashboard");
          break;
        case "organizer":
          router.push("/organizer");
          break;
        case "staff":
          router.push("/staff");
          break;
        default:
          router.push("/dashboard");
      }
    },

    onError: (error: any) => {
      const errorMessage =
        error.response?.data?.message ||
        error.response?.data?.error ||
        "Đăng nhập thất bại. Vui lòng kiểm tra lại email và mật khẩu.";

      toast.error(errorMessage, {
        position: "top-right",
        autoClose: 4000,
      });
    },
  });
}

/**
 * Hook để đăng ký
 */
export function useRegister() {
  const router = useRouter();

  return useMutation({
    mutationFn: (data: RegisterRequest) => authService.register(data),
    onSuccess: (data) => {
      const message = data.message || "Đăng ký thành công! Vui lòng đăng nhập.";
      toast.success(message, { autoClose: 3000 });

      setTimeout(() => router.push("/login"), 2000);
    },
    onError: (error: any) => {
      if (Array.isArray(error.response?.data?.errors)) {
        error.response.data.errors.forEach((msg: string) =>
          toast.error(msg, { autoClose: 4000 })
        );
      } else {
        toast.error(
          error.response?.data?.message ||
            "Đăng ký thất bại. Vui lòng thử lại.",
          { autoClose: 4000 }
        );
      }
    },
  });
}

/**
 * Hook lấy thông tin user hiện tại
 */
export function useCurrentUser() {
  return useQuery({
    queryKey: ["user", "current"],
    queryFn: () => authService.getCurrentUser(),
    enabled: authService.isAuthenticated(),
    retry: false,
  });
}

/**
 * Hook logout
 */
export function useLogout() {
  const router = useRouter();
  const queryClient = useQueryClient();

  return {
    logout: () => {
      authService.logout();
      queryClient.clear();

      toast.success("Đăng xuất thành công!", { autoClose: 2000 });
      router.push("/login");
    },
  };
}

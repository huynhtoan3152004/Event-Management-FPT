# 📚 TÀI LIỆU LUỒNG CODE - CODE FLOW DOCUMENTATION

## 🎯 MỤC ĐÍCH
Tài liệu này giải thích chi tiết luồng code trong dự án, cách API được gọi, và cách các file tương tác với nhau.

---

## 🔄 LUỒNG TỔNG QUAN

```
USER ACTION (Click, Submit Form)
    ↓
COMPONENT (React Component)
    ↓
HOOK (Custom Hook - useLogin, useQuery, etc.)
    ↓
SERVICE (Business Logic - authService, eventService)
    ↓
API CLIENT (apiClient - Axios instance)
    ↓
REQUEST INTERCEPTOR (Thêm token)
    ↓
BACKEND API (ASP.NET Core)
    ↓
RESPONSE INTERCEPTOR (Xử lý error)
    ↓
SERVICE (Trả về data)
    ↓
HOOK (Update React Query cache)
    ↓
COMPONENT (Re-render với data mới)
```

---

## 📁 CẤU TRÚC FILE VÀ VAI TRÒ

### 1. **lib/api/client.ts** - API CLIENT CORE
**Vai trò**: Trung tâm xử lý tất cả API calls

**Chức năng**:
- Tạo Axios instance với config (baseURL, timeout, headers)
- Request Interceptor: Tự động thêm JWT token vào mọi request
- Response Interceptor: Xử lý errors tự động (401, 403, 500, etc.)

**Luồng hoạt động**:
```
Service gọi: apiClient.post('/api/Events', data)
    ↓
Request Interceptor chạy:
  - Lấy token từ localStorage
  - Thêm vào header: Authorization: Bearer {token}
    ↓
Gửi request đến backend
    ↓
Response Interceptor chạy:
  - Nếu success: Return response
  - Nếu error: Gọi handleHttpError() → Show toast → Reject error
```

**Được import bởi**: Tất cả services trong `lib/services/*`

---

### 2. **lib/api/endpoints.ts** - API ENDPOINTS CONSTANTS
**Vai trò**: Tập trung tất cả API URLs

**Chức năng**:
- Định nghĩa tất cả endpoints trong 1 object
- Dễ thay đổi khi API thay đổi
- Type-safe với TypeScript

**Cấu trúc**:
```typescript
API_ENDPOINTS = {
  AUTH: { LOGIN: "/api/Auth/login", ... },
  EVENTS: { BASE: "/api/Events", BY_ID: (id) => `/api/Events/${id}`, ... },
  ...
}
```

**Được import bởi**: Tất cả services

---

### 3. **lib/services/*.service.ts** - BUSINESS LOGIC LAYER
**Vai trò**: Tách biệt business logic khỏi UI

**Chức năng**:
- Chứa methods để gọi API
- Transform data nếu cần
- Xử lý FormData cho upload

**Ví dụ: auth.service.ts**
```typescript
export const authService = {
  async login(data: LoginRequest) {
    // Gọi API qua apiClient
    const response = await apiClient.post(API_ENDPOINTS.AUTH.LOGIN, data)
    return response.data
  }
}
```

**Luồng**:
```
Component/Hook gọi: authService.login({ email, password })
    ↓
Service gọi: apiClient.post('/api/Auth/login', data)
    ↓
apiClient thêm token (nếu có) → Gửi request
    ↓
Backend xử lý → Trả về response
    ↓
Service trả về: response.data
```

**Được import bởi**: Hooks, Components

---

### 4. **hooks/use-auth.ts** - AUTHENTICATION HOOKS
**Vai trò**: React hooks để dùng trong components

**Chức năng**:
- Wrap service calls với React Query
- Xử lý success/error
- Update UI (toast, redirect)

**Ví dụ: useLogin()**
```typescript
export function useLogin() {
  return useMutation({
    mutationFn: (data) => authService.login(data),
    onSuccess: (data) => {
      // Lưu token
      authService.saveAuthData(data)
      // Show toast
      toast.success("Đăng nhập thành công!")
      // Redirect
      router.push("/dashboard")
    }
  })
}
```

**Luồng**:
```
Component: const { mutate: login } = useLogin()
User submit form → login({ email, password })
    ↓
mutationFn chạy → authService.login()
    ↓
Service gọi API → Nhận response
    ↓
onSuccess chạy:
  - Lưu token vào localStorage
  - Update React Query cache
  - Show toast
  - Redirect
```

**Được import bởi**: Components (login page, etc.)

---

### 5. **components/shared/role-guard.tsx** - ROUTE PROTECTION
**Vai trò**: Bảo vệ routes theo role

**Chức năng**:
- Check authentication
- Check authorization (role)
- Redirect nếu không có quyền

**Luồng**:
```
Component mount
    ↓
useEffect chạy:
  1. useUser() lấy user từ localStorage/API
  2. Check isAuthenticated
  3. Check user.roleId có trong allowedRoles không
  4. Nếu không có quyền → Redirect
    ↓
Render children nếu có quyền
```

**Được dùng trong**: Layouts (dashboard/layout.tsx, organizer/layout.tsx)

---

### 6. **app/dashboard/events/page.tsx** - EXAMPLE PAGE
**Vai trò**: Component hiển thị danh sách events

**Luồng hoàn chỉnh**:
```
1. Component mount
    ↓
2. useEffect chạy → fetchEvents()
    ↓
3. eventService.getAllEvents({ pageNumber: 1, pageSize: 50 })
    ↓
4. eventService gọi: apiClient.get('/api/Events?pageNumber=1&pageSize=50')
    ↓
5. apiClient Request Interceptor:
   - Lấy token từ localStorage
   - Thêm vào header: Authorization: Bearer {token}
    ↓
6. Gửi GET request đến backend
    ↓
7. Backend xử lý:
   - Verify JWT token
   - Query database
   - Trả về danh sách events
    ↓
8. apiClient Response Interceptor:
   - Nếu success: Return response
   - Nếu error: handleHttpError() → Show toast
    ↓
9. eventService trả về: PagedResponse<EventListItem>
    ↓
10. Component nhận data:
    - Filter theo activeTab
    - setEvents(filteredData)
    ↓
11. Component re-render với events mới
```

---

## 🔐 AUTHENTICATION FLOW CHI TIẾT

### Login Flow
```
1. User nhập email/password → Submit form
    ↓
2. Component: login({ email, password })
    ↓
3. useLogin() hook:
   mutationFn → authService.login({ email, password })
    ↓
4. authService.login():
   apiClient.post('/api/Auth/login', { email, password })
    ↓
5. apiClient Request Interceptor:
   - Không có token (login không cần token)
   - Gửi request
    ↓
6. Backend verify credentials → Trả về JWT token
    ↓
7. apiClient Response Interceptor:
   - Success → Return response
    ↓
8. authService.login() trả về: { accessToken, userId, email, ... }
    ↓
9. useLogin() onSuccess:
   - authService.saveAuthData() → Lưu token vào localStorage
   - queryClient.setQueryData() → Update React Query cache
   - toast.success() → Show notification
   - window.location.href = '/dashboard' → Redirect
```

### Protected Route Flow
```
1. User truy cập /dashboard/events
    ↓
2. Next.js load layout: app/dashboard/layout.tsx
    ↓
3. Layout wrap với <RoleGuard allowedRoles={['student']}>
    ↓
4. RoleGuard mount:
   - useUser() → Lấy user từ localStorage hoặc API
   - useEffect chạy:
     a. Check isAuthenticated
     b. Check user.roleId === 'student'
     c. Nếu không match → Redirect
    ↓
5. Nếu có quyền → Render children (page.tsx)
    ↓
6. Page component mount → Fetch data → Render UI
```

### API Call với Token Flow
```
1. Component gọi: eventService.getAllEvents()
    ↓
2. eventService gọi: apiClient.get('/api/Events')
    ↓
3. apiClient Request Interceptor:
   - localStorage.getItem('token') → Lấy token
   - config.headers.Authorization = `Bearer ${token}`
    ↓
4. Gửi request với header:
   GET /api/Events
   Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
    ↓
5. Backend:
   - Verify JWT token
   - Extract user info từ token
   - Query database với user context
   - Trả về data
    ↓
6. apiClient Response Interceptor:
   - Success → Return response
   - Error (401) → handleHttpError() → Logout → Redirect /login
```

---

## 📊 DATA FLOW DIAGRAM

### Fetch Events Flow
```
┌─────────────┐
│  Component  │
│  (Page.tsx) │
└──────┬──────┘
       │ 1. useEffect() → fetchEvents()
       ↓
┌─────────────┐
│   Service   │
│eventService │
│.getAllEvents│
└──────┬──────┘
       │ 2. apiClient.get('/api/Events')
       ↓
┌─────────────┐
│ API Client  │
│ (client.ts) │
└──────┬──────┘
       │ 3. Request Interceptor
       │    - Add token to header
       ↓
┌─────────────┐
│   Backend   │
│  (ASP.NET)  │
└──────┬──────┘
       │ 4. Process request
       │    - Verify token
       │    - Query database
       │    - Return data
       ↓
┌─────────────┐
│ API Client  │
│ (client.ts) │
└──────┬──────┘
       │ 5. Response Interceptor
       │    - Handle errors
       ↓
┌─────────────┐
│   Service   │
│eventService │
└──────┬──────┘
       │ 6. Return response.data
       ↓
┌─────────────┐
│  Component  │
│  (Page.tsx) │
│  - setEvents│
│  - Re-render│
└─────────────┘
```

---

## 🎯 KEY POINTS

### 1. API Calls luôn đi qua apiClient
- Không gọi axios trực tiếp
- Tất cả requests tự động có token
- Tất cả errors được xử lý tự động

### 2. Services tách biệt logic
- Components không biết API details
- Dễ test và maintain
- Reusable

### 3. Hooks wrap services
- Xử lý React Query
- Update UI tự động
- Error handling

### 4. RoleGuard bảo vệ routes
- Check authentication
- Check authorization
- Auto redirect

### 5. Interceptors xử lý tự động
- Request: Thêm token
- Response: Xử lý errors
- Không cần code lặp lại

---

## 📝 NOTES

- **Token Storage**: localStorage (có thể đổi sang httpOnly cookies cho security tốt hơn)
- **Error Handling**: Centralized trong error-handler.ts
- **Type Safety**: TypeScript cho tất cả API calls
- **Caching**: React Query tự động cache responses

---

*Tài liệu này giải thích chi tiết luồng code. Đọc kèm với comments trong source code để hiểu rõ hơn.*


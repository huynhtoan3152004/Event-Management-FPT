# 📊 PHÂN TÍCH DỰ ÁN - FPTU EVENT HUB

## 🎯 TỔNG QUAN DỰ ÁN

### Mục đích
Hệ thống quản lý sự kiện cho FPT University, cho phép:
- **Sinh viên**: Tìm kiếm, đăng ký, quản lý vé sự kiện
- **Organizer**: Tạo, quản lý sự kiện, xem báo cáo
- **Staff**: Check-in/check-out, theo dõi thời gian thực

### Phạm vi
- Frontend: Next.js 16 + React 19 + TypeScript
- Backend: ASP.NET Core (C#)
- Database: SQL Server
- Authentication: JWT Token

---

## 🏗️ KIẾN TRÚC HỆ THỐNG

### 1. **Kiến trúc Frontend: Next.js App Router**

```
app/
├── (public)/          # Public routes (không cần auth)
│   ├── events/        # Danh sách sự kiện công khai
│   └── about/         # Giới thiệu
├── dashboard/         # Student dashboard
├── organizer/         # Organizer dashboard
├── staff/            # Staff dashboard
└── login/register/   # Authentication pages
```

**Ưu điểm:**
- ✅ File-based routing (tự động)
- ✅ Server Components & Client Components
- ✅ Layout nesting (shared layouts)
- ✅ Loading states (loading.tsx)
- ✅ Error boundaries

### 2. **Cấu trúc Thư mục (Clean Architecture)**

```
lib/
├── api/              # API layer
│   ├── client.ts     # Axios instance + interceptors
│   ├── endpoints.ts  # API endpoints constants
│   ├── types.ts      # API types
│   └── error-handler.ts # Error handling utilities
├── services/         # Business logic layer
│   ├── auth.service.ts
│   ├── event.service.ts
│   ├── ticket.service.ts
│   └── index.ts      # Centralized exports
├── utils/            # Utility functions
└── constants.ts      # Constants & mock data

components/
├── ui/               # Reusable UI components (shadcn/ui)
├── shared/           # Shared components (Header, Footer, RoleGuard)
├── dashboard/        # Dashboard-specific components
├── organizer/        # Organizer-specific components
└── staff/           # Staff-specific components

hooks/                # Custom React hooks
types/                # TypeScript type definitions
```

**Design Pattern: Layered Architecture**
- **Presentation Layer**: Components, Pages
- **Business Logic Layer**: Services
- **Data Access Layer**: API Client
- **Infrastructure Layer**: Utils, Constants

---

## 🛠️ CÔNG NGHỆ & THƯ VIỆN

### Core Framework
- **Next.js 16.0.3**: React framework với SSR, SSG, ISR
- **React 19.2.0**: UI library
- **TypeScript 5**: Type safety

### State Management
- **TanStack Query (React Query) v5**: Server state management
  - Caching, refetching, optimistic updates
  - DevTools cho debugging
- **React Hooks**: Local state (useState, useCallback, useEffect)

### UI Framework
- **Tailwind CSS 4.1.9**: Utility-first CSS
- **shadcn/ui**: Component library (Radix UI + Tailwind)
- **Radix UI**: Accessible component primitives
- **Lucide React**: Icon library

### Form Handling
- **React Hook Form 7.60.0**: Form state management
- **Zod 3.25.76**: Schema validation
- **@hookform/resolvers**: Integration RHF + Zod

### HTTP Client
- **Axios 1.13.2**: HTTP requests
  - Interceptors cho auth & error handling
  - Request/Response transformation

### Animation & UX
- **GSAP**: Advanced animations
- **Framer Motion**: (nếu có)
- **react-toastify**: Toast notifications
- **Sonner**: Toast notifications (alternative)

### Other Libraries
- **html5-qrcode**: QR code scanning
- **date-fns**: Date manipulation
- **recharts**: Data visualization
- **next-themes**: Dark mode support

---

## 🎨 DESIGN PATTERNS

### 1. **Service Pattern**
```typescript
// Tách biệt business logic khỏi components
export const eventService = {
  async getAllEvents(params?: EventFilterParams) {
    // API call logic
  },
  async getEventById(id: string) {
    // API call logic
  }
}
```

**Lợi ích:**
- ✅ Tái sử dụng logic
- ✅ Dễ test
- ✅ Dễ maintain

### 2. **Repository Pattern (API Layer)**
```typescript
// lib/api/endpoints.ts
export const API_ENDPOINTS = {
  EVENTS: {
    BASE: "/api/Events",
    BY_ID: (id: string) => `/api/Events/${id}`,
  }
}
```

### 3. **Custom Hooks Pattern**
```typescript
// hooks/use-auth.ts
export function useLogin() {
  return useMutation({
    mutationFn: authService.login,
    onSuccess: (data) => { /* ... */ }
  })
}
```

**Lợi ích:**
- ✅ Tái sử dụng logic
- ✅ Separation of concerns
- ✅ Dễ test

### 4. **Provider Pattern**
```typescript
// app/providers.tsx
export function Providers({ children }) {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  )
}
```

### 5. **Guard Pattern (Route Protection)**
```typescript
// components/shared/role-guard.tsx
export function RoleGuard({ children, allowedRoles }) {
  // Check authentication & authorization
  if (!hasAccess) return null
  return <>{children}</>
}
```

### 6. **Error Handling Pattern**
```typescript
// lib/api/error-handler.ts
export function handleHttpError(error: AxiosError) {
  switch (error.response?.status) {
    case 401: handleUnauthorized(); break
    case 403: toast.error('Không có quyền'); break
    // ...
  }
}
```

---

## 🔐 SECURITY & AUTHENTICATION

### Authentication Flow
1. **Login**: POST `/api/Auth/login`
   - Nhận `accessToken`, `expiresAt`, `userInfo`
   - Lưu vào `localStorage`
2. **Token Management**:
   - Axios interceptor tự động thêm `Authorization: Bearer {token}`
   - Check expiry (hiện tại tắt để demo)
3. **Logout**: Xóa token khỏi localStorage

### Authorization (Role-Based Access Control)
```typescript
// RoleGuard component
<RoleGuard allowedRoles={['organizer', 'staff']}>
  <ProtectedContent />
</RoleGuard>
```

**Roles:**
- `student`: Xem events, đăng ký vé
- `organizer`: Quản lý events, xem reports
- `staff`: Check-in/check-out, monitor events

### Protected Routes
- `/dashboard/*`: Student only
- `/organizer/*`: Organizer only
- `/staff/*`: Staff only

### Security Best Practices
- ✅ JWT token trong Authorization header
- ✅ Token không lưu trong cookies (localStorage)
- ✅ Role-based route protection
- ✅ API error handling (401 → logout)
- ✅ Input validation với Zod

---

## ⚡ PERFORMANCE OPTIMIZATION

### 1. **Next.js Optimizations**
- ✅ Server Components (giảm JS bundle)
- ✅ Code splitting tự động
- ✅ Image optimization (Next Image)
- ✅ Static generation cho public pages

### 2. **React Query Caching**
```typescript
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000, // 1 minute
      refetchOnWindowFocus: false,
      retry: 1,
    }
  }
})
```

**Lợi ích:**
- ✅ Giảm API calls
- ✅ Instant UI updates
- ✅ Background refetching

### 3. **Code Splitting**
- ✅ Dynamic imports cho heavy components
- ✅ Route-based code splitting (Next.js tự động)

### 4. **Memoization**
```typescript
const fetchData = useCallback(async () => {
  // ...
}, [eventId])
```

### 5. **Lazy Loading**
- ✅ Components load khi cần
- ✅ Images lazy loading

---

## 📱 CÁC TÍNH NĂNG CHÍNH

### 1. **Student Dashboard**
- ✅ Xem danh sách events
- ✅ Đăng ký event (chọn ghế)
- ✅ Quản lý vé (xem QR code, hủy vé)
- ✅ Xem lịch sử tham gia

### 2. **Organizer Dashboard**
- ✅ Tạo/Edit/Delete events
- ✅ Quản lý speakers
- ✅ Quản lý venues (halls)
- ✅ Quản lý seats
- ✅ Xem reports & statistics
- ✅ Publish events

### 3. **Staff Dashboard**
- ✅ QR code scanner (check-in/check-out)
- ✅ Real-time monitoring
- ✅ Seat map visualization
- ✅ Check-in records

### 4. **Public Pages**
- ✅ Landing page
- ✅ Events listing
- ✅ Event details

---

## 🧪 CODE QUALITY

### TypeScript
- ✅ Strict mode enabled
- ✅ Type safety cho API responses
- ✅ Interface definitions cho tất cả entities
- ✅ Generic types cho reusability

### Code Organization
- ✅ Separation of concerns
- ✅ DRY principle (Don't Repeat Yourself)
- ✅ Single Responsibility Principle
- ✅ Centralized exports

### Error Handling
- ✅ Try-catch blocks
- ✅ API error interceptors
- ✅ User-friendly error messages
- ✅ Toast notifications

### Code Style
- ✅ Consistent naming conventions
- ✅ Comments cho complex logic
- ✅ JSDoc cho functions
- ✅ Organized imports

---

## 📈 ĐIỂM MẠNH

1. **Kiến trúc rõ ràng**: Layered architecture, dễ maintain
2. **Type Safety**: TypeScript strict mode
3. **Modern Stack**: Next.js 16, React 19, latest libraries
4. **Performance**: React Query caching, code splitting
5. **UX**: Loading states, error handling, toast notifications
6. **Security**: JWT auth, role-based access control
7. **Scalability**: Modular structure, easy to extend
8. **Code Quality**: Clean code, refactored, no duplicates

---

## ⚠️ ĐIỂM CẦN CẢI THIỆN

1. **Testing**: Chưa có unit tests, integration tests
2. **Error Logging**: Chưa có error tracking (Sentry, etc.)
3. **Documentation**: Cần thêm API documentation
4. **Accessibility**: Cần audit a11y
5. **Performance Monitoring**: Chưa có analytics
6. **CI/CD**: Chưa có automated deployment

---

## ❓ CÂU HỎI THƯỜNG GẶP & CÂU TRẢ LỜI

### Q1: Tại sao chọn Next.js thay vì React thuần?
**A:** 
- SSR/SSG cho SEO tốt hơn
- File-based routing tự động
- Built-in optimizations (images, fonts)
- Production-ready out of the box

### Q2: Tại sao dùng React Query thay vì Redux?
**A:**
- React Query chuyên cho server state (API calls)
- Tự động caching, refetching
- Ít boilerplate code hơn Redux
- Local state vẫn dùng useState/useReducer

### Q3: Xử lý authentication như thế nào?
**A:**
- JWT token lưu trong localStorage
- Axios interceptor tự động thêm token vào header
- RoleGuard component bảo vệ routes
- Auto logout khi token hết hạn (401)

### Q4: Làm sao đảm bảo type safety?
**A:**
- TypeScript strict mode
- Interface definitions cho tất cả entities
- Generic types cho API responses
- Zod validation cho forms

### Q5: Xử lý lỗi như thế nào?
**A:**
- Axios interceptor xử lý HTTP errors
- Toast notifications cho user
- Error handler utilities (error-handler.ts)
- Try-catch trong services

### Q6: Performance optimization?
**A:**
- React Query caching (giảm API calls)
- Code splitting (Next.js tự động)
- Server Components (giảm JS bundle)
- Memoization với useCallback/useMemo
- Image optimization

### Q7: Security measures?
**A:**
- JWT token authentication
- Role-based access control
- Protected routes với RoleGuard
- Input validation với Zod
- XSS protection (React tự động escape)

### Q8: Kiến trúc code như thế nào?
**A:**
- **Layered Architecture**:
  - Presentation: Components, Pages
  - Business Logic: Services
  - Data Access: API Client
  - Infrastructure: Utils, Constants
- **Design Patterns**: Service, Repository, Provider, Guard

### Q9: Làm sao scale khi dự án lớn?
**A:**
- Modular structure (dễ thêm features)
- Centralized exports (dễ import)
- Reusable components
- Service layer (tách biệt logic)
- Type definitions (dễ maintain)

### Q10: Testing strategy?
**A:**
- **Hiện tại**: Manual testing
- **Nên có**: 
  - Unit tests (Jest, Vitest)
  - Integration tests (React Testing Library)
  - E2E tests (Playwright - đã có config)

---

## 📚 TÀI LIỆU THAM KHẢO

### Official Docs
- Next.js: https://nextjs.org/docs
- React: https://react.dev
- TanStack Query: https://tanstack.com/query
- TypeScript: https://www.typescriptlang.org/docs

### Best Practices
- React Best Practices: https://react.dev/learn
- Next.js Best Practices: https://nextjs.org/docs/app/building-your-application
- TypeScript Best Practices: https://typescript-handbook.gitbook.io

---

## 🎓 KẾT LUẬN

Dự án **FPTU Event Hub** được xây dựng với:
- ✅ **Modern Tech Stack**: Next.js 16, React 19, TypeScript
- ✅ **Clean Architecture**: Layered, modular, scalable
- ✅ **Best Practices**: Type safety, error handling, performance
- ✅ **Production Ready**: Security, optimization, UX

**Phù hợp cho**: Hệ thống quản lý sự kiện quy mô trung bình đến lớn, có thể mở rộng và maintain dễ dàng.

---

*Tài liệu này được tạo để hỗ trợ bảo vệ dự án trước hội đồng chấm điểm.*


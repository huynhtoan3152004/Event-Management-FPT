# 🎤 CHUẨN BỊ BẢO VỆ DỰ ÁN

## 📋 CHECKLIST TRƯỚC KHI BẢO VỆ

### 1. Hiểu rõ Codebase
- [ ] Đọc qua toàn bộ cấu trúc thư mục
- [ ] Hiểu flow authentication
- [ ] Hiểu cách API được gọi
- [ ] Hiểu state management
- [ ] Hiểu routing structure

### 2. Chuẩn bị Demo
- [ ] Test tất cả tính năng chính
- [ ] Chuẩn bị test cases
- [ ] Chuẩn bị data mẫu
- [ ] Test trên trình duyệt khác nhau
- [ ] Test responsive design

### 3. Chuẩn bị Presentation
- [ ] Slide tổng quan dự án
- [ ] Architecture diagram
- [ ] Database schema (nếu có)
- [ ] Flow diagrams (auth, check-in, etc.)
- [ ] Screenshots/GIFs demo

### 4. Kiến thức Kỹ thuật
- [ ] Next.js concepts (SSR, SSG, ISR)
- [ ] React concepts (Hooks, Context, etc.)
- [ ] TypeScript basics
- [ ] HTTP/REST API
- [ ] JWT authentication

---

## 💬 CÂU HỎI CHI TIẾT & CÁCH TRẢ LỜI

### PHẦN 1: TỔNG QUAN DỰ ÁN

#### Q: Dự án này giải quyết vấn đề gì?
**Trả lời:**
> "Dự án FPTU Event Hub giải quyết vấn đề quản lý sự kiện tại FPT University. Hiện tại việc quản lý sự kiện còn thủ công, khó theo dõi số lượng đăng ký, check-in. Hệ thống của em cho phép:
> - Sinh viên dễ dàng tìm và đăng ký sự kiện
> - Organizer quản lý sự kiện, xem báo cáo
> - Staff check-in nhanh bằng QR code
> - Theo dõi real-time số lượng check-in"

#### Q: Tại sao chọn Next.js thay vì React thuần?
**Trả lời:**
> "Em chọn Next.js vì:
> 1. **SEO tốt hơn**: SSR/SSG giúp search engines index tốt hơn
> 2. **Performance**: Built-in optimizations (images, fonts, code splitting)
> 3. **Developer Experience**: File-based routing, API routes
> 4. **Production Ready**: Có sẵn nhiều features cần thiết
> 5. **Community**: Large community, nhiều resources"

#### Q: Có bao nhiêu role trong hệ thống?
**Trả lời:**
> "Hệ thống có 3 roles chính:
> 1. **Student**: Xem events, đăng ký vé, quản lý tickets
> 2. **Organizer**: Tạo/quản lý events, speakers, venues, xem reports
> 3. **Staff**: Check-in/check-out, monitor events real-time
> 
> Mỗi role có dashboard riêng và được bảo vệ bởi RoleGuard component."

---

### PHẦN 2: KIẾN TRÚC & DESIGN

#### Q: Kiến trúc của dự án như thế nào?
**Trả lời:**
> "Em sử dụng **Layered Architecture**:
> 
> **1. Presentation Layer** (Components, Pages)
> - UI components (shadcn/ui)
> - Page components (Next.js App Router)
> - Layout components
> 
> **2. Business Logic Layer** (Services)
> - `auth.service.ts`: Authentication logic
> - `event.service.ts`: Event management
> - `ticket.service.ts`: Ticket operations
> - Tách biệt logic khỏi UI
> 
> **3. Data Access Layer** (API Client)
> - `lib/api/client.ts`: Axios instance với interceptors
> - `lib/api/endpoints.ts`: API endpoints constants
> - `lib/api/error-handler.ts`: Error handling
> 
> **4. Infrastructure Layer**
> - Utils, Constants, Types
> 
> **Lợi ích**: Dễ maintain, test, scale"

#### Q: Design Patterns nào được sử dụng?
**Trả lời:**
> "Em sử dụng các patterns sau:
> 
> **1. Service Pattern**
> - Tách business logic vào services
> - Components chỉ gọi services
> 
> **2. Repository Pattern**
> - API endpoints tập trung trong `endpoints.ts`
> - Dễ thay đổi API URL
> 
> **3. Provider Pattern**
> - React Query Provider
> - Theme Provider
> 
> **4. Guard Pattern**
> - RoleGuard bảo vệ routes
> - Check authentication & authorization
> 
> **5. Custom Hooks Pattern**
> - `useAuth`, `useUser`, `useLogin`
> - Tái sử dụng logic
> 
> **6. Error Handling Pattern**
> - Centralized error handler
> - Consistent error messages"

#### Q: Tại sao tách services ra khỏi components?
**Trả lời:**
> "Tách services ra vì:
> 1. **Separation of Concerns**: UI không cần biết API details
> 2. **Reusability**: Dùng lại logic ở nhiều components
> 3. **Testability**: Dễ test business logic riêng
> 4. **Maintainability**: Sửa API logic ở 1 nơi
> 5. **Scalability**: Dễ thêm features mới"

---

### PHẦN 3: AUTHENTICATION & SECURITY

#### Q: Authentication flow như thế nào?
**Trả lời:**
> "Flow authentication:
> 
> **1. Login**
> - User nhập email/password
> - POST `/api/Auth/login`
> - Nhận `accessToken`, `expiresAt`, `userInfo`
> - Lưu vào `localStorage`
> 
> **2. Token Management**
> - Axios interceptor tự động thêm `Authorization: Bearer {token}` vào mọi request
> - Check token expiry (hiện tắt để demo)
> 
> **3. Protected Routes**
> - RoleGuard component check authentication
> - Redirect nếu chưa login
> - Check role có quyền truy cập
> 
> **4. Logout**
> - Xóa token khỏi localStorage
> - Clear React Query cache
> - Redirect về login"

#### Q: Tại sao lưu token trong localStorage thay vì cookies?
**Trả lời:**
> "Em chọn localStorage vì:
> 1. **Đơn giản**: Không cần setup cookies
> 2. **Client-side only**: Token không gửi tự động (an toàn hơn với XSS)
> 3. **Control**: Tự control khi nào gửi token
> 
> **Nhược điểm**: Dễ bị XSS attack
> **Giải pháp**: 
> - Sanitize user input
> - React tự escape HTML
> - HTTPS để bảo vệ
> 
> **Production**: Nên dùng httpOnly cookies cho security tốt hơn"

#### Q: Xử lý 401 (Unauthorized) như thế nào?
**Trả lời:**
> "Khi API trả về 401:
> 1. **Axios interceptor** catch error
> 2. **Check route**: Chỉ logout nếu ở protected routes
> 3. **Clear auth data**: Xóa token, user info
> 4. **Show toast**: Thông báo 'Phiên đăng nhập hết hạn'
> 5. **Redirect**: Về `/login`
> 
> Code trong `lib/api/error-handler.ts`"

#### Q: Role-based access control hoạt động như thế nào?
**Trả lời:**
> "RBAC được implement qua:
> 
> **1. RoleGuard Component**
> - Check `isAuthenticated`
> - Check `user.roleId` có trong `allowedRoles`
> - Redirect nếu không có quyền
> 
> **2. Layout Protection**
> - Mỗi layout (dashboard, organizer, staff) wrap với RoleGuard
> - Chỉ role phù hợp mới vào được
> 
> **3. API Level**
> - Backend cũng check role
> - Frontend chỉ là UI protection
> 
> **Ví dụ**:
> ```tsx
> <RoleGuard allowedRoles={['organizer']}>
>   <OrganizerContent />
> </RoleGuard>
> ```"

---

### PHẦN 4: STATE MANAGEMENT

#### Q: Tại sao dùng React Query thay vì Redux?
**Trả lời:**
> "Em chọn React Query vì:
> 
> **React Query**:
> - ✅ Chuyên cho **server state** (API calls)
> - ✅ Tự động caching, refetching
> - ✅ Optimistic updates
> - ✅ Ít boilerplate
> - ✅ DevTools
> 
> **Redux**:
> - ❌ Quá phức tạp cho use case này
> - ❌ Nhiều boilerplate code
> - ❌ Không có built-in caching
> 
> **Local state** vẫn dùng `useState`, `useReducer` cho UI state"

#### Q: React Query caching strategy?
**Trả lời:**
> "Caching config:
> ```typescript
> staleTime: 60 * 1000  // 1 phút
> refetchOnWindowFocus: false
> retry: 1
> ```
> 
> **Lợi ích**:
> - Giảm API calls
> - Instant UI updates
> - Background refetching
> - Optimistic updates"

---

### PHẦN 5: API & DATA FLOW

#### Q: Cấu trúc API layer như thế nào?
**Trả lời:**
> "API layer có 4 files:
> 
> **1. `client.ts`**: Axios instance
> - Base URL, timeout
> - Request interceptor: Thêm token
> - Response interceptor: Log, error handling
> 
> **2. `endpoints.ts`**: API endpoints constants
> - Tập trung tất cả endpoints
> - Dễ thay đổi URL
> 
> **3. `types.ts`**: API types
> - Request/Response types
> - DTOs
> 
> **4. `error-handler.ts`**: Error handling utilities
> - Handle HTTP errors
> - Show toast messages
> - Auto logout on 401"

#### Q: Xử lý lỗi API như thế nào?
**Trả lời:**
> "Error handling flow:
> 
> **1. Axios Interceptor**
> - Catch tất cả errors
> - Gọi `handleHttpError()`
> 
> **2. Error Handler** (`error-handler.ts`)
> - Switch case theo status code:
>   - 401: Logout
>   - 403: 'Không có quyền'
>   - 404: Không show toast (component tự xử lý)
>   - 422: Validation errors
>   - 500: Server error
> 
> **3. Toast Notification**
> - User-friendly messages
> - Auto close
> 
> **4. Component Level**
> - Try-catch trong services
> - Error states trong UI"

---

### PHẦN 6: PERFORMANCE

#### Q: Optimizations nào đã implement?
**Trả lời:**
> "Các optimizations:
> 
> **1. Next.js**
> - Server Components (giảm JS bundle)
> - Code splitting tự động
> - Image optimization
> 
> **2. React Query**
> - Caching (giảm API calls)
> - Background refetching
> 
> **3. React**
> - `useCallback` cho functions
> - `useMemo` cho computed values
> - Lazy loading components
> 
> **4. Code**
> - Centralized exports
> - Tree shaking friendly
> - Minimal dependencies"

#### Q: Làm sao giảm bundle size?
**Trả lời:**
> "Giảm bundle size:
> 1. **Server Components**: Không gửi JS cho static content
> 2. **Code Splitting**: Next.js tự động split theo routes
> 3. **Dynamic Imports**: Load components khi cần
> 4. **Tree Shaking**: Chỉ import cần thiết
> 5. **Minimal Dependencies**: Chỉ dùng thư viện cần thiết"

---

### PHẦN 7: CODE QUALITY

#### Q: TypeScript được sử dụng như thế nào?
**Trả lời:**
> "TypeScript usage:
> 
> **1. Strict Mode**: Enabled
> - Type safety cao
> - Catch errors sớm
> 
> **2. Type Definitions**
> - Interfaces cho entities (User, Event, Ticket)
> - API response types
> - Component props types
> 
> **3. Generic Types**
> - `ApiResponse<T>`
> - `PagedResponse<T>`
> 
> **4. Utility Types**
> - `Partial<T>`, `Pick<T>`, `Omit<T>`
> 
> **Lợi ích**: 
> - IntelliSense tốt
> - Refactor an toàn
> - Self-documenting code"

#### Q: Code organization principles?
**Trả lời:**
> "Principles:
> 
> **1. DRY (Don't Repeat Yourself)**
> - Centralized types, constants
> - Reusable components
> - Service layer
> 
> **2. SOLID**
> - Single Responsibility: Mỗi service/file 1 nhiệm vụ
> - Open/Closed: Dễ extend, khó modify
> 
> **3. Separation of Concerns**
> - UI vs Logic vs Data
> 
> **4. Clean Code**
> - Meaningful names
> - Comments cho complex logic
> - Consistent style"

---

### PHẦN 8: TÍNH NĂNG ĐẶC BIỆT

#### Q: QR Code scanning hoạt động như thế nào?
**Trả lời:**
> "QR Code flow:
> 
> **1. Library**: `html5-qrcode`
> - Access camera
> - Scan QR code
> 
> **2. Component**: `QRScanner`
> - Start/stop camera
> - Handle scan result
> 
> **3. Check-in Process**
> - Extract ticket code từ QR
> - Call API: `POST /api/tickets/{code}/checkin`
> - Show result (success/error)
> - Update UI real-time
> 
> **4. Error Handling**
> - Invalid ticket
> - Already checked in
> - Expired ticket"

#### Q: Real-time monitoring như thế nào?
**Trả lời:**
> "Real-time monitoring:
> 
> **1. Polling Strategy**
> - `useEffect` với interval
> - Fetch stats mỗi X giây
> - Update UI khi có thay đổi
> 
> **2. React Query**
> - Auto refetch
> - Background updates
> 
> **3. Optimistic Updates**
> - Update UI ngay khi check-in
> - Sync với server sau
> 
> **Future**: Có thể dùng WebSocket cho true real-time"

---

### PHẦN 9: TESTING & DEPLOYMENT

#### Q: Testing strategy?
**Trả lời:**
> "Hiện tại:
> - ✅ Manual testing
> - ✅ Playwright config (chưa có tests)
> 
> **Nên có**:
> - Unit tests (Jest/Vitest)
> - Integration tests (React Testing Library)
> - E2E tests (Playwright)
> 
> **Priority**:
> 1. Critical flows (auth, check-in)
> 2. Business logic (services)
> 3. UI components"

#### Q: Deployment process?
**Trả lời:**
> "Deployment:
> 
> **1. Build**
> ```bash
> npm run build
> ```
> 
> **2. Environment Variables**
> - `NEXT_PUBLIC_API_URL`
> - `NEXT_PUBLIC_API_TIMEOUT`
> 
> **3. Hosting Options**
> - Vercel (recommended cho Next.js)
> - Netlify
> - Self-hosted (Docker)
> 
> **4. CI/CD** (chưa có)
> - GitHub Actions
> - Auto deploy on push"

---

### PHẦN 10: CÂU HỎI KHÓ

#### Q: Nếu có 10,000 users đồng thời, hệ thống có handle được không?
**Trả lời:**
> "Để handle 10k concurrent users:
> 
> **Frontend**:
> - ✅ Next.js SSR/SSG (giảm server load)
> - ✅ React Query caching (giảm API calls)
> - ✅ Code splitting (giảm initial load)
> 
> **Backend** (cần optimize):
> - Database indexing
> - API rate limiting
> - Caching (Redis)
> - Load balancing
> 
> **Infrastructure**:
> - CDN cho static assets
> - Database connection pooling
> - Horizontal scaling"

#### Q: Làm sao đảm bảo data consistency?
**Trả lời:**
> "Data consistency:
> 
> **1. Backend**
> - Database transactions
> - Optimistic locking
> - Validation rules
> 
> **2. Frontend**
> - React Query optimistic updates
> - Error handling & rollback
> - Refetch on error
> 
> **3. Real-time**
> - WebSocket cho critical updates
> - Polling cho non-critical"

#### Q: Security vulnerabilities và cách fix?
**Trả lời:**
> "Potential vulnerabilities:
> 
> **1. XSS**
> - ✅ React tự escape
> - ✅ Sanitize user input
> 
> **2. CSRF**
> - ✅ SameSite cookies
> - ✅ CSRF tokens
> 
> **3. JWT**
> - ⚠️ localStorage (XSS risk)
> - ✅ httpOnly cookies (better)
> 
> **4. SQL Injection**
> - ✅ Backend validation
> - ✅ Parameterized queries"

---

## 🎯 TIPS KHI BẢO VỆ

### 1. Tự tin nhưng khiêm tốn
- Thừa nhận những gì chưa làm được
- Nói về plans cải thiện

### 2. Demo trơn tru
- Test trước nhiều lần
- Chuẩn bị backup plan
- Có data mẫu sẵn

### 3. Giải thích rõ ràng
- Dùng diagrams
- Ví dụ cụ thể
- So sánh với alternatives

### 4. Thể hiện hiểu biết
- Giải thích "tại sao" không chỉ "làm gì"
- Nói về trade-offs
- Discuss alternatives

### 5. Xử lý câu hỏi khó
- Không đoán, nói "em cần check lại"
- Liên hệ với best practices
- Discuss solutions

---

## 📝 GHI CHÚ QUAN TRỌNG

1. **Đọc kỹ code** trước khi bảo vệ
2. **Test tất cả flows** trước
3. **Chuẩn bị demo data**
4. **Hiểu rõ từng file quan trọng**
5. **Practice presentation**

---

*Chúc bạn bảo vệ thành công! 🎉*


# 📚 TÀI LIỆU ROUTES - NEXT.JS APP ROUTER

## 🎯 CÁCH NEXT.JS TỰ ĐỘNG CẤU HÌNH ROUTES

Next.js 13+ sử dụng **File-System Based Routing** - nghĩa là **cấu trúc thư mục trong `app/` tự động tạo routes**.

### Quy tắc cơ bản:

1. **Mỗi folder = một route segment**
2. **File `page.tsx` = trang hiển thị**
3. **File `layout.tsx` = layout wrapper**
4. **File `loading.tsx` = loading UI**
5. **Folder `[id]` = dynamic route**

---

## 📁 CẤU TRÚC ROUTES HIỆN TẠI

### Public Routes (Không cần authentication)

```
app/
├── page.tsx                    → / (Home page)
├── (public)/                   → Route group (không ảnh hưởng URL)
│   ├── about/
│   │   └── page.tsx            → /about
│   └── events/
│       └── page.tsx            → /events
└── login/
    └── page.tsx               → /login
```

### Dashboard Routes (Student/Attendee)

```
app/dashboard/
├── layout.tsx                  → Layout cho tất cả dashboard routes
├── page.tsx                    → /dashboard
├── events/
│   ├── page.tsx               → /dashboard/events
│   └── loading.tsx            → Loading state
├── tickets/
│   └── page.tsx               → /dashboard/tickets
├── attendance/
│   └── page.tsx               → /dashboard/attendance
└── settings/
    └── page.tsx               → /dashboard/settings
```

### Organizer Routes

```
app/organizer/
├── layout.tsx                  → Layout cho organizer
├── page.tsx                    → /organizer (Dashboard)
├── events/
│   ├── page.tsx               → /organizer/events
│   └── loading.tsx
├── speakers/
│   ├── page.tsx               → /organizer/speakers
│   └── loading.tsx
├── venues/
│   ├── page.tsx               → /organizer/venues
│   └── loading.tsx
├── seats/
│   ├── page.tsx               → /organizer/seats
│   └── loading.tsx
├── halls/
│   └── page.tsx               → /organizer/halls
└── reports/
    ├── page.tsx               → /organizer/reports
    └── loading.tsx
```

### Staff Routes

```
app/staff/
├── layout.tsx                  → Layout cho staff
├── page.tsx                    → /staff (Event selection)
├── checkin/
│   └── [eventId]/
│       └── page.tsx           → /staff/checkin/:eventId
└── monitor/
    └── [eventId]/
        └── page.tsx           → /staff/monitor/:eventId
```

---

## 🔧 CÁC ROUTES CẦN TẠO THÊM

Dựa trên đánh giá UI features, các routes sau cần được tạo:

### 1. Organizer - Event Management

```
app/organizer/events/
├── new/
│   ├── page.tsx               → /organizer/events/new (Tạo sự kiện)
│   └── loading.tsx
└── [id]/
    ├── page.tsx               → /organizer/events/:id (Chi tiết sự kiện)
    ├── edit/
    │   └── page.tsx           → /organizer/events/:id/edit (Chỉnh sửa)
    └── loading.tsx
```

### 2. Dashboard - Event Registration

```
app/dashboard/events/
└── [id]/
    ├── page.tsx               → /dashboard/events/:id (Chi tiết sự kiện)
    ├── register/
    │   └── page.tsx           → /dashboard/events/:id/register (Đăng ký)
    └── loading.tsx
```

### 3. Dashboard - Ticket Details

```
app/dashboard/tickets/
└── [id]/
    └── page.tsx               → /dashboard/tickets/:id (Chi tiết vé)
```

---

## 📝 CÁCH TẠO ROUTE MỚI

### Ví dụ: Tạo route `/organizer/events/new`

1. **Tạo folder structure:**
```
app/organizer/events/new/
```

2. **Tạo file `page.tsx`:**
```typescript
// app/organizer/events/new/page.tsx
export default function CreateEventPage() {
  return <div>Create Event</div>
}
```

3. **Route tự động được tạo:** `/organizer/events/new` ✅

### Ví dụ: Tạo dynamic route `/dashboard/events/[id]`

1. **Tạo folder với tên trong ngoặc vuông:**
```
app/dashboard/events/[id]/
```

2. **Tạo file `page.tsx`:**
```typescript
// app/dashboard/events/[id]/page.tsx
export default function EventDetailPage({ params }: { params: { id: string } }) {
  return <div>Event {params.id}</div>
}
```

3. **Route tự động được tạo:** `/dashboard/events/:id` ✅

---

## 🎨 CÁC FILE ĐẶC BIỆT

### `layout.tsx`
- Wrapper cho tất cả routes trong folder và subfolders
- Giữ state khi navigate
- Ví dụ: `app/dashboard/layout.tsx` → áp dụng cho tất cả `/dashboard/*`

### `loading.tsx`
- Hiển thị khi route đang load
- Tự động hiển thị trong Suspense boundary
- Ví dụ: `app/dashboard/events/loading.tsx` → hiển thị khi navigate đến `/dashboard/events`

### `error.tsx`
- Error boundary cho route
- Hiển thị khi có lỗi xảy ra

### `not-found.tsx`
- 404 page cho route cụ thể

### `route.ts` hoặc `route.js`
- API route handler (không dùng trong project này vì có backend riêng)

---

## 🔗 ROUTE GROUPS

### `(public)` - Route Group
```
app/(public)/
├── about/
└── events/
```

- **Không ảnh hưởng URL** - vẫn là `/about` và `/events`
- Dùng để **nhóm routes** có chung layout hoặc logic
- Có thể tạo `layout.tsx` trong route group

### Ví dụ khác:
```
app/
├── (marketing)/
│   ├── about/
│   └── contact/
└── (dashboard)/
    ├── dashboard/
    └── profile/
```

---

## 🎯 DYNAMIC ROUTES

### Single Dynamic Segment
```
app/events/[id]/page.tsx
→ /events/123
→ params.id = "123"
```

### Multiple Dynamic Segments
```
app/events/[eventId]/tickets/[ticketId]/page.tsx
→ /events/123/tickets/456
→ params.eventId = "123"
→ params.ticketId = "456"
```

### Catch-all Routes
```
app/docs/[...slug]/page.tsx
→ /docs/a/b/c
→ params.slug = ["a", "b", "c"]
```

### Optional Catch-all
```
app/shop/[[...slug]]/page.tsx
→ /shop (params.slug = undefined)
→ /shop/a/b (params.slug = ["a", "b"])
```

---

## 📋 CHECKLIST ROUTES CẦN TẠO

### Priority 1 (Quan trọng nhất)
- [ ] `/organizer/events/new` - Tạo sự kiện
- [ ] `/dashboard/events/[id]` - Chi tiết sự kiện (student view)
- [ ] `/dashboard/events/[id]/register` - Đăng ký sự kiện

### Priority 2
- [ ] `/organizer/events/[id]` - Chi tiết sự kiện (organizer view)
- [ ] `/organizer/events/[id]/edit` - Chỉnh sửa sự kiện
- [ ] `/dashboard/tickets/[id]` - Chi tiết vé

### Priority 3
- [ ] `/organizer/events/[id]/attendees` - Danh sách người tham dự
- [ ] `/organizer/events/[id]/stats` - Thống kê sự kiện

---

## 🚀 CÁCH SỬ DỤNG

### Navigation trong code:

```typescript
import Link from 'next/link'
import { useRouter } from 'next/navigation'

// Sử dụng Link component
<Link href="/organizer/events/new">Tạo sự kiện</Link>

// Sử dụng useRouter hook
const router = useRouter()
router.push('/dashboard/events/123')
router.replace('/login')
```

### Lấy params trong dynamic routes:

```typescript
// app/dashboard/events/[id]/page.tsx
export default function EventPage({ 
  params 
}: { 
  params: { id: string } 
}) {
  const eventId = params.id
  return <div>Event ID: {eventId}</div>
}
```

### Lấy search params:

```typescript
// app/dashboard/events/page.tsx
export default function EventsPage({
  searchParams,
}: {
  searchParams: { search?: string; page?: string }
}) {
  const search = searchParams.search
  const page = searchParams.page
  return <div>Search: {search}, Page: {page}</div>
}
```

---

## ⚠️ LƯU Ý QUAN TRỌNG

1. **File `page.tsx` là bắt buộc** để route hoạt động
2. **Folder name = route path** (trừ route groups `()`)
3. **Dynamic routes** dùng `[param]` trong tên folder
4. **Layout.tsx** áp dụng cho tất cả routes con
5. **Loading.tsx** tự động wrap trong Suspense
6. **Route groups** `(name)` không ảnh hưởng URL

---

## 📚 TÀI LIỆU THAM KHẢO

- [Next.js App Router Documentation](https://nextjs.org/docs/app/building-your-application/routing)
- [Next.js Routing](https://nextjs.org/docs/app/building-your-application/routing/pages-and-layouts)
- [Dynamic Routes](https://nextjs.org/docs/app/building-your-application/routing/dynamic-routes)

---

*Tài liệu này mô tả cách Next.js tự động cấu hình routes dựa trên cấu trúc thư mục trong project.*


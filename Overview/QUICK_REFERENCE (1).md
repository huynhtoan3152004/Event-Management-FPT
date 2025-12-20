# ⚡ QUICK REFERENCE - TÓM TẮT NHANH

## 🎯 DỰ ÁN TRONG 30 GIÂY

**Tên**: FPTU Event Hub  
**Mục đích**: Hệ thống quản lý sự kiện cho FPT University  
**Tech Stack**: Next.js 16 + React 19 + TypeScript  
**3 Roles**: Student, Organizer, Staff

---

## 🏗️ KIẾN TRÚC

```
Presentation Layer → Business Logic → Data Access → Infrastructure
   (Components)        (Services)      (API Client)    (Utils)
```

**Patterns**: Service, Repository, Provider, Guard, Custom Hooks

---

## 🔐 AUTHENTICATION

1. Login → JWT token → localStorage
2. Axios interceptor → Auto add token
3. RoleGuard → Protect routes
4. 401 → Auto logout

---

## 📦 STATE MANAGEMENT

- **Server State**: React Query (caching, refetching)
- **Local State**: useState, useReducer
- **Form State**: React Hook Form + Zod

---

## 🚀 PERFORMANCE

- Server Components
- Code splitting
- React Query caching
- Memoization (useCallback, useMemo)

---

## 🛡️ SECURITY

- JWT authentication
- Role-based access control
- Input validation (Zod)
- XSS protection (React auto-escape)

---

## 📁 CẤU TRÚC QUAN TRỌNG

```
lib/
├── api/          # API layer
├── services/    # Business logic
└── utils/       # Utilities

components/
├── ui/          # Reusable UI
├── shared/      # Shared components
└── [role]/      # Role-specific

hooks/           # Custom hooks
types/           # TypeScript types
```

---

## 🔑 KEY FILES

| File | Mục đích |
|------|----------|
| `lib/api/client.ts` | Axios instance + interceptors |
| `lib/api/endpoints.ts` | API endpoints constants |
| `lib/services/*.service.ts` | Business logic |
| `components/shared/role-guard.tsx` | Route protection |
| `hooks/use-auth.ts` | Authentication hooks |
| `app/providers.tsx` | React Query provider |

---

## 💡 CÂU TRẢ LỜI NGẮN GỌN

**Q: Tại sao Next.js?**  
A: SSR/SSG, performance, SEO, production-ready

**Q: Tại sao React Query?**  
A: Server state, caching, ít boilerplate

**Q: Authentication?**  
A: JWT token, localStorage, Axios interceptor, RoleGuard

**Q: Security?**  
A: JWT, RBAC, input validation, XSS protection

**Q: Performance?**  
A: Server Components, caching, code splitting, memoization

**Q: Code quality?**  
A: TypeScript strict, layered architecture, DRY, SOLID

---

## 📊 SỐ LIỆU

- **3 Roles**: Student, Organizer, Staff
- **9 Services**: auth, event, ticket, checkin, speaker, venue, user, report, admin
- **6 Custom Hooks**: useAuth, useUser, useLogin, useRegister, useLogout, useCurrentUser
- **50+ UI Components**: shadcn/ui
- **TypeScript**: 100% coverage

---

## 🎯 ĐIỂM MẠNH

1. ✅ Modern tech stack
2. ✅ Clean architecture
3. ✅ Type safety
4. ✅ Performance optimized
5. ✅ Security best practices
6. ✅ Scalable structure

---

## ⚠️ ĐIỂM CẦN CẢI THIỆN

1. ⚠️ Testing (chưa có)
2. ⚠️ Error logging (chưa có)
3. ⚠️ CI/CD (chưa có)
4. ⚠️ Documentation (cần thêm)

---

## 🎤 TIPS BẢO VỆ

1. **Tự tin**: Hiểu rõ code của mình
2. **Demo**: Test trước nhiều lần
3. **Giải thích**: Dùng diagrams, ví dụ
4. **Thành thật**: Thừa nhận limitations
5. **Proactive**: Nói về improvements

---

*In file này để tham khảo nhanh khi bảo vệ! 📄*


# CLAUDE.md — WheelSpace

> File này được Claude Code tự động đọc mỗi khi mở dự án. Mục đích: dù đổi tài khoản Claude,
> phiên làm việc mới vẫn có đủ ngữ cảnh để tiếp tục ngay. **Luôn cập nhật mục "Trạng thái hiện tại"
> và "Nhật ký phiên" trước khi kết thúc một phiên làm việc.**

Rule làm việc & onboarding: @ONBOARDING.md

---

## 1. Tổng quan dự án

- **Tên:** WheelSpace
- **Mục tiêu:** <!-- TODO: dự án giải quyết vấn đề gì, cho ai -->
- **Người dùng chính:** <!-- TODO -->
- **Chủ dự án:** nghlong200165@gmail.com
- **Repo:** https://github.com/nghlong200165/WheelSpace. Nhánh `main` là bản đã duyệt, `dev` là bản đang test (xem ONBOARDING mục 5).

## 2. Tech stack

| Phần | Công nghệ | Phiên bản |
|---|---|---|
| Frontend + Backend | Next.js (App Router, Cache Components bật), TypeScript, full-stack | 16.4 |
| React | React | 19.3 |
| UI | Tailwind CSS (token màu trong `src/app/globals.css`) | 4.3 |
| Database | MongoDB: local dùng Docker (`mongo:8`, cổng 27018), production dùng Atlas | 8 |
| ODM | Mongoose | 9 |
| Validate | Zod (schema dùng chung FE/BE trong `src/lib/schemas/`) | 4 |
| Thanh toán | payOS (VietQR, webhook) + COD. Demo: `PAYMENT_PROVIDER=mock` | |
| Auth admin | 1 tài khoản admin từ env + cookie phiên ký bằng `SESSION_SECRET` | |
| Ảnh | Demo: lưu thư mục `uploads/` (gitignored), phục vụ qua route `/uploads/[...path]`. Trước khi deploy Vercel phải đổi `src/server/services/storage.ts` sang Cloudinary | |
| Hạ tầng / Deploy | Vercel (gói free) | |

> Next 16 khác bản cũ: đọc tài liệu trong `node_modules/next/dist/docs/` trước khi dùng API lạ (xem `AGENTS.md`).
> Khi có Cache Components, component đọc DB phải nằm trong `<Suspense>` hoặc dùng `'use cache'`. Route handler đọc DB thì gọi `await connection()`.
> Bẫy Next 16 đã gặp:
> - `usePathname()` / `useSearchParams()` ở route động phải bọc `<Suspense>`.
> - `Date.now()` trước khi gọi `connection()` sẽ báo lỗi prerender.
> - Form dùng `action={formAction}` bị React 19 xóa trắng sau khi submit. Phải submit qua `onSubmit` + `startTransition`, xem `ProductForm`.
> - **Không chạy `npm run build` khi `npm run dev` đang chạy cùng thư mục**, vì dev server sẽ lẫn trạng thái và trang tự reload liên tục.

## 3. Cấu trúc thư mục

```
WheelSpace/                    # Gốc repo git
└── WSProject/                 # Project Next.js
    ├── src/
    │   ├── app/               # FE: trang (routing) + route handler mỏng
    │   │   ├── admin/login/   #   đăng nhập admin
    │   │   ├── admin/(panel)/ #   trang admin có sidebar: products, settings, orders
    │   │   ├── api/health/    #   kiểm tra DB
    │   │   └── uploads/       #   phục vụ ảnh sản phẩm từ thư mục uploads/
    │   ├── components/admin/  # FE: form + field admin
    │   ├── lib/               # Dùng chung FE/BE: format, form-state, schemas/ (Zod + DTO type)
    │   ├── proxy.ts           # Chặn /admin/* khi chưa có cookie hợp lệ (kiểm tra sơ bộ)
    │   └── server/            # BE (server-only)
    │       ├── auth/          #   token.ts (ký HMAC, dùng cả trong proxy), session.ts (requireAdmin)
    │       ├── actions/       #   Server Actions: auth, products, settings
    │       ├── services/      #   products, settings, storage, auth, health
    │       ├── models/        #   Product, Order, Settings
    │       └── env.ts, db.ts, cache-tags.ts
    ├── scripts/seed.ts        # Seed dữ liệu mẫu (npm run db:seed)
    ├── docker-compose.yml     # MongoDB local
    ├── .env.example           # Mẫu biến môi trường (copy thành .env.local)
    ├── CLAUDE.md, ONBOARDING.md, AGENTS.md
    └── package.json
```

## 4. Lệnh thường dùng

```bash
npm install            # Cài đặt
npm run db:up          # Bật MongoDB (Docker). Compass: mongodb://localhost:27018
npm run db:seed        # Tạo collection/index + cài đặt mặc định + 10 sản phẩm mẫu (chỉ khi DB trống)
npm run db:seed -- --reset  # Xóa products + orders rồi seed lại (chỉ cho phép DB localhost)
npm run dev            # Dev server: http://localhost:3000, kiểm tra DB: /api/health
npm run typecheck      # Kiểm tra type
npm run lint           # ESLint
npm run build          # Build production (tắt dev server trước, xem lưu ý mục 2)
npm run db:down        # Tắt MongoDB
```

## 5. Kiến trúc & quyết định quan trọng

<!-- Ghi lại các quyết định đã chốt để phiên sau không bàn lại. Mẫu:
- [YYYY-MM-DD] Chọn X thay vì Y vì ... -->

- [2026-11-25] Dùng Next.js full-stack TypeScript thay vì ASP.NET Core: giai đoạn đầu ưu tiên chi phí. .NET cần server chạy 24/7 nên hosting tốn phí, còn Next.js chạy free trên Vercel. Sau này có thể tách API riêng nếu cần.
- [2026-11-25] Dùng MongoDB (Atlas) + Mongoose theo lựa chọn của chủ dự án. Khi đặt hàng, trừ kho bằng update atomic có điều kiện (`stock >= qty`) để chống bán lố.
- [2026-11-25] Phạm vi demo: sản phẩm gồm mã MGT, tên, giá, ảnh, độ hiếm (Thường/Chase/Limited), tình trạng (New/Lướt/Used), tồn kho. Thanh toán COD + payOS. Phí ship do admin cấu hình. Hàng order không xử lý trên web, chỉ có nút chat Messenger (link FB đang để placeholder). Chưa làm mã giảm giá, đổi trả, phân quyền.
- [2026-11-25] Cho phép guest checkout: khách tra cứu đơn bằng mã đơn + SĐT. Đăng nhập là tùy chọn, dùng cho wishlist và lịch sử đơn.
- [2026-11-25] Không viết code khi chủ dự án chưa confirm. Luôn đề xuất trước rồi hỏi.
- [2026-11-25] FE và BE chung một project, không tách 2 folder. Để sau này tách được, luôn giữ các quy tắc sau:
  1. Logic nghiệp vụ chỉ nằm trong `src/server/services/`, viết bằng hàm TypeScript thuần, không phụ thuộc Next.js.
  2. Trang và component không gọi DB hay model trực tiếp, luôn đi qua service.
  3. Server Action và route handler chỉ là lớp mỏng: validate bằng Zod, gọi service, trả kết quả.
  4. Service trả DTO (object thuần), không trả document Mongoose.
  5. Mọi file trong `src/server/` có `import "server-only"`. Có 2 ngoại lệ: file `"use server"` trong `actions/`, và `auth/token.ts` vì proxy cũng import file này.
  6. Mọi trang admin và Server Action admin đều gọi `requireAdmin()`. Proxy chỉ là lớp chặn sơ bộ.
- [2026-11-25] Admin không dùng Auth.js: chỉ có 1 admin, email/mật khẩu đặt trong env, cookie phiên ký HMAC-SHA256 có hạn 7 ngày. Trang admin đặt `instant = false` (chấp nhận điều hướng chờ server).
- [2026-11-25] Ảnh sản phẩm: tối đa 10 ảnh, mỗi ảnh ≤ 8MB, chỉ nhận JPG/PNG/WEBP, tên file là UUID. Ảnh đầu tiên là ảnh đại diện. Sửa hoặc xóa sản phẩm thì xóa luôn file ảnh không còn dùng.
- [2026-11-25] Link Messenger chỉ chấp nhận http/https (giá trị này được render thành href, chặn `javascript:`).
- [2026-11-25] Đơn payOS trừ kho ngay khi tạo đơn và hết hạn thanh toán sau 30 phút (hủy đơn và trả kho). Mã đơn có dạng `WS-XXXXXX`. Địa chỉ gồm Tỉnh/Thành + Phường/Xã nhập dạng text.
- [2026-11-25] MongoDB local chạy ở cổng 27018, vì 27017 đã bị container `revoland-mongo` của dự án khác chiếm.

## 6. Biến môi trường & cấu hình

<!-- Chỉ liệt kê TÊN biến và ý nghĩa. KHÔNG ghi giá trị secret vào đây. -->

| Biến | Ý nghĩa |
|---|---|
| `MONGODB_URI` | Chuỗi kết nối MongoDB |
| `ADMIN_EMAIL`, `ADMIN_PASSWORD` | Tài khoản admin duy nhất |
| `SESSION_SECRET` | Khóa ký cookie phiên admin (≥ 32 ký tự) |
| `PAYMENT_PROVIDER` | `mock` (giả lập) hoặc `payos` |
| `PAYOS_CLIENT_ID`, `PAYOS_API_KEY`, `PAYOS_CHECKSUM_KEY` | Key payOS (khi dùng `payos`) |

Env được validate trong `src/server/env.ts`. Thêm biến mới thì cập nhật cả file đó lẫn `.env.example`.

---

## 7. Trạng thái hiện tại

> Cập nhật mục này cuối mỗi phiên. Đây là phần quan trọng nhất khi đổi tài khoản.

- **Đang làm:** Xong phần 2 (Admin), chờ chủ dự án review. Wireframe: https://claude.ai/artifact/R7DLqD6UVgxFdshyNYvB2w
- **Việc tiếp theo** (mỗi phần làm xong phải chờ review):
  1. Phần 3: Cửa hàng gồm trang chủ, danh sách, chi tiết, giỏ hàng. Đọc dữ liệu bằng `'use cache'` + `cacheTag(CACHE_TAGS.products)`, vì các action admin đã gọi `updateTag`.
  2. Phần 4: Đặt hàng gồm checkout, trừ kho, COD, payOS mock, tra cứu đơn, quản lý đơn (trang `/admin/orders` đang là placeholder).
- **Còn nợ:** chưa giới hạn số lần đăng nhập sai (brute-force); ảnh đang lưu đĩa local nên chưa deploy Vercel được.
- **Git:** `main` chỉ có README. Phần 1 và seed đã ở trên `dev` (đã push). Phần 2 chưa commit.
- **Vấn đề / blocker:** (không có)

## 8. Nhật ký phiên

<!-- Mới nhất ở trên. Mỗi phiên 2–4 dòng: đã làm gì, còn dở gì. -->

- **2026-11-25:** Phần 2 (Admin): đăng nhập + proxy, CRUD sản phẩm + upload ảnh (chọn ảnh đại diện, xóa ảnh), lọc/tìm, cài đặt cửa hàng. Test E2E bằng Edge: 26/26 pass. Đã sửa: form bị React 19 xóa trắng sau submit, `Date.now()` lúc prerender, link `javascript:`.
- **2026-11-25:** Thêm `scripts/seed.ts` (chạy bằng tsx, dùng lại model của app) và lệnh `db:seed`. Đã seed DB local.
- **2026-11-25:** Phần 1: dựng Next.js 16 + Tailwind 4, Mongoose model (Product, Order, Settings), Zod schema, kết nối DB, `/api/health`, MongoDB bằng Docker. Typecheck, lint và build đều pass, health trả `database: up`.
- **2026-11-25:** Làm wireframe 7 trang khách + 5 trang admin. Phong cách: nền #F6F5F2, chữ #121212, màu nhấn đỏ #B3121E, font Be Vietnam Pro.
- **2026-11-25:** Brainstorm: web TMĐT bán Mini GT, gồm hàng có sẵn và hàng order (cần tư vấn riêng), chạy song song với Facebook. Chốt stack Next.js + PostgreSQL + Prisma + Vercel.
- **2026-11-25:** Tạo CLAUDE.md và ONBOARDING.md.

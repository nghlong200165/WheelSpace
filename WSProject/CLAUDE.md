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
> - Sửa dữ liệu **thẳng trong DB** (mongosh, Compass, script) thì cache `'use cache'` của cửa hàng **không tự làm mới**. Phải lưu 1 sản phẩm/cài đặt qua admin (gọi `updateTag`) hoặc khởi động lại server.
> - Model Mongoose luôn được tạo lại khi file nạp lại (`deleteModel` rồi `model`), để dev server không giữ schema cũ.
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
    │   ├── app/(shop)/        #   cửa hàng: layout (header/footer/nút Messenger), trang chủ, products, login, register, account
    │   ├── app/admin/(panel)/customers/ # admin: danh sách khách + đặt lại mật khẩu
    │   ├── app/auth/google/   #   OAuth Google: bắt đầu (route.ts) + callback
    │   ├── components/admin/  # FE: form admin
    │   ├── components/shop/   # FE: SiteHeader, AccountLink, SiteFooter, ProductCard, WishlistButton, AddressForm…
    │   ├── components/ui/     # FE: field/form dùng chung (fields.tsx)
    │   ├── lib/               # Dùng chung FE/BE: format, form-state, schemas/ (Zod + DTO type)
    │   ├── proxy.ts           # Chặn /admin/* và /account/* khi chưa có cookie hợp lệ (kiểm tra sơ bộ, trả 307)
    │   └── server/            # BE (server-only)
    │       ├── auth/          #   token.ts (ký HMAC, dùng cả trong proxy), session.ts (admin),
    │       │                  #   customer-session.ts (khách), google.ts (config + safeNextPath)
    │       ├── actions/       #   Server Actions: auth (admin), account (khách), customers (admin), products, settings
    │       ├── services/      #   products, settings, users, password, rate-limit, auth, health
    │       ├── integrations/  #   dịch vụ bên thứ 3: storage (local), email/sms (console), payment (types), google (oauth)
    │       ├── queries/       #   storefront.ts: đọc dữ liệu cửa hàng có cache
    │       ├── models/        #   Product, Order, Settings, User
    │       └── env.ts, db.ts, cache-tags.ts
    ├── scripts/               # seed.ts, check-google-oauth.ts, check-accounts.ts
    ├── docs/THIRD_PARTY_SERVICES.md # Danh sách dịch vụ bên thứ 3 + chi phí + việc để sau
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
npm run check:oauth    # Kiểm tra luồng trao đổi Google OAuth (giả lập Google, không cần mạng)
npm run check:accounts # Kiểm tra quy tắc tài khoản trên DB local (đăng ký, khóa, gộp Google); tự dọn dữ liệu test
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
- [2026-11-25] Đăng nhập khách gồm 2 cách:
  - **SĐT/email + mật khẩu.** Trang `/login` có 2 bước: nhập SĐT/email trước, đã có tài khoản thì hỏi mật khẩu, chưa có thì sang `/register` với giá trị điền sẵn.
  - **Google.** Luồng OAuth (PKCE + state) tự viết trong `services/google-oauth.ts` và `app/auth/google/`, không dùng thư viện.
- [2026-11-25] Quy tắc tài khoản khách:
  - Đăng ký gồm họ tên + SĐT (bắt buộc) + mật khẩu (≥ 8 ký tự), email không bắt buộc. Chưa có OTP nên SĐT/email chưa xác minh.
  - Mật khẩu băm bằng scrypt (`services/password.ts`). Sai 5 lần thì khóa 15 phút (lưu trong DB). Ngoài ra có giới hạn số request theo IP (in-memory).
  - Google gộp vào tài khoản có cùng email. Nếu email đó chưa xác minh và tài khoản có mật khẩu thì **xóa mật khẩu và tăng `sessionVersion`**, để chặn trường hợp kẻ xấu đăng ký trước bằng email của người khác.
  - Cookie `ws_session` chứa `uid` + `sv` (sessionVersion). Đổi hoặc đặt lại mật khẩu thì tăng `sv`, mọi phiên cũ bị đăng xuất.
  - Quên mật khẩu: khách nhắn Messenger, admin vào `/admin/customers` để đặt lại và nhận mật khẩu tạm (chỉ hiện 1 lần).
  - Khách đăng nhập có thêm lịch sử đơn, địa chỉ lưu sẵn, wishlist. "Báo khi có hàng" chưa làm vì cần dịch vụ gửi email.
  - Bước tra SĐT/email cho người khác biết số đó đã có tài khoản hay chưa. Đây là đánh đổi của kiểu đăng nhập 2 bước, đã giới hạn số lần tra theo IP.
- [2026-11-25] Giỏ hàng lưu ở localStorage (phương án A), không đồng bộ server. Khi đặt hàng, server tính lại giá + phí ship và trừ kho atomic. Không giữ hàng khi còn nằm trong giỏ.
- [2026-11-25] Không viết code khi chủ dự án chưa confirm. Luôn đề xuất trước rồi hỏi.
- [2026-11-25] FE và BE chung một project, không tách 2 folder. Để sau này tách được, luôn giữ các quy tắc sau:
  1. Logic nghiệp vụ chỉ nằm trong `src/server/services/`, viết bằng hàm TypeScript thuần, không phụ thuộc Next.js.
  2. Trang và component không gọi DB hay model trực tiếp, luôn đi qua service.
  3. Server Action và route handler chỉ là lớp mỏng: validate bằng Zod, gọi service, trả kết quả.
  4. Service trả DTO (object thuần), không trả document Mongoose.
  5. Mọi file trong `src/server/` có `import "server-only"`. Có 2 ngoại lệ: file `"use server"` trong `actions/`, và `auth/token.ts` vì proxy cũng import file này.
  6. Mọi trang admin và Server Action admin đều gọi `requireAdmin()`. Proxy chỉ là lớp chặn sơ bộ.
  7. Cửa hàng đọc dữ liệu qua `src/server/queries/storefront.ts`. Đây là lớp cache riêng của Next (`'use cache'` + `cacheTag` + `cacheLife('hours')`), bọc các service. Service vẫn giữ thuần, không phụ thuộc Next. Chỉ trả sản phẩm `isVisible`.
  8. **Dịch vụ bên thứ 3 chỉ nằm trong `src/server/integrations/<loại>/`**, gồm `types.ts` (chuẩn chung), mỗi nhà cung cấp 1 file, và `index.ts` chọn nhà cung cấp theo `<LOẠI>_PROVIDER`. Code nghiệp vụ chỉ import `integrations/<loại>`. Luôn có nhà cung cấp free cho dev (`local`/`console`/`mock`). Cách thêm: `src/server/integrations/README.md`.
- [2026-11-25] Hero trang chủ là slider (`components/shop/HeroSlider.tsx`):
  - Ảnh lấy từ sản phẩm có tick "Hiện trên banner trang chủ" (`isFeatured`), tối đa 6. Không tick mẫu nào thì lấy sản phẩm "Mới về" có ảnh. Chỉ lấy sản phẩm đang hiện và có ảnh.
  - Bấm vào ảnh thì sang `/products`.
  - Tự chuyển mỗi 5 giây, dừng khi hover/focus/chạm, không tự chạy khi máy bật giảm chuyển động. Có nút ‹ ›, chấm vị trí, vuốt, phím mũi tên.
- [2026-11-25] **Dịch vụ bên thứ 3 tốn phí thì để làm sau.** Chỉ ghi vào `docs/THIRD_PARTY_SERVICES.md`, không tích hợp khi chủ dự án chưa đồng ý. Thêm hoặc đổi dịch vụ nào cũng phải cập nhật file đó.
- [2026-11-25] Trang chủ được prerender khi build, nên **lúc build phải có MongoDB chạy** (cả trên Vercel: cần `MONGODB_URI` lúc build).
- [2026-11-25] Admin không dùng Auth.js: chỉ có 1 admin, email/mật khẩu đặt trong env, cookie phiên ký HMAC-SHA256 có hạn 7 ngày. Trang admin đặt `instant = false` (chấp nhận điều hướng chờ server).
- [2026-11-25] Ảnh sản phẩm: tối đa 10 ảnh, mỗi ảnh ≤ 8MB, chỉ nhận JPG/PNG/WEBP, tên file là UUID. Ảnh đầu tiên là ảnh đại diện. Sửa hoặc xóa sản phẩm thì xóa luôn file ảnh không còn dùng.
- [2026-11-25] Link Messenger chỉ chấp nhận http/https (giá trị này được render thành href, chặn `javascript:`).
- [2026-11-25] Đơn payOS trừ kho ngay khi tạo đơn và hết hạn thanh toán sau 30 phút (hủy đơn và trả kho). Mã đơn có dạng `WS-XXXXXX`. Địa chỉ gồm Tỉnh/Thành + Phường/Xã nhập dạng text.
- [2026-11-25] MongoDB local chạy ở cổng 27018, vì 27017 đã bị container `revoland-mongo` của dự án khác chiếm.

## 5b. Deploy demo (2026-11-25)

- **Link:** https://wheel-space.vercel.app (Vercel Hobby, project `wheel-space`, Root Directory `WSProject`). Chỉ để đồng nghiệp xem, chưa bán thật.
- **Tự deploy khi push lên nhánh `dev`.** Nhánh mặc định trên GitHub **đang là `dev`** (đổi tạm vì `main` chỉ có README). Khi merge vào `main` thì đổi lại mặc định và Production Branch trên Vercel.
- **Database:** MongoDB Atlas, Cluster0 free (M0), Hong Kong, database `wheelspace`, user `wheelspace_app`, IP Access `0.0.0.0/0`. Đã seed 10 sản phẩm mẫu. Dữ liệu tách riêng với Docker trên máy. Cluster free tự pause nếu lâu không dùng, khi đó vào Atlas bấm Resume.
- **Biến trên Vercel:** `MONGODB_URI`, `SESSION_SECRET`. Chưa đặt `ADMIN_*` nên admin bị khóa. Chưa có Cloudinary nên ảnh chưa hiện (`STORAGE_PROVIDER=local` không ghi được trên Vercel).
- **Việc nên làm:** đặt Function Region = Hong Kong (hkg1) cho gần DB. Thêm Cloudinary nếu cần ảnh.

## 6. Biến môi trường & cấu hình

<!-- Chỉ liệt kê TÊN biến và ý nghĩa. KHÔNG ghi giá trị secret vào đây. -->

| Biến | Ý nghĩa |
|---|---|
| `MONGODB_URI` | Chuỗi kết nối MongoDB |
| `ADMIN_EMAIL`, `ADMIN_PASSWORD` | Tài khoản admin duy nhất |
| `SESSION_SECRET` | Khóa ký cookie phiên admin, khách và cookie OAuth state (≥ 32 ký tự) |
| `APP_URL` | URL gốc của web, dùng tạo redirect URI cho Google (`<APP_URL>/auth/google/callback`) |
| `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` | OAuth client của Google. Để trống thì nút đăng nhập Google bị tắt |
| `STORAGE_PROVIDER` | Nơi lưu ảnh: `local` (hiện có). Sau thêm `cloudinary` |
| `EMAIL_PROVIDER` | Gửi email: `console` (in ra log). Sau thêm `resend` |
| `SMS_PROVIDER` | Gửi SMS: `console` (in ra log). Sau thêm nhà cung cấp SMS/Zalo ZNS |
| `PAYMENT_PROVIDER` | `mock` (giả lập) hoặc `payos` |
| `PAYOS_CLIENT_ID`, `PAYOS_API_KEY`, `PAYOS_CHECKSUM_KEY` | Key payOS (khi dùng `payos`) |

Env được validate trong `src/server/env.ts`. Thêm biến mới thì cập nhật cả file đó lẫn `.env.example`.

---

## 7. Trạng thái hiện tại

> Cập nhật mục này cuối mỗi phiên. Đây là phần quan trọng nhất khi đổi tài khoản.

- **Đang làm:** Phần 3 làm từng trang theo yêu cầu chủ dự án. Đã xong **trang chủ**, **đăng nhập (SĐT/email + mật khẩu, Google), đăng ký, /account, admin Khách hàng**, **trang danh sách `/products`**. Trang danh sách chờ review. Chủ dự án cần tạo Google OAuth client để thử đăng nhập thật. Wireframe: https://claude.ai/artifact/R7DLqD6UVgxFdshyNYvB2w
- **Việc tiếp theo** (mỗi trang làm xong phải chờ review):
  1. Chờ review giỏ hàng `/cart`. Nút đặt hàng đang khóa "Sắp ra mắt" theo yêu cầu chủ dự án.
  2. Phần 4: checkout, trừ kho, COD, payOS mock, tra cứu đơn `/order-lookup`, quản lý đơn (trang `/admin/orders` đang là placeholder).
- **Còn nợ:** chưa giới hạn số lần đăng nhập sai của **admin** (khách đã có khóa 5 lần sai). Ảnh đang lưu đĩa local nên chưa deploy Vercel được (cần Cloudinary). Các dịch vụ tốn phí xem `docs/THIRD_PARTY_SERVICES.md`.
- **Git:** `main` chỉ có README. Mọi phần đã làm (khung, admin, trang chủ + slider, đăng nhập/đăng ký, integrations, trang danh sách + dải nút hãng, trang chi tiết + giỏ localStorage) đã ở trên `dev` và đã push (Vercel tự deploy). Chờ chủ dự án test rồi mới merge vào `main`. Thư mục `WheelSpace/Image/` (ảnh thử) cố ý không commit.
- **Vấn đề / blocker:** (không có)

## 8. Nhật ký phiên

<!-- Mới nhất ở trên. Mỗi phiên 2–4 dòng: đã làm gì, còn dở gì. -->

- **2026-11-27:** Tải trang có xe chạy (chủ dự án chọn 1+2+3 sau bản xem thử, **bỏ intro chặn màn hình** vì làm chậm khách và điểm SEO):
  - `RouteProgress` (`src/components/motion/`): vạch đỏ mép trên có xe 1:64 (`MiniCar`) ở đầu vạch. App Router không có sự kiện bắt đầu chuyển trang nên bắt click link nội bộ + submit form GET, xong khi pathname/query đổi; chỉ hiện nếu chờ quá 120ms, tự tắt sau 10s. Trong lúc chờ `<main>` mờ đi (`html[data-navigating]`).
  - Hero trang chủ "vào cua" chỉ lần ghé đầu mỗi phiên: script `beforeInteractive` trong root layout (`src/lib/hero-seen.ts`) thêm `html.hero-seen` nếu sessionStorage đã đánh dấu; `<html>` có `suppressHydrationWarning`. Tiêu đề hiện từng dòng (có padding để dấu tiếng Việt không bị cắt), khung ảnh trượt vào + vệt sáng.
  - Khung đang tải (danh sách, chi tiết, giỏ) dùng `RoadLoader`: vạch đường chạy + xe chạy ngang.
  - Sửa: `RevealObserver` đổi từ thêm class sang `element.animate()` vì phần tử stream về có thể lọt vào màn hình trước khi React hydrate, đổi className gây hydration mismatch. Font thêm độ đậm 200 (chữ `font-extralight`).
  - E2E: chi tiết 34/34, cart 24/24, danh sách 47/48 (cảnh báo do Playwright chèn `caret-color` khi chụp màn hình).

- **2026-11-27:** Hiệu ứng chuyển động (học tinh thần web hãng xe, không sao chép). Chủ dự án duyệt qua bản xem thử, **giữ nguyên hero cũ**.
  - Dùng chung: `RevealObserver` (phần tử có `data-reveal` hiện dần khi cuộn, `--i` để so le), header dính + mờ kính khi cuộn (**không co chiều cao**, vì co làm nội dung giật và hỏng test giữ vị trí cuộn), menu có gạch đỏ trượt (`MainNav`), class `btn-sweep` (đỏ tràn từ trái), CSS ở cuối `globals.css`, tự tắt khi bật giảm chuyển động.
  - Card: zoom ảnh, thanh "XEM CHI TIẾT" trượt lên, nút + thêm nhanh (`QuickAdd`, nằm ngoài thẻ `<a>`), xe chưa có ảnh hiện `SpecPlate`. Thêm vào giỏ: ảnh bay vào icon giỏ (`src/lib/fly-to-cart.ts`, đích là `[data-cart-target]`), số trên giỏ nảy, `CartToast` ở đáy màn hình (trang chi tiết chỉ bay, giữ dòng báo cũ).
  - Trang chủ (`src/components/home/`): chữ khổng lồ trôi theo cuộn, dải tên hãng chạy ngang (chỉ hãng có hàng), băng chuyền "Mới về" (8 mẫu, kéo được), khu Chase & Limited nền đen có đốm sáng theo chuột + card nghiêng, khối nhận order 3 bước.
  - E2E: chi tiết 34/34, cart 24/24, danh sách 47/48 (cảnh báo do Playwright). Các bài Google trong `customer.mjs` cần `GOOGLE_CLIENT_ID` (`.env.local` chưa có), không liên quan thay đổi này.

- **2026-11-27:** Link SEO cho trang chi tiết: `/products/mini-gt-<tên-xe>-<mã>` (`src/lib/slug.ts`, route đổi thành `products/[slug]`).
  - Không lưu slug trong DB: `getVisibleProductBySlug` so từng đuôi của slug với mã sản phẩm (đã slugify), lấy đuôi dài nhất. Đổi tên xe thì link cũ vẫn tìm ra và chuyển sang slug mới; link cũ `/products/<id>` cũng chuyển. Chuyển hướng là `permanentRedirect` (308) nhưng do streaming nên trả 200 + `meta refresh`, kèm `canonical`.
  - Mã sản phẩm bắt buộc có chữ hoặc số. Thêm `sitemap.xml` (trang chủ, /products, mọi xe đang hiện) và `robots.txt` (chặn admin, account, cart, login, register, auth, api). `SITE_URL` gom ở `src/lib/site-url.ts`.
  - E2E chi tiết 34/34, cart 24/24, danh sách 47/48 (cảnh báo hydration do Playwright).
  - Dev server (Turbopack) hay giữ bản cũ khi đổi tên thư mục route hoặc thêm export mới. Gặp lỗi lạ thì khởi động lại `npm run dev` trước khi sửa code.

- **2026-11-27:** Giỏ hàng `/cart` (`src/components/shop/CartView.tsx`):
  - Giá/tồn kho lấy mới qua Server Action `getCartProductsAction` → `listCartProducts` (không cache, trả cả sản phẩm ẩn với `available: false`). Chỉ gọi lại khi có id mới, đổi số lượng không gọi server.
  - Số lượng > tồn kho thì tự giảm và báo. Hết hàng / ngừng bán / đã xóa vẫn giữ trong giỏ, mờ đi, không tính tiền; hết hàng có link "Nhắn tin để order".
  - Tóm tắt: tạm tính, phí ship (miễn phí khi đạt ngưỡng), thanh tiến độ freeship. Nút đặt hàng khóa "Sắp ra mắt", gợi ý chốt đơn qua Messenger/điện thoại.
  - Ô số lượng (`QuantityInput`, dùng chung trang chi tiết + giỏ) nhập tay được. Nhập/bấm + vượt tồn kho thì báo "Mẫu này chỉ còn N chiếc" rồi đưa về mức tối đa (nút + không khóa nữa). Thêm vào giỏ khi giỏ đã đủ thì báo lý do thay vì khóa nút.
  - E2E cart 24/24, chi tiết 29/29.
- **2026-11-27:** Logo mới `src/components/ui/Logo.tsx`: vô lăng đua 3 chấu tự vẽ (SVG, vạch đỏ 12 giờ, không dùng logo hãng nào để tránh bản quyền) + chữ WHEELSPACE. Rê chuột (link có class `group`): vô lăng xoay -30° có nảy, chữ giãn 0.32em → 0.38em (có bản ẩn giữ chỗ nên header không xê dịch), màu cố định ink. Dùng ở header, footer, đăng nhập admin, menu admin. Card sản phẩm: rê chuột thì card nhích lên 4px, hiện nền trắng + bóng mềm (bỏ zoom ảnh), chữ giữ màu đen. Lưu ý: `a:hover { color: accent }` trong `globals.css` không nằm trong layer nên thắng utility Tailwind; muốn giữ màu thì đặt màu trên phần tử con. E2E products 47/48: lỗi còn lại là cảnh báo hydration do Playwright chèn `caret-color` khi chụp màn hình, không phải lỗi app.

- **2026-11-27:** Bộ lọc hãng đổi thành **dải nút trên lưới**:
  - Danh sách hãng cố định ở `src/lib/brands.ts` (admin chọn từ danh sách, có mục "Khác").
  - Chọn được nhiều hãng (`?brand=A&brand=B`). Mỗi nút kèm số mẫu tính theo các bộ lọc khác. Hãng 0 mẫu gom sau "+ N hãng khác".
- **2026-11-27:** Trang chi tiết `/products/[id]`:
  - Gallery (ảnh nhỏ, phím mũi tên, vuốt), chọn số lượng ≤ tồn kho, Thêm vào giỏ, wishlist.
  - Hết hàng thì hiện "Nhắn tin để order". Có "Có thể bạn cũng thích" (cùng hãng trước), metadata/OG cho chia sẻ Facebook (`metadataBase` từ `APP_URL` hoặc domain Vercel).
  - Giỏ hàng lưu localStorage (`src/lib/cart.ts`), header hiện số lượng.
  - Sản phẩm ẩn hoặc sai id thì hiện trang not-found + `noindex` (mã HTTP vẫn 200 do streaming, chấp nhận).
  - E2E: chi tiết 27/27, danh sách 48/48, tài khoản 31/31.

- **2026-11-25:** Trang `/products`:
  - Lọc theo độ hiếm / tình trạng / kho (chọn nhiều, `rarity=rare` = Chase + Limited), tìm theo tên/mã, sắp xếp, 12 sp/trang.
  - Bộ lọc nằm trên URL, dùng `next/form` với `scroll={false}` (chuyển trang client-side, không nhảy lên đầu). Tick không tự lọc: phải bấm "TÌM KIẾM" (nút chuyển đen khi có thay đổi chưa áp dụng). Riêng ô Sắp xếp áp dụng ngay. Đọc dữ liệu qua `getCatalog(filter)` có cache.
  - Đã sửa: checkbox giữ trạng thái cũ sau "Xóa bộ lọc" (thêm `key` theo bộ lọc).
  - Thêm bộ lọc **Hãng xe** (ô chọn cạnh Sắp xếp, áp dụng ngay). Sản phẩm có trường `brand` bắt buộc, admin nhập có gợi ý, gõ khác hoa/thường thì tự dùng cách viết của hãng đã có. Danh sách hãng lấy tự động từ sản phẩm đang hiện. URL bỏ tham số rỗng/mặc định (`/products?brand=Nissan`).
  - E2E 38/38. Bài test trang chủ cũ (`home.mjs`) cần viết lại vì dữ liệu mẫu đã có ảnh thật.
- **2026-11-25:** Slider ảnh xe ở hero trang chủ, thêm trường `isFeatured` cho sản phẩm. Header trên điện thoại chỉ hiện biểu tượng cho tài khoản/giỏ hàng. E2E slider 17/17, hồi quy khách 31/31, trang chủ 14/14.
- **2026-11-25:** Tạo `docs/THIRD_PARTY_SERVICES.md`. Gom dịch vụ bên thứ 3 vào `src/server/integrations/` theo kiểu adapter: storage (local), email/sms (console), payment (chỉ có types), google (chuyển từ services). Hồi quy admin 26/26.
- **2026-11-25:** Đăng nhập 2 bước bằng SĐT/email + mật khẩu, trang đăng ký, đổi/đặt mật khẩu ở /account, admin `/admin/customers` đặt lại mật khẩu. Index users chuyển sang partial unique (phone/email/googleSub). Test: check:accounts 18/18, E2E auth 28/28, hồi quy khách 31/31, admin 26/26, trang chủ 14/14.
- **2026-11-25:** Đăng nhập khách bằng Google (tự viết OAuth PKCE), trang `/login`, `/account` (hồ sơ, địa chỉ, wishlist, đơn hàng đang placeholder), header hiện tên khách. Proxy chặn `/account` bằng 307. Test: 8/8 offline OAuth, 31/31 E2E khách, hồi quy admin 26/26, trang chủ 14/14.
- **2026-11-25:** Trang chủ: hero (ảnh của sản phẩm "Mới về" đầu tiên có ảnh), Mới về, dải Chase & Limited, khối order, cam kết, header/footer/nút Messenger (ẩn khi chưa có link). Cache theo tag, admin sửa là cập nhật ngay. E2E 14/14 pass trên bản build production.
- **2026-11-25:** Phần 2 (Admin): đăng nhập + proxy, CRUD sản phẩm + upload ảnh (chọn ảnh đại diện, xóa ảnh), lọc/tìm, cài đặt cửa hàng. Test E2E bằng Edge: 26/26 pass. Đã sửa: form bị React 19 xóa trắng sau submit, `Date.now()` lúc prerender, link `javascript:`.
- **2026-11-25:** Thêm `scripts/seed.ts` (chạy bằng tsx, dùng lại model của app) và lệnh `db:seed`. Đã seed DB local.
- **2026-11-25:** Phần 1: dựng Next.js 16 + Tailwind 4, Mongoose model (Product, Order, Settings), Zod schema, kết nối DB, `/api/health`, MongoDB bằng Docker. Typecheck, lint và build đều pass, health trả `database: up`.
- **2026-11-25:** Làm wireframe 7 trang khách + 5 trang admin. Phong cách: nền #F6F5F2, chữ #121212, màu nhấn đỏ #B3121E, font Be Vietnam Pro.
- **2026-11-25:** Brainstorm: web TMĐT bán Mini GT, gồm hàng có sẵn và hàng order (cần tư vấn riêng), chạy song song với Facebook. Chốt stack Next.js + PostgreSQL + Prisma + Vercel.
- **2026-11-25:** Tạo CLAUDE.md và ONBOARDING.md.

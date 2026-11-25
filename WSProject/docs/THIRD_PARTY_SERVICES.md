# Dịch vụ bên thứ 3: đang dùng và để làm sau

> Cập nhật: 2026-11-25. **Giá và giới hạn gói free chỉ là ước tính tại thời điểm viết.** Kiểm tra lại trang giá chính thức trước khi đăng ký. Dịch vụ nào **tốn phí** thì để làm sau, cho tới khi chủ dự án đồng ý.
>
> Cách thêm hoặc đổi nhà cung cấp trong code: xem `src/server/integrations/README.md`.

## 1. Tóm tắt

| Dịch vụ | Dùng để | Trạng thái | Chi phí |
|---|---|---|---|
| MongoDB (Docker trên máy) | Database khi dev | ✅ Đang dùng | Free |
| Google OAuth | Đăng nhập bằng Google | ✅ Code xong, chờ tạo client | Free |
| Lưu ảnh trên máy (`local`) | Ảnh sản phẩm khi dev | ✅ Đang dùng | Free (không chạy được trên Vercel) |
| Email "console" / SMS "console" | Giả lập gửi email/SMS (in ra log) | ✅ Sẵn sàng | Free |
| payOS | Thanh toán VietQR | ⏳ Làm ở phần 4 (đang dùng `mock`) | Xem mục 3.4 |
| MongoDB Atlas | Database khi chạy thật | ⏳ Khi deploy | Free M0 → trả phí khi lớn |
| Vercel | Hosting | ⏳ Khi deploy | **Lưu ý: gói free không cho dùng thương mại** |
| Cloudinary | Lưu + tối ưu ảnh khi chạy thật | ⏳ Khi deploy (bắt buộc nếu dùng Vercel) | Free có giới hạn |
| Tên miền | wheelspace.vn / .com | ⏳ Khi deploy | ~300.000–800.000₫/năm |
| Resend (email) | OTP, xác nhận đơn, báo có hàng | 💤 Để sau | Free 3.000 email/tháng |
| SMS OTP (eSMS, SpeedSMS…) | Xác minh SĐT | 💤 Để sau | **Tốn phí mỗi tin** |
| Zalo ZNS | Tin nhắn Zalo thông báo đơn | 💤 Để sau | **Tốn phí mỗi tin** |
| GHN / GHTK API | Tính phí ship tự động, tạo vận đơn | 💤 Để sau | API free, trả phí ship |

Ký hiệu: ✅ đang dùng · ⏳ sẽ cần khi deploy/phần tiếp theo · 💤 để sau, chưa cần cho demo.

## 2. Đang dùng (free)

### Google OAuth (đăng nhập Google)
- **Chi phí:** free.
- **Cần làm:** tạo OAuth client trên Google Cloud Console (hướng dẫn chi tiết đã gửi trong chat). Khi deploy, thêm domain thật vào *Authorized origins / redirect URIs* rồi bấm *Publish app*.
- **Biến môi trường:** `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `APP_URL`.
- **Code:** `src/server/integrations/google/oauth.ts`.

### MongoDB qua Docker (dev)
- Chạy trên máy bằng `npm run db:up`, cổng 27018. Không dùng được khi deploy.

### Lưu ảnh trên máy, `STORAGE_PROVIDER=local`
- Ảnh nằm trong thư mục `uploads/`. **Vercel không cho ghi file**, nên khi deploy phải chuyển sang Cloudinary (mục 3.3).

## 3. Cần khi deploy / phần tiếp theo

### 3.1 Vercel (hosting)
- **Gói Hobby (free) chỉ dành cho dự án cá nhân, phi thương mại.** Web bán hàng là thương mại nên đúng điều khoản phải dùng **Pro (~20 USD/tháng/người)**.
- Lựa chọn rẻ hơn nếu cần: VPS ~100.000–150.000₫/tháng (tự quản lý server), Netlify, Render, Railway… Mỗi nơi có điều khoản riêng, cần đọc kỹ.
- **Quyết định để sau:** khi nào deploy thật.

### 3.2 MongoDB Atlas (database thật)
- **Free M0:** 512MB, đủ cho vài nghìn sản phẩm và đơn hàng. Hạn chế: tài nguyên dùng chung, không có backup tự động.
- **Trả phí:** gói Flex (~8–30 USD/tháng) hoặc dedicated M10 (~57 USD/tháng) khi cần backup và hiệu năng.
- **Biến môi trường:** `MONGODB_URI`, chỉ cần đổi chuỗi kết nối, không sửa code.

### 3.3 Cloudinary (lưu ảnh)
- **Free:** khoảng 25 "credit"/tháng (tính chung dung lượng lưu, băng thông và số lần xử lý ảnh). Đủ cho shop nhỏ.
- **Trả phí:** gói Plus ~89 USD/tháng, chỉ cần khi lượng truy cập lớn.
- **Code cần thêm:** `integrations/storage/cloudinary.ts` + `STORAGE_PROVIDER=cloudinary` + biến `CLOUDINARY_*`. Xem README integrations.
- **Thay thế:** Vercel Blob, Cloudflare R2 (free 10GB, rẻ băng thông), AWS S3.

### 3.4 payOS (thanh toán VietQR)
- Dùng ở phần 4 (checkout). Hiện tại `PAYMENT_PROVIDER=mock` giả lập.
- **Chi phí: cần kiểm tra biểu phí payOS hiện hành** (phí giao dịch, yêu cầu tài khoản doanh nghiệp/hộ kinh doanh).
- **Code sẽ thêm:** `integrations/payment/payos.ts` + `mock.ts` theo chuẩn `payment/types.ts` (đã có sẵn).
- **Biến môi trường:** `PAYOS_CLIENT_ID`, `PAYOS_API_KEY`, `PAYOS_CHECKSUM_KEY`.

### 3.5 Tên miền
- `.com` ~300.000₫/năm, `.vn` ~450.000–800.000₫ năm đầu (giá khác nhau theo nhà đăng ký).

## 4. Để sau (chưa cần cho demo)

### 4.1 Gửi email: Resend (hoặc Brevo, Amazon SES)
- **Dùng cho:** OTP xác minh email, quên mật khẩu tự động, email xác nhận đơn, "báo khi có hàng".
- **Resend free:** 3.000 email/tháng (giới hạn ~100/ngày). Trả phí ~20 USD/tháng cho 50.000 email.
- **Yêu cầu:** có tên miền riêng và xác minh DNS.
- **Code cần thêm:** `integrations/email/resend.ts` + `EMAIL_PROVIDER=resend`. Chuẩn `email/types.ts` đã có.

### 4.2 SMS OTP: eSMS, SpeedSMS, Stringee…
- **Dùng cho:** xác minh SĐT khi đăng ký, quên mật khẩu qua SĐT.
- **Chi phí:** ~500–1.000₫/tin với SMS brandname, kèm phí đăng ký brandname với nhà mạng (vài triệu đồng, mất vài tuần).
- **Code cần thêm:** `integrations/sms/<tên>.ts` + `SMS_PROVIDER=<tên>`. Chuẩn `sms/types.ts` đã có.

### 4.3 Zalo ZNS
- **Dùng cho:** gửi thông báo đơn hàng hoặc OTP qua Zalo. Thường rẻ hơn SMS và khách dễ đọc hơn.
- **Chi phí:** ~200–300₫/tin. Cần Zalo Official Account đã xác thực và mẫu tin được duyệt.
- **Code:** có thể cài theo chuẩn `sms/types.ts`.

### 4.4 Đơn vị vận chuyển: GHN, GHTK, Viettel Post
- **Dùng cho:** tính phí ship theo địa chỉ thay vì đồng giá, tạo vận đơn tự động, theo dõi hành trình.
- **Chi phí:** API free, chỉ trả phí ship theo đơn. Cần tài khoản shop với đơn vị vận chuyển.
- **Code sẽ thêm:** `integrations/shipping/` (types + từng đơn vị) khi cần.

### 4.5 Khác (khi web lớn hơn)
- **Theo dõi lỗi:** Sentry (free 5.000 lỗi/tháng).
- **Thống kê truy cập:** Google Analytics (free), Vercel Analytics (có phí ở gói Pro).
- **Facebook Pixel / Conversions API:** đo hiệu quả quảng cáo Facebook (free).

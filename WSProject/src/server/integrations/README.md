# Integrations: dịch vụ bên thứ 3

Mọi dịch vụ bên ngoài (lưu ảnh, email, SMS, thanh toán, đăng nhập Google, vận chuyển…) đều nằm ở đây.
Danh sách dịch vụ và chi phí: `docs/THIRD_PARTY_SERVICES.md`.

## Quy tắc

1. **Code nghiệp vụ** (`services/`, `actions/`, `app/`) chỉ import từ `integrations/<loại>` (file `index.ts`). Không import thẳng file của một nhà cung cấp cụ thể, và không gọi SDK hay API của bên thứ 3 ở ngoài thư mục này.
2. Mỗi loại dịch vụ có:
   - `types.ts`: chuẩn chung (interface) mà mọi nhà cung cấp phải theo.
   - `<tên-nhà-cung-cấp>.ts`: một file cho mỗi nhà cung cấp.
   - `index.ts`: chọn nhà cung cấp theo biến môi trường `<LOẠI>_PROVIDER`.
3. Luôn có một nhà cung cấp **free cho dev** (`local`, `console`, `mock`) để chạy được mà không cần tài khoản hay key.
4. Key và secret chỉ đọc qua `env()` trong `src/server/env.ts`, không bao giờ hard-code.

| Loại | Thư mục | Biến chọn | Đang có |
|---|---|---|---|
| Lưu ảnh | `storage/` | `STORAGE_PROVIDER` | `local` |
| Gửi email | `email/` | `EMAIL_PROVIDER` | `console` |
| Gửi SMS / Zalo | `sms/` | `SMS_PROVIDER` | `console` |
| Thanh toán | `payment/` | `PAYMENT_PROVIDER` | chuẩn đã có, cài `mock`/`payos` ở phần 4 |
| Đăng nhập Google | `google/` | (bật khi có `GOOGLE_CLIENT_ID`) | `oauth.ts` |

## Thêm một nhà cung cấp mới (ví dụ: Cloudinary cho lưu ảnh)

1. **Tạo file** `storage/cloudinary.ts` export một object đúng chuẩn `StorageProvider` trong `storage/types.ts`:
   ```ts
   export const cloudinaryStorageProvider: StorageProvider = {
     name: "cloudinary",
     async saveImage(file, folder) { /* upload, trả về URL https://res.cloudinary.com/... */ },
     async deleteImages(urls) { /* xóa theo public_id */ },
   };
   ```
2. **Thêm vào `index.ts`:**
   ```ts
   case "cloudinary":
     return cloudinaryStorageProvider;
   ```
3. **Khai báo biến môi trường** trong `src/server/env.ts`:
   - Thêm `"cloudinary"` vào `STORAGE_PROVIDER: z.enum([...])`.
   - Thêm các key mới, ví dụ `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`.
4. **Cập nhật** `.env.example`, bảng biến môi trường trong `CLAUDE.md`, và `docs/THIRD_PARTY_SERVICES.md`.
5. Nếu nhà cung cấp trả về URL ảnh ở domain khác, thêm domain đó vào `images.remotePatterns` trong `next.config.ts`.
6. Nếu cần thư viện SDK, ghi rõ lý do khi thêm (theo ONBOARDING). Nhiều dịch vụ chỉ cần gọi `fetch` tới REST API là đủ.

Thêm một **loại dịch vụ mới** (ví dụ vận chuyển): tạo thư mục `shipping/` với `types.ts` + nhà cung cấp dev (`flat.ts`, phí đồng giá) + `index.ts`, thêm `SHIPPING_PROVIDER` vào `env.ts`, rồi bổ sung vào bảng trên.

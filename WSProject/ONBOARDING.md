# ONBOARDING — WheelSpace

Rule bắt buộc cho bất kỳ ai (người hoặc Claude) bắt đầu làm việc với dự án.

## 1. Bắt đầu một phiên mới

1. Đọc `CLAUDE.md`, nhất là mục **Trạng thái hiện tại** và **Nhật ký phiên**.
2. Chạy `git status` và `git log --oneline -10` để biết thay đổi gần nhất.
3. Xác nhận lại việc cần làm với chủ dự án trước khi viết code nếu yêu cầu chưa rõ.

## 2. Kết thúc một phiên

1. Cập nhật mục **Trạng thái hiện tại** trong `CLAUDE.md` (đang làm gì, việc tiếp theo, blocker).
2. Thêm 2–4 dòng vào **Nhật ký phiên** (ngày dạng `YYYY-MM-DD`).
3. Có quyết định kiến trúc mới thì ghi vào mục **Kiến trúc & quyết định quan trọng**.
4. Commit các thay đổi còn dở (hoặc ghi rõ phần chưa commit trong nhật ký).

## 3. Giao tiếp

- Trả lời bằng **tiếng Việt**; thuật ngữ kỹ thuật, tên biến và code dùng tiếng Anh.
- Ngắn gọn, đi thẳng vào việc. Nếu có nhiều phương án thì đưa ra một đề xuất kèm lý do.
- Hỏi trước khi làm các thao tác khó hoàn tác: xóa file, `git push --force`, `git reset --hard`, đổi schema database, deploy.

## 4. Code

- Viết code theo phong cách sẵn có trong file xung quanh (đặt tên, cấu trúc, mật độ comment).
- Đặt tên biến, hàm và file bằng tiếng Anh.
- Không thêm thư viện mới khi chưa nói rõ lý do.
- Không hard-code secret, API key hay mật khẩu. Dùng biến môi trường và file `.env` (không commit file này).
- Chạy test/lint (xem `CLAUDE.md` mục 4) trước khi báo là đã xong. Nếu fail thì báo đúng kết quả.

## 5. Git

- Remote: https://github.com/nghlong200165/WheelSpace (gốc repo là thư mục `WheelSpace/`, code nằm trong `WSProject/`).
- Nhánh chính: `main`, chỉ chứa code đã được chủ dự án test và duyệt. Không commit thẳng vào `main`.
- Nhánh phụ: `dev` là nơi commit và push code mới để chủ dự án test. Việc lớn thì tách `feature/<tên>` hoặc `fix/<tên>` từ `dev` rồi merge lại vào `dev`.
- Chỉ merge `dev` vào `main` khi chủ dự án xác nhận đã test xong.
- Commit message: `<type>: <mô tả ngắn>` với type thuộc `feat`, `fix`, `refactor`, `docs`, `chore`, `test`.
- Chỉ commit hoặc push khi chủ dự án yêu cầu.

## 6. Bảo mật

- Không đưa secret vào `CLAUDE.md`, `ONBOARDING.md` hay bất kỳ file nào được commit.
- Không gửi dữ liệu hoặc code của dự án lên dịch vụ bên ngoài khi chưa được đồng ý.

## 7. Rule riêng của dự án

<!-- TODO: thêm các rule đặc thù (coding convention của framework, quy trình review, môi trường test...) -->

- (chưa có)

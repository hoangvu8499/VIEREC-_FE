# CLAUDE.md

Frontend VIEREC Academy (đào tạo an toàn, ứng phó sự cố môi trường). React 19 + TypeScript strict + Vite 8.
Backend ở `../VIEREC_BE` (có CLAUDE.md riêng).

> Gặp quy ước mới, quyết định hoặc cạm bẫy không hiển nhiên thì cập nhật file này, vào đúng mục.
> Không ghi lại những gì đọc code là thấy. Mục nào hết đúng thì sửa hoặc xoá.

## Lệnh

```bash
npm run dev          # http://localhost:8484, proxy /api -> BE :8383
npm run validate     # typecheck + lint + format:check + test — chạy trước khi báo xong việc
npx vitest run <file>
```

- Môi trường dev là Windows. Env: copy `.env.example` → `.env.development`.
- Biến env chỉ đọc qua `src/config/env.ts`, không dùng `import.meta.env` rải rác.
- Chạy BE: trong `../VIEREC_BE` chạy `java -jar target/vierec-be.jar`. Đổi cổng FE thì phải thêm origin vào
  `CORS_ORIGINS` của BE, nếu không POST bị 403 "Invalid CORS request".

## Phân tầng (user và admin dùng chung nền)

- `components/common/`: chỉ nhận props, không chứa text nghiệp vụ, không gọi API.
- `components/form/`: mọi form dùng các field ở đây, không tự viết `<input>` + label.
- `schemas/`: rule validate dùng chung (`userFieldRules`); form admin tạo/sửa học viên dùng lại.
- `types/`: kiểu nghiệp vụ đặt ở đây, không khai báo trong page.
- `layouts/user/` và `layouts/admin/` không import chéo. `pages/<page>/components/` không import chéo giữa các page;
  cần dùng lại thì chuyển lên tầng trên.
  Một phân hệ admin có nhiều trang dùng chung form (vd. `pages/admin/courses/`: danh sách, chi tiết, tạo/sửa khoá
  và bài học) thì để các `*-page.tsx` chung một thư mục, dùng chung `components/` và `use-*.ts` của thư mục đó.
- Màu, radius, shadow chỉ lấy từ biến CSS trong `styles/index.css`. Không thêm class toàn cục.

## Luồng dữ liệu

- Server state dùng TanStack Query, không lưu dữ liệu API vào Zustand. Ngoại lệ duy nhất: `useAuthStore` persist `user`
  để header hiện ngay khi tải trang; `useSessionSync()` xác nhận lại bằng `/auth/me`.
- HTTP chỉ qua `http` trong `services/http.ts`. Không tạo axios instance mới, không dùng `fetch`.
  Gửi `FormData` phải ghi đè `headers: { 'Content-Type': 'multipart/form-data' }`: instance mặc định JSON nên axios
  sẽ đổi FormData thành JSON (trình duyệt tự thay bằng boundary). Upload lớn đặt `timeout: 0`.
- Auth bằng cookie HttpOnly do BE set. JS không đọc, không lưu token, không gắn header `Authorization`.
  401 → tự refresh một lần (gộp request đồng thời), hỏng thì `clearSession()`.
  Ngoại lệ: sai mật khẩu hiện tại ở `PUT /auth/me/password` cũng trả 401 (`INVALID_CREDENTIALS`) → không refresh,
  không đăng xuất (`NO_REFRESH_PATHS`).
- Mọi lỗi được chuẩn hoá thành `ApiError` (`status = 0` là lỗi mạng). Thông báo cho người dùng dùng `apiErrorMessage()`,
  **không hiện message tiếng Anh của BE**.
- Path lấy từ `constants/routes.ts`, không hard-code. localStorage chỉ qua `utils/storage.ts`, key trong `STORAGE_KEYS`.
- Trang người dùng gọi `GET /courses` phải gửi `status=PUBLISHED`: nếu không, admin đang đăng nhập sẽ thấy cả khoá nháp.
  Trang "Đăng ký khoá học" của học viên (và khối "Khoá học mới mở") gửi thêm `excludeLearning=true`: BE bỏ khoá đã
  được duyệt / hoàn thành, phân trang vẫn đúng (đừng lọc ở FE). Khoá chờ duyệt vẫn hiện.
- Guard role ở `/admin` chỉ là lớp UI; BE vẫn chặn từng API. BE chỉ chặn SUPER_ADMIN ở API gán vai trò
  (ADMIN vẫn gọi được sửa/xoá SUPER_ADMIN, và tự xoá mình) → FE ẩn các nút đó (`user-permissions.ts`).
  Tài khoản đã xoá vẫn giữ username/email/SĐT/CCCD (không tạo lại được). Phân hệ chưa có API dùng `AdminComingSoon`,
  **không bịa số liệu**.

## Quy ước code

- File `kebab-case`, hook bắt đầu bằng `use-`. Page dùng `export default` (lazy route), còn lại named export.
- Import luôn dùng alias `@/`, trừ CSS Module cùng thư mục. Import kiểu dùng `import type`.
- `erasableSyntaxOnly`: không dùng `enum`, `namespace`, parameter properties. Dùng object `as const` + union type.
- `noUncheckedIndexedAccess`: truy cập mảng/record phải kiểm tra `undefined`.
- CSS Modules, mỗi component một file `<tên>.module.css`, ghép class bằng `cn()`.
  Mobile-first (640 / 768 / 1024 / 1280), luôn kiểm tra không cuộn ngang ở 390px.
- Link điều hướng dùng `ButtonLink`, không bọc `<button>` trong `<Link>`. Nút chỉ có icon dùng `IconButton`.
- Hộp thoại chứa form dùng `Dialog`; xác nhận một thao tác dùng `ConfirmDialog`.
- Mỗi page gọi `useDocumentTitle('...')`.
- Icon: `lucide-react`; icon thương hiệu tự viết SVG trong `components/icons/`.
- Commit theo Conventional Commits. Không dùng `--no-verify`.

## Form

- react-hook-form + zod 4, schema đặt trong `schemas/`, `mode: 'onTouched'`, form gắn `noValidate`.
- Tên field camelCase trùng tên field của BE.
- Lỗi server: dịch sang tiếng Việt theo field rồi `setError` trong `useEffect` theo `mutation.error`
  (chạy sau render, lúc fieldset đã hết `disabled`), `setFocus` ô lỗi đầu tiên theo thứ tự trên form.
- zod 4: `.refine()` cấp object không chạy khi field khác còn lỗi → so khớp field (nhập lại mật khẩu) phải truyền `when`.
- Text được trim, **mật khẩu không trim**.

## Nghiệp vụ

- Trang đăng ký bắt buộc hiện lưu ý: _"Vì chứng chỉ cho mỗi học viên là duy nhất, học viên đăng ký vui lòng nhập đúng
  thông tin để không mất quyền lợi"_.
- ⚠️ **Chưa chốt:** FE để "Họ và tên đệm" ở `lastName`, "Tên" ở `firstName`, nhưng ví dụ của BE lại đặt tên đệm vào
  `firstName`. Hiển thị họ tên luôn qua `userFullName()`.
- ⚠️ `POST /auth/forgot-password` và `POST /auth/reset-password` là **giả định**, BE chưa có.
- Đăng ký khoá: QR chuyển khoản (`PaymentDialog`) → "Đã thanh toán" gọi `POST /courses/{id}/enrollments` → `PENDING`
  → admin duyệt (`ENROLLED`) / từ chối (`CANCELLED`) ở `/admin/duyet-dang-ky` (`GET /enrollments?status=PENDING`, mọi
  khoá) hoặc trang học viên của từng khoá. Huỷ / bị từ chối thì đăng ký lại từ trang khoá học. Chỉ `ENROLLED`/`COMPLETED` vào được trang học `/hoc-vien/khoa-hoc/:id`.
  Chưa được duyệt thì BE trả bài học không kèm `videoUrl`/`documentUrl`/`files` và chặn tải file (403); admin luôn
  thấy đủ.
- Học phí: `Course.price` (VND). QR là VietQR động sinh tại chỗ từ `BANK_ACCOUNT` (`utils/viet-qr.ts`), có sẵn số tiền
  và nội dung `transferContent(courseId, userId)` = `VIEREC KH<id khoá> HV<id user>`. Lượt đăng ký giữ `price` lúc gửi
  yêu cầu; doanh thu (`GET /enrollments/revenue` cho dashboard, `GET /enrollments/revenue/monthly` cho trang
  `/admin/doanh-thu`) cộng `price` các lượt ENROLLED/COMPLETED theo `approvedAt`, kể cả khoá/học viên đã xoá.
- ⚠️ **BE còn thiếu:** chưa tạo giao dịch khi học viên báo đã chuyển (`POST /payments` chỉ admin).
- Tiến độ xem video (≥ 80% mở "Thi chứng chỉ", BE kiểm tra lại lúc bắt đầu thi → 409 `EXAM_PROGRESS_NOT_ENOUGH`):
  `use-watch-progress.ts` giữ từng đoạn đã xem ở localStorage (để gộp đoạn xem lại), gửi tổng số giây lên
  `PUT /courses/{id}/my-progress` mỗi 15 giây / khi rời trang / trước khi bắt đầu thi (`sync()`); hiển thị lấy số lớn
  hơn giữa máy và server. Khoá video FE `lesson-<id>:<videoKey>` ↔ server `lessonId` + `videoKey`
  (`youtube-<mã>` / `file-<id>`); BE nhận dạng YouTube bằng `CourseVideos`, phải khớp `youtubeVideoId`.
- Bài thi chứng chỉ (`/admin/khoa-hoc/:id/bai-thi`): mỗi khoá 1 bài, câu trắc nghiệm A–D đúng 1 đáp án, điểm thang 10.
  Khoá chưa có bài thi → `GET` trả 404 `EXAM_NOT_FOUND` (trang hiện form tạo, không phải lỗi). Import Excel được cả hoặc
  không gì: dòng sai về trong `errors` dạng `rows[<dòng Excel>].<field>` (`examImportRowErrors` dịch, suy lý do từ
  `rejectedValue` rỗng hay không). File mẫu do BE sinh (`/exams/question-template`).
  Học viên thi ở `/hoc-vien/khoa-hoc/:id/thi` qua `/courses/{id}/my-exam` (không bao giờ có đáp án, server chấm):
  **mỗi học viên thi 1 lần**, đạt thì lượt đăng ký tự thành `COMPLETED`. Đếm ngược từ `remainingSeconds` (không so
  `deadlineAt` với giờ máy), hết giờ tự nộp; server nhận thêm 1 phút, trễ hơn chấm như không trả lời. Đáp án đang chọn
  giữ ở localStorage theo id lượt thi (tải lại trang không mất).
- Doanh nghiệp (role `BUSINESS`, `user.businessId/businessName`): admin tạo doanh nghiệp + tài khoản quản lý ở
  `/admin/doanh-nghiep` (BUSINESS không cấp qua ô chọn vai trò ở trang Người dùng). Người quản lý vào "Góc doanh nghiệp"
  `/doanh-nghiep-cua-toi` (API `/my-business`, chỉ thấy học viên của mình): tạo tài khoản học viên (như đăng ký), ghi
  danh hộ nhiều người → lượt `PENDING`, QR tổng tiền nội dung `businessTransferContent` = `VIEREC KH<khoá> DN<doanh
nghiệp>`, admin duyệt ở hàng chờ như thường (có tên doanh nghiệp). Theo dõi tiến độ / điểm thi / chứng chỉ dùng chung
  `components/shared/member-courses.tsx` cho admin và doanh nghiệp. Góc học viên và Góc doanh nghiệp dùng chung
  `AccountShell` + `AccountPageHeader` (`layouts/user/`).
- Học viên có chứng chỉ thì không tự sửa họ tên/ngày sinh/CCCD (409 `IDENTITY_LOCKED`): khoá bằng `readOnly`, không dùng
  `disabled` (RHF bỏ giá trị field disabled khi submit).
- Chứng chỉ: học viên `/hoc-vien/chung-chi/:code`, doanh nghiệp `/doanh-nghiep-cua-toi/chung-chi[/:code]` (chứng chỉ
  của học viên mình), dùng chung `CertificateDetail` / `CertificateActions`. Tải = link `fileDownloadUrl` (`?download=true`,
  BE trả `attachment`); In = `printPdf` (iframe ẩn, API khác origin thì mở tab mới). Bản có giá trị là file PDF admin
  upload, trang chỉ hiện thông tin.
- "Tìm đơn vị xử lý sự cố" (`/tim-don-vi-xu-ly-su-co`, chuyển từ project IncidentManagement) cần đăng nhập: route bọc
  `RequireRole`, BE `GET /support-points/nearby` trả 401 cho khách. Tìm theo `address` hoặc `latitude`+`longitude`
  (vị trí của tôi), state nằm trên URL. Bản đồ Leaflet nạp lười (`lazy`), test thì `vi.mock` component bản đồ.
  Trang admin "Điểm hỗ trợ sự cố" chưa có API quản lý → vẫn `AdminComingSoon`; dữ liệu nhập bằng SQL.
- Trang chủ đang dùng dữ liệu tĩnh (`home-data.ts`). Khi có API thì giữ nguyên kiểu trong `types/content.ts`.
- Thiếu tài liệu API thì đọc `modules/*/controller`, `ErrorCode.java`, `*ApiTest.java` bên BE.
  Thứ tự `errors` trong response lỗi không cố định.
- Ảnh tĩnh dùng WebP đã nén, đúng cỡ hiển thị (`logo-mark.webp` cắt sẵn biểu tượng từ logo gốc); có SVG gốc thì thay.

## Test

- Test đặt cạnh file nguồn. Query theo role/label, dùng `userEvent`.
- Component có `Link` bọc `<MemoryRouter>`; có `useMutation` bọc `QueryClientProvider` mới mỗi test (`retry: false`).
- jsdom coi như màn hẹp: menu chính bị ẩn tới khi bấm hamburger.
- `getByText('1.500.000 ₫')` không khớp: `formatVnd` dùng NBSP, Testing Library chỉ chuẩn hoá phía DOM → dùng regex
  `/^1\.500\.000\s₫$/`.
- Label field bắt buộc có `*` → query bằng regex `^Nhãn\s*\*?$`, không dùng `exact: false`.
- `vitest run` thỉnh thoảng crash worker (exit `3221226505` / panic rolldown) trên máy này, không phải lỗi code.
  Chạy lại hoặc chạy từng file.

## Chụp giao diện

- Trang cần đăng nhập: `chrome --screenshot` sau khi trang tự chuyển hướng (đăng nhập rồi `location.replace`) cho ra
  ảnh trắng, có `--user-data-dir` thì chụp nhầm tab mới. Dùng DevTools Protocol: chạy chrome
  `--remote-debugging-port`, điều khiển bằng `WebSocket` có sẵn của Node, đặt cỡ màn bằng
  `Emulation.setDeviceMetricsOverride` (390px chụp thẳng, không cần iframe), rồi `Page.captureScreenshot`.
- Đăng nhập phải đi qua origin 8484: `vite preview` (4173) không có trong `CORS_ORIGINS` của BE nên POST bị 403.
- Chụp bằng `--screenshot` thì `--virtual-time-budget` đóng băng transition → chèn `*{transition:none!important}`.
- `TaskStop` không kill được tiến trình node con → sau khi stop kiểm tra cổng 8484 / 4173
  (`Get-NetTCPConnection -LocalPort 8484 -State Listen`) và `Stop-Process` tiến trình `vite.js` còn sót.

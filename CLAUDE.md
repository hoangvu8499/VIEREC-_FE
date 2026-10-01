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
  thấy đủ. Ảnh QR khớp `BANK_ACCOUNT`, đổi tài khoản phải đổi cả hai.
- ⚠️ **BE còn thiếu:** chưa tạo giao dịch khi học viên báo đã chuyển (`POST /payments` chỉ admin), chưa có giá khoá,
  chưa có bài thi.
  Tiến độ xem video (≥ 80% để mở "Thi chứng chỉ") **tạm lưu localStorage** (`use-watch-progress.ts`).
- Học viên có chứng chỉ thì không tự sửa họ tên/ngày sinh/CCCD (409 `IDENTITY_LOCKED`): khoá bằng `readOnly`, không dùng
  `disabled` (RHF bỏ giá trị field disabled khi submit).
- Trang chủ đang dùng dữ liệu tĩnh (`home-data.ts`). Khi có API thì giữ nguyên kiểu trong `types/content.ts`.
- Thiếu tài liệu API thì đọc `modules/*/controller`, `ErrorCode.java`, `*ApiTest.java` bên BE.
  Thứ tự `errors` trong response lỗi không cố định.
- Trước khi lên production: cần logo PNG/SVG đã crop và nén `banner.jpg` (hiện 752 KB).

## Test

- Test đặt cạnh file nguồn. Query theo role/label, dùng `userEvent`.
- Component có `Link` bọc `<MemoryRouter>`; có `useMutation` bọc `QueryClientProvider` mới mỗi test (`retry: false`).
- jsdom coi như màn hẹp: menu chính bị ẩn tới khi bấm hamburger.
- Label field bắt buộc có `*` → query bằng regex `^Nhãn\s*\*?$`, không dùng `exact: false`.
- `vitest run` thỉnh thoảng crash worker (exit `3221226505` / panic rolldown) trên máy này, không phải lỗi code.
  Chạy lại hoặc chạy từng file.

## Chụp giao diện

- `npm run build && npx vite preview`, chụp bằng `chrome --headless=new --screenshot`.
- Headless không cho cửa sổ hẹp hơn ~500px → xem 390px thì nhúng trang vào iframe rộng 390px, file tạm đặt trong `dist/`.
  Xoá sau khi xong.
- `--virtual-time-budget` đóng băng transition → chèn `*{transition:none!important}` khi chụp.
- `TaskStop` không kill được tiến trình node con → sau khi stop kiểm tra cổng 8484 / 4173
  (`Get-NetTCPConnection -LocalPort 8484 -State Listen`) và `Stop-Process` tiến trình `vite.js` còn sót.

# CLAUDE.md

Hướng dẫn cho Claude Code khi làm việc trong repo này.

## Tổng quan

**VIEREC_FE** là frontend cho website **quản lý môi trường** (VIEREC). SPA dựng bằng React 19 + TypeScript (strict) + Vite 8. Backend là service riêng, gọi qua REST dưới prefix `/api`.

> **Quy tắc bắt buộc với Claude:** Khi làm việc, nếu phát hiện hoặc thống nhất được điểm quan trọng (quy ước mới, quyết định kiến trúc, nghiệp vụ, API contract, cạm bẫy, lệnh hay dùng...), hãy **chủ động cập nhật file này** — vào đúng mục bên dưới, hoặc mục [Nhật ký quyết định](#nhật-ký-quyết-định). Giữ nội dung ngắn gọn, không lặp lại những gì đã rõ từ code.

## Lệnh thường dùng

```bash
npm run dev              # dev server http://localhost:3000, proxy /api -> VITE_API_PROXY_TARGET
npm run build            # tsc -b && vite build
npm run typecheck
npm run lint             # oxlint (lint:fix để tự sửa)
npm run format           # prettier --write .
npm run test:run         # vitest chạy 1 lần
npx vitest run src/utils/cn.test.ts   # chạy 1 file test
npm run validate         # typecheck + lint + format:check + test — chạy trước khi báo xong việc
```

- Node >= 22 (`.nvmrc` = 24). Môi trường dev chính là Windows — dùng đường dẫn/lệnh tương thích.
- Env: copy `.env.example` → `.env.development`. Biến client phải có tiền tố `VITE_`, khai báo kiểu ở [src/vite-env.d.ts](src/vite-env.d.ts), **chỉ đọc qua** [src/config/env.ts](src/config/env.ts) (không dùng `import.meta.env` rải rác).

## Kiến trúc

```
src/
├── app/            # app.tsx, providers.tsx, router.tsx, query-client.ts
├── assets/images/  # logo.jpg, banner.jpg (import trong code)
├── components/
│   ├── common/     # UI primitive: Button, ButtonLink, IconButton, Container, SectionHeader, StatCard, Alert
│   ├── form/       # FormField, TextField, PasswordField (bật/tắt hiện mật khẩu), fieldA11y
│   ├── brand/      # Logo (variant full | compact)
│   ├── icons/      # icon thương hiệu (Facebook, YouTube, LinkedIn) — lucide không có
│   └── shared/     # khối chức năng: SearchBox, LanguageSwitcher, EmergencyReportButton
├── config/         # env.ts
├── constants/      # routes.ts, navigation.ts (MAIN_NAV), contact.ts, storage-keys.ts
├── hooks/          # custom hooks dùng chung
├── layouts/
│   └── user/       # UserLayout, SiteHeader, MainNav, SiteFooter
├── pages/<page>/   # <page>-page.tsx (default export, lazy) + components/ + use-*.ts riêng của trang
├── schemas/        # zod schema + rule validate dùng chung (user-schema.ts)
├── services/       # http.ts (axios instance) + các API service (auth-service.ts)
├── stores/         # Zustand stores
├── styles/         # index.css: design token + reset
├── test/           # setup.ts cho Vitest
├── types/          # api.ts, navigation.ts (NavItem), content.ts (Stat, Category, NewsItem, Partner), user.ts
└── utils/          # cn, storage, format-date
```

### Phân tầng tái sử dụng (user ↔ admin)

Trang admin sẽ làm sau với layout riêng nhưng **dùng chung nền tảng**. Khi thêm code, đặt đúng tầng:

| Tầng                               | Dùng cho     | Quy tắc                                                                            |
| ---------------------------------- | ------------ | ---------------------------------------------------------------------------------- |
| `styles/index.css` (token)         | user + admin | Màu/radius/shadow/font chỉ lấy từ biến CSS, không hard-code mã màu rải rác         |
| `components/common/`               | user + admin | Chỉ nhận props, **không chứa text nghiệp vụ**, không gọi API                       |
| `components/form/`                 | user + admin | Field của form; mọi form dùng các field này, không tự viết `<input>` + label       |
| `schemas/`                         | user + admin | Rule validate từng field (`userFieldRules`) — form admin tạo/sửa học viên dùng lại |
| `components/brand/`, `icons/`      | user + admin |                                                                                    |
| `components/shared/`               | user + admin | Khối có chức năng (tìm kiếm, ngôn ngữ, nút báo sự cố)                              |
| `types/`                           | user + admin | Kiểu nghiệp vụ đặt ở đây (admin CRUD dùng lại), không khai báo trong page          |
| `layouts/user/` / `layouts/admin/` | riêng        | Không import chéo giữa hai layout                                                  |
| `pages/<page>/components/`         | riêng trang  | Không import chéo giữa các page; cần dùng lại ở chỗ khác → chuyển lên tầng trên    |

### Trang admin (dự kiến)

Đã chuẩn bị sẵn:

- `NavItem.children?` ([types/navigation.ts](src/types/navigation.ts)) cho sidebar nhiều cấp — tạo `ADMIN_NAV: NavItem[]` cùng kiểu với `MAIN_NAV`.
- `StatCard variant="card"` cho KPI dashboard; `SectionHeader` có slot `action` (nút "Thêm mới").
- `Logo variant="compact"` cho sidebar thu gọn.
- Router có comment chỗ gắn nhánh `/admin` → `AdminLayout` (lazy + guard phân quyền); dự trù `ADMIN_ROUTES` trong [routes.ts](src/constants/routes.ts).
- `formatDate()` ([utils/format-date.ts](src/utils/format-date.ts)) dùng cho bảng dữ liệu.
- Form học viên: ghép `userFieldRules` ([user-schema.ts](src/schemas/user-schema.ts)) + `TextField`/`PasswordField`/`Alert`; form sửa thì bỏ `password`.
- Nav/SearchBox/LanguageSwitcher hiện chỉ là UI (tìm kiếm điều hướng tới `ROUTES.SEARCH?q=`, chưa có trang; chưa i18n).

### Luồng dữ liệu

- **Server state → TanStack Query.** Không lưu dữ liệu từ API vào Zustand. Mặc định: `staleTime 60s`, `retry 1`, không refetch khi focus ([query-client.ts](src/app/query-client.ts)).
- **Client/UI state → Zustand** ([stores/](src/stores/)). Cần lưu lâu dài thì dùng middleware `persist` với key trong `STORAGE_KEYS`.
- **HTTP → `http`** từ [services/http.ts](src/services/http.ts). Không tạo axios instance mới, không dùng `fetch` trực tiếp.
  - Request interceptor tự gắn `Authorization: Bearer <token>` từ `STORAGE_KEYS.ACCESS_TOKEN`.
  - Response interceptor **chuẩn hoá mọi lỗi thành `ApiError`** (`{ status, message, details }`, xem [types/api.ts](src/types/api.ts)); `status = 0` là lỗi mạng/timeout. 401 → xoá token.
  - Kiểu response dùng chung: `ApiResponse<T>`, `PaginatedResponse<T>`.
- **Routing:** React Router v8, `createBrowserRouter` trong [router.tsx](src/app/router.tsx). Page được lazy-load (`lazy: async () => ({ Component: (await import(...)).default })`). Path khai báo trong [constants/routes.ts](src/constants/routes.ts) — không hard-code chuỗi path.
- **localStorage:** chỉ qua `storage` ([utils/storage.ts](src/utils/storage.ts), đã try/catch + JSON). Key đặt trong `STORAGE_KEYS`, tiền tố `vierec.`.

## Quy ước code

- **Tên file** `kebab-case` (`user-layout.tsx`, `use-document-title.ts`). Hook bắt đầu bằng `use-`.
- **Export:** page dùng `export default` (phục vụ lazy route); mọi thứ khác dùng **named export**.
- **Import:** luôn dùng alias `@/` (không dùng `../`). Ngoại lệ duy nhất: CSS Module cùng thư mục import tương đối `import styles from './x.module.css'`. Thứ tự: thư viện ngoài → dòng trống → `@/...` → dòng trống → `./*.module.css`. Import kiểu phải dùng `import type` (bắt buộc bởi `verbatimModuleSyntax` + oxlint).
- **TypeScript:** strict + `noUncheckedIndexedAccess` (truy cập mảng/record trả về `T | undefined` — phải kiểm tra) + `erasableSyntaxOnly` (**không dùng `enum`, `namespace`, parameter properties** — dùng object `as const` + union type như `ROUTES`). Hạn chế `any`.
- **Hằng số** dạng object `SCREAMING_CASE` + `as const`.
- **Style: CSS Modules** — mỗi component một file `<tên>.module.css` cạnh nó; class camelCase; ghép class bằng `cn()`. [styles/index.css](src/styles/index.css) chỉ chứa design token (`--color-primary` xanh dương, `--color-secondary` xanh lá, `--color-accent` cam, `--color-danger` đỏ, `--radius*`, `--shadow*`, `--gutter`...) + reset + tiện ích `.sr-only`. Không thêm class toàn cục mới. Chưa có UI library.
  - Responsive mobile-first, breakpoint: 640 / 768 / 1024 / 1280px. Menu chính chuyển sang hamburger dưới 1280px. Luôn kiểm tra không có cuộn ngang ở 390px.
  - Style của component con (vd. `CategoryCard`) có thể dùng chung file module với component cha trong cùng thư mục.
- **Icon:** `lucide-react` (import từng icon, kiểu `LucideIcon`). Icon thương hiệu tự viết SVG trong `components/icons/`.
- **Font:** Be Vietnam Pro (Google Fonts, nạp trong [index.html](index.html)).
- **Nút:** `Button` (thẻ `<button>`) và `ButtonLink` (bọc `Link`) dùng chung `buttonClass()` ([button-class.ts](src/components/common/button-class.ts)); variant `primary | secondary | accent | danger | outline | light | ghost`, size `sm | md | lg`. Link điều hướng dùng `ButtonLink`, không bọc `<button>` trong `<Link>`.
- **A11y:** section có `aria-labelledby` trỏ tới heading; nút chỉ có icon dùng `IconButton` (bắt buộc `label`); icon trang trí `aria-hidden`. Oxlint bật `jsx-a11y` (vd. dùng thẻ `<search>` thay `role="search"`).
- **Prettier:** không dấu chấm phẩy, nháy đơn, `trailingComma: all`, `printWidth 100`, LF.
- **Lint (oxlint):** `eqeqeq`, `import/no-cycle` là error; `no-console` chỉ cho phép `console.warn/error`.
- **Tiêu đề trang:** gọi `useDocumentTitle('...')` trong mỗi page.

### Form

- **react-hook-form + zod** (`@hookform/resolvers/zod`). Schema đặt trong `src/schemas/`, không viết validate trong component.
- `useForm<z.input<S>, unknown, z.output<S>>({ resolver: zodResolver(schema), mode: 'onTouched', defaultValues })` — báo lỗi khi rời ô, sau đó cập nhật theo từng lần gõ; submit rỗng thì báo lỗi tất cả và focus ô lỗi đầu tiên.
- Field form dùng camelCase; map sang payload snake_case của backend bằng hàm riêng (vd. `toRegisterPayload`).
- Thông báo lỗi tiếng Việt, cụ thể ("Số CCCD phải gồm đúng 12 chữ số"). Text trim, **mật khẩu không trim**.
- zod 4: `.refine()` ở cấp object mặc định **không chạy khi field khác còn lỗi** → so khớp field (vd. nhập lại mật khẩu) phải truyền `when`. Đổi mật khẩu thì `trigger('confirmPassword')` nếu ô nhập lại đã có giá trị.
- Form gắn `noValidate` (dùng validate của zod, không dùng bubble của trình duyệt). Khi submit: `<fieldset disabled>` + nút hiện spinner. Lỗi server hiển thị bằng `Alert variant="error"`.
- Gọi API bằng `useMutation`, hook đặt trong page (`pages/register/use-register.ts`).

## Test

- Vitest + Testing Library + jsdom, `globals: true` (dùng `describe/it/expect/vi` không cần import).
- File test đặt **cạnh file nguồn**: `*.test.ts(x)`.
- Ưu tiên query theo role/label (`screen.getByRole`) và `userEvent` thay cho `fireEvent`.
- Component dùng `Link`/`NavLink` phải bọc trong `<MemoryRouter>` khi test.
- `css: true` → CSS Module được áp dụng trong jsdom, nhưng media query desktop **không khớp** (jsdom coi như màn hẹp). Vd. menu chính bị `display: none` cho tới khi bấm nút hamburger — test phải mở menu trước khi query link.
- **Cạm bẫy môi trường:** `vitest run` thỉnh thoảng crash worker (exit code `3221226505` / panic của rolldown) trên máy Windows này — không phải lỗi code. Chạy lại; nếu vẫn lỗi, chạy từng file `npx vitest run <file>` để khoanh vùng.
- Test component có `useMutation` phải bọc `QueryClientProvider` (tạo `QueryClient` mới mỗi test, `retry: false`); mock API bằng `vi.spyOn(authService, 'register')`.
- Query input theo nhãn: label field bắt buộc có thêm `*` → dùng regex `^Nhãn\s*\*?$`, không dùng `exact: false` (khớp chuỗi con, vd. "Tên" trùng "Tên đăng nhập").
- Kiểm tra giao diện: `npm run build && npx vite preview`, chụp bằng Chrome headless (`chrome --headless=new --screenshot --window-size=...`).
  - Chrome headless không cho cửa sổ hẹp hơn ~500px → muốn xem 390px thì nhúng trang vào iframe rộng 390px, file khung đặt tạm trong `dist/` (cùng origin nên script còn click được vào trang, vd. bấm submit để chụp trạng thái lỗi). Xoá file tạm sau khi xong.
  - `--virtual-time-budget` đóng băng CSS transition → màu sau transition (vd. viền đỏ khi lỗi) không lên ảnh. Chèn `*{transition:none!important}` vào trang khi chụp.
  - Chạy `npm run dev` / `vite preview` bằng background task: `TaskStop` **không kill được tiến trình node con** (Vite vẫn giữ cổng) → sau khi stop luôn kiểm tra cổng 3000 / 4173 (`Get-NetTCPConnection -LocalPort 3000 -State Listen`) và `Stop-Process` tiến trình `vite.js` còn sót.

## Git

- Conventional Commits (commitlint): `feat:`, `fix(scope):`, `chore:`, `refactor:`, `test:`, `docs:`...
- Husky pre-commit chạy lint-staged (oxlint --fix + prettier trên file đã stage). Không bỏ qua hook (`--no-verify`).

## Nghiệp vụ (quản lý môi trường)

VIEREC = **Trung tâm Ứng phó sự cố môi trường Việt Nam** (Vietnam Environmental Incident Response Center). Sản phẩm web là **VIEREC Academy**: đào tạo an toàn – ứng phó sự cố – phát triển bền vững, cho cá nhân và doanh nghiệp. Slogan: "An toàn hôm nay – Phát triển bền vững ngày mai".

Màn hình đã có:

- **Trang chủ user** (`/`) — dữ liệu **tĩnh tạm thời** trong [home-data.ts](src/pages/home/home-data.ts). Khi có API: thay bằng service + query hook, giữ nguyên kiểu trong `types/content.ts` để component không phải sửa.
- **Đăng ký học viên** (`/dang-ky`) — [register-page.tsx](src/pages/register/register-page.tsx). Bắt buộc hiển thị lưu ý: _"Vì chứng chỉ cho mỗi học viên là duy nhất, học viên đăng ký vui lòng nhập đúng thông tin để không mất quyền lợi"_. Rule validate (tất cả bắt buộc):
  - CCCD: đúng 12 chữ số · SĐT: đúng 10 chữ số · Email: đúng định dạng.
  - Mật khẩu: ≥ 8 ký tự và có ≥ 1 ký tự đặc biệt (ký tự không phải chữ/số/khoảng trắng). Nhập lại mật khẩu phải khớp. Có nút bật/tắt hiện mật khẩu.
  - Ngày sinh: ngày có thật, không ở tương lai (Claude tự thêm, chưa có yêu cầu độ tuổi tối thiểu).
  - Thứ tự tên kiểu Việt: ô "Họ và tên đệm" (`last_name`) trước ô "Tên" (`first_name`).
- Các path khác trong `ROUTES` (đăng nhập, khóa học...) chưa có trang → rơi vào NotFound.

Ảnh thiết kế gợi ý nằm ở `design/` (chỉ tham khảo, không bắt buộc giống 100%). Ảnh thật chưa có → placeholder gradient/icon; kiểu dữ liệu có trường `image?` / `logo?` để thay sau.

| Thuật ngữ            | Tiếng Anh / tên trong code  | Ghi chú                                                             |
| -------------------- | --------------------------- | ------------------------------------------------------------------- |
| Lĩnh vực đào tạo     | `Category`                  | ATLĐ, hóa chất, ứng phó sự cố, môi trường, PCCC, điện, HSE, pháp lý |
| Báo sự cố khẩn cấp   | `EMERGENCY_REPORT`          | Nút đỏ nổi bật, luôn hiện trên menu                                 |
| Ứng phó sự cố        | `INCIDENT_RESPONSE`         |                                                                     |
| HSE                  | Health, Safety, Environment |                                                                     |
| PCCC                 | Fire safety (`fire-safety`) | Phòng cháy chữa cháy                                                |
| Đối tác & Khách hàng | `Partner`                   |                                                                     |
| Học viên             | `User`                      | Tài khoản đăng ký qua `/dang-ky`                                    |
| CCCD                 | `cccd`                      | Căn cước công dân, 12 số — định danh chứng chỉ                      |

## API backend

_Bổ sung khi có thông tin: base URL từng môi trường, cơ chế auth (login/refresh token), format response thực tế, quy ước phân trang/lọc/sắp xếp, link tài liệu Swagger/OpenAPI._

Endpoint FE đang **giả định** (chưa xác nhận với backend):

| Chức năng | Request                                                                                                                                 | Response giả định   |
| --------- | --------------------------------------------------------------------------------------------------------------------------------------- | ------------------- |
| Đăng ký   | `POST /auth/register` — `{ username, password, first_name, last_name, cccd, date_of_birth (YYYY-MM-DD), address, phone_number, email }` | `ApiResponse<User>` |

- Bảng user phía backend có cột `password_hash`: FE gửi **mật khẩu thô qua HTTPS** trong field `password`, backend hash. FE không tự hash.
- Lỗi theo từng field từ backend (vd. trùng username/CCCD/email) chưa có format → hiện chỉ hiển thị `message` trong Alert. Khi backend chốt format, map vào `setError` của react-hook-form để hiện dưới đúng ô.

## Nhật ký quyết định

Ghi các quyết định/cạm bẫy quan trọng, mới nhất ở trên. Định dạng: `YYYY-MM-DD — nội dung (lý do)`.

- 2026-09-25 — Làm trang Đăng ký: thêm `react-hook-form`, `zod` (v4), `@hookform/resolvers` (form admin sau này sẽ nhiều, cần cách làm thống nhất); tạo tầng `components/form/` và `schemas/` dùng chung.
- 2026-09-25 — Làm trang chủ user: CSS Modules thay CSS toàn cục BEM; thêm `lucide-react`; dữ liệu tĩnh; chia tầng component để tái dùng cho admin (xem "Phân tầng tái sử dụng"). `MainLayout` đổi thành `layouts/user/user-layout.tsx`.
- 2026-09-25 — `logo.jpg` (1408×768) có nhiều nền trắng → `Logo` cắt vùng biểu tượng bằng CSS (tọa độ trong [logo.module.css](src/components/brand/logo.module.css)). `logo.jpg` 278 KB, `banner.jpg` 752 KB — **cần bản logo PNG/SVG đã crop và nén banner (WebP)** trước khi lên production.
- 2026-09-25 — Khởi tạo CLAUDE.md từ scaffold ban đầu (React 19, Vite 8, TanStack Query, Zustand, Axios, React Router v8, Oxlint).

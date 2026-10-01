# VIEREC_FE

Frontend của dự án VIEREC, xây dựng bằng **React 19 + TypeScript + Vite**.

## Tech stack

| Mục đích      | Thư viện                                   |
| ------------- | ------------------------------------------ |
| Build / dev   | Vite 8                                     |
| UI            | React 19, TypeScript (strict)              |
| Routing       | React Router (lazy routes)                 |
| Server state  | TanStack Query                             |
| Client state  | Zustand                                    |
| HTTP          | Axios (interceptors: token, chuẩn hoá lỗi) |
| Test          | Vitest, Testing Library, jsdom             |
| Lint / format | Oxlint, Prettier, EditorConfig             |
| Git hooks     | Husky, lint-staged, commitlint             |

## Yêu cầu

- Node.js >= 22 (khuyến nghị 24, xem `.nvmrc`)
- npm >= 10

## Bắt đầu

```bash
npm install
cp .env.example .env.development   # chỉnh lại nếu cần
npm run dev                        # http://localhost:8484
```

## Scripts

| Lệnh                    | Mô tả                                             |
| ----------------------- | ------------------------------------------------- |
| `npm run dev`           | Chạy dev server                                   |
| `npm run build`         | Type-check + build production                     |
| `npm run build:staging` | Build với `.env.staging`                          |
| `npm run preview`       | Xem thử bản build                                 |
| `npm run typecheck`     | Kiểm tra kiểu TypeScript                          |
| `npm run lint`          | Lint bằng Oxlint (`lint:fix` để tự sửa)           |
| `npm run format`        | Format bằng Prettier (`format:check` để kiểm tra) |
| `npm test`              | Chạy test ở chế độ watch                          |
| `npm run test:coverage` | Chạy test + báo cáo coverage                      |
| `npm run validate`      | typecheck + lint + format + test (dùng cho CI)    |

## Biến môi trường

Mọi biến dùng trong client phải có tiền tố `VITE_`. Khai báo kiểu trong `src/vite-env.d.ts`, truy cập qua `src/config/env.ts`.

| Biến                    | Mô tả                                                       |
| ----------------------- | ----------------------------------------------------------- |
| `VITE_APP_NAME`         | Tên ứng dụng                                                |
| `VITE_PORT`             | Cổng dev server (mặc định 8484)                             |
| `VITE_API_BASE_URL`     | Base URL cho Axios (mặc định `/api/v1`)                     |
| `VITE_API_PROXY_TARGET` | Proxy `/api` tới backend (mặc định `http://localhost:8383`) |
| `VITE_API_TIMEOUT`      | Timeout request (ms)                                        |

## Cấu trúc thư mục

```
src/
├── app/            # App root, providers, router, query client
├── assets/         # Ảnh, font, ... được import trong code
├── components/     # Component dùng chung (common/, ...)
├── config/         # Đọc & chuẩn hoá biến môi trường
├── constants/      # Hằng số: routes, storage keys, ...
├── hooks/          # Custom hooks dùng chung
├── layouts/        # Layout trang
├── pages/          # Mỗi trang một thư mục, lazy-load qua router
├── services/       # HTTP client và các API service
├── stores/         # Zustand stores
├── styles/         # CSS toàn cục
├── test/           # Cấu hình test
├── types/          # Kiểu dùng chung
└── utils/          # Hàm tiện ích
```

Quy ước:

- Tên file dạng `kebab-case` (`main-layout.tsx`, `use-document-title.ts`).
- Import tuyệt đối qua alias `@/` (ví dụ `import { http } from '@/services/http'`).
- Test đặt cạnh file nguồn: `*.test.ts(x)`.

## Quy ước commit

Dùng [Conventional Commits](https://www.conventionalcommits.org/), được kiểm tra bởi commitlint:

```
feat: thêm trang đăng nhập
fix(auth): sửa lỗi refresh token
chore: cập nhật dependencies
```

Trước mỗi commit, `lint-staged` tự chạy Oxlint + Prettier trên các file đã stage.

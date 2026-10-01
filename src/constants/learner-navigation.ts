import {
  Award,
  BookOpenCheck,
  LayoutDashboard,
  ReceiptText,
  SquarePen,
  UserRound,
} from 'lucide-react'

import { LEARNER_ROUTES } from '@/constants/routes'
import type { NavItem } from '@/types/navigation'

/** Menu góc học viên; `description` hiện ở thẻ lối tắt trang Tổng quan. */
export const LEARNER_NAV: NavItem[] = [
  { label: 'Tổng quan', path: LEARNER_ROUTES.OVERVIEW, icon: LayoutDashboard },
  {
    label: 'Khoá học của tôi',
    path: LEARNER_ROUTES.MY_COURSES,
    icon: BookOpenCheck,
    description: 'Các khoá bạn đã đăng ký: chờ duyệt, đang học và đã hoàn thành.',
  },
  {
    label: 'Đăng ký khoá học',
    path: LEARNER_ROUTES.ENROLL,
    icon: SquarePen,
    description: 'Tìm khoá học đang mở, chuyển khoản học phí qua mã QR.',
  },
  {
    label: 'Lịch sử thanh toán',
    path: LEARNER_ROUTES.PAYMENTS,
    icon: ReceiptText,
    description: 'Các khoản học phí bạn đã chuyển và trạng thái xác nhận.',
  },
  {
    label: 'Chứng chỉ',
    path: LEARNER_ROUTES.CERTIFICATES,
    icon: Award,
    description: 'Chứng chỉ bạn nhận được sau khi hoàn thành khoá học.',
  },
  {
    label: 'Hồ sơ cá nhân',
    path: LEARNER_ROUTES.PROFILE,
    icon: UserRound,
    description: 'Thông tin cá nhân dùng để cấp chứng chỉ, đổi mật khẩu.',
  },
]

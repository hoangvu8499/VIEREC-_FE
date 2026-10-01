import { BadgeCheck, BookOpen, LayoutDashboard, MapPinned, ShieldCheck, Users } from 'lucide-react'

import { ADMIN_ROUTES } from '@/constants/routes'
import type { NavItem } from '@/types/navigation'

/** Mọi mục hiện cho cả ADMIN và SUPER_ADMIN (chủ project chốt) — giới hạn thêm thì dùng `roles`. */
export const ADMIN_NAV: NavItem[] = [
  { label: 'Tổng quan', path: ADMIN_ROUTES.DASHBOARD, icon: LayoutDashboard },
  {
    label: 'Khoá học',
    path: ADMIN_ROUTES.COURSES,
    icon: BookOpen,
    description: 'Tạo, sắp xếp và xuất bản khoá học theo từng lĩnh vực đào tạo.',
  },
  {
    label: 'Duyệt đăng ký',
    path: ADMIN_ROUTES.ENROLLMENT_REQUESTS,
    icon: BadgeCheck,
    description: 'Đối chiếu chuyển khoản và mở khoá học cho học viên đã thanh toán.',
  },
  {
    label: 'Điểm hỗ trợ sự cố',
    path: ADMIN_ROUTES.SUPPORT_POINTS,
    icon: MapPinned,
    description: 'Quản lý mạng lưới điểm hỗ trợ và đơn vị xử lý sự cố môi trường.',
  },
  {
    label: 'Người dùng',
    path: ADMIN_ROUTES.USERS,
    icon: Users,
    description: 'Tạo, cập nhật, khoá tài khoản học viên và quản trị viên, gán vai trò.',
  },
  {
    label: 'Phân quyền',
    path: ADMIN_ROUTES.PERMISSIONS,
    icon: ShieldCheck,
    description: 'Gán vai trò quản trị viên và kiểm soát quyền truy cập.',
  },
]

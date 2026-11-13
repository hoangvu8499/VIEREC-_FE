import { Award, CalendarPlus, LayoutDashboard } from 'lucide-react'

import { BUSINESS_ROUTES } from '@/constants/routes'
import type { NavItem } from '@/types/navigation'

/** Menu Góc doanh nghiệp (người quản lý doanh nghiệp, role BUSINESS). */
export const BUSINESS_NAV: NavItem[] = [
  { label: 'Học viên', path: BUSINESS_ROUTES.OVERVIEW, icon: LayoutDashboard },
  { label: 'Đăng ký khoá học', path: BUSINESS_ROUTES.ENROLL, icon: CalendarPlus },
  { label: 'Chứng chỉ', path: BUSINESS_ROUTES.CERTIFICATES, icon: Award },
]

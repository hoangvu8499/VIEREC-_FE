import {
  Building2,
  GraduationCap,
  House,
  Info,
  Library,
  Mail,
  Newspaper,
  TriangleAlert,
  Users,
} from 'lucide-react'

import { ROUTES } from '@/constants/routes'
import type { NavItem } from '@/types/navigation'

export const MAIN_NAV: NavItem[] = [
  { label: 'Trang chủ', path: ROUTES.HOME, icon: House },
  { label: 'Khóa học', path: ROUTES.COURSES, icon: GraduationCap },
  { label: 'Ứng phó sự cố', path: ROUTES.INCIDENT_RESPONSE, icon: TriangleAlert },
  { label: 'Dành cho doanh nghiệp', path: ROUTES.ENTERPRISE, icon: Building2 },
  { label: 'Thư viện', path: ROUTES.LIBRARY, icon: Library },
  { label: 'Giảng viên', path: ROUTES.INSTRUCTORS, icon: Users },
  { label: 'Về VIEREC', path: ROUTES.ABOUT, icon: Info },
  { label: 'Tin tức', path: ROUTES.NEWS, icon: Newspaper },
  { label: 'Liên hệ', path: ROUTES.CONTACT, icon: Mail },
]

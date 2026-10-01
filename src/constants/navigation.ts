import { Building2, GraduationCap, House, Info, MapPinned, TriangleAlert } from 'lucide-react'

import { ROUTES } from '@/constants/routes'
import type { NavItem } from '@/types/navigation'

export const MAIN_NAV: NavItem[] = [
  { label: 'Trang chủ', path: ROUTES.HOME, icon: House },
  { label: 'Khóa học', path: ROUTES.COURSES, icon: GraduationCap },
  { label: 'Ứng phó sự cố', path: ROUTES.INCIDENT_RESPONSE, icon: TriangleAlert },
  { label: 'Tìm đơn vị xử lý sự cố', path: ROUTES.FIND_RESPONDERS, icon: MapPinned },
  { label: 'Dành cho doanh nghiệp', path: ROUTES.ENTERPRISE, icon: Building2 },
  { label: 'Về VIEREC', path: ROUTES.ABOUT, icon: Info },
]

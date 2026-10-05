import {
  BookOpen,
  Building2,
  FileText,
  Flame,
  FlaskConical,
  HardHat,
  Leaf,
  ShieldCheck,
  Siren,
  Users,
  Zap,
} from 'lucide-react'

import { ROUTES } from '@/constants/routes'
import type { Category, NewsItem, Partner, Service, Stat } from '@/types/content'

// Dữ liệu tĩnh tạm thời theo thiết kế. Khi có API: thay bằng service + query hook,
// giữ nguyên kiểu dữ liệu để component không phải sửa.

export const HERO_STATS: Stat[] = [
  { id: 'students', value: '10.000+', label: 'Học viên', icon: Users },
  { id: 'courses', value: '200+', label: 'Khóa học', icon: BookOpen },
  { id: 'enterprises', value: '500+', label: 'Doanh nghiệp', icon: Building2 },
  { id: 'satisfaction', value: '95%', label: 'Hài lòng', icon: ShieldCheck },
]

export const CATEGORIES: Category[] = [
  {
    id: 'occupational-safety',
    name: 'An toàn lao động',
    path: ROUTES.COURSES,
    icon: HardHat,
    color: 'var(--color-accent)',
  },
  {
    id: 'chemical-safety',
    name: 'An toàn hóa chất',
    path: ROUTES.COURSES,
    icon: FlaskConical,
    color: 'var(--color-primary)',
  },
  {
    id: 'incident-response',
    name: 'Ứng phó sự cố',
    path: ROUTES.INCIDENT_RESPONSE,
    icon: Siren,
    color: 'var(--color-danger)',
  },
  {
    id: 'environment',
    name: 'Môi trường',
    path: ROUTES.COURSES,
    icon: Leaf,
    color: 'var(--color-secondary)',
  },
  {
    id: 'fire-safety',
    name: 'PCCC',
    path: ROUTES.COURSES,
    icon: Flame,
    color: 'var(--color-accent)',
  },
  {
    id: 'electrical-safety',
    name: 'An toàn điện',
    path: ROUTES.COURSES,
    icon: Zap,
    color: 'var(--color-primary)',
  },
  {
    id: 'hse',
    name: 'HSE doanh nghiệp',
    path: ROUTES.ENTERPRISE,
    icon: Building2,
    color: 'var(--color-secondary)',
  },
  {
    id: 'legal',
    name: 'Pháp lý & tiêu chuẩn',
    path: ROUTES.LIBRARY,
    icon: FileText,
    color: 'var(--color-primary)',
  },
]

export const SERVICES: Service[] = [
  {
    id: 'emergency',
    icon: Siren,
    title: 'Báo sự cố khẩn cấp 24/7',
    description: 'Kết nối nhanh với Trung tâm Ứng phó sự cố VIEREC khi có sự cố môi trường.',
    path: ROUTES.EMERGENCY_REPORT,
    action: 'Gửi thông tin ngay',
    urgent: true,
  },
  {
    id: 'enterprise',
    icon: Building2,
    title: 'Giải pháp cho doanh nghiệp',
    description: 'Đào tạo, quản lý chứng chỉ và nâng cao năng lực HSE cho đội ngũ của bạn.',
    path: ROUTES.ENTERPRISE,
    action: 'Xem giải pháp',
  },
  {
    id: 'esg',
    icon: Leaf,
    title: 'Đồng hành ESG',
    description: 'Cùng doanh nghiệp hướng tới mục tiêu ESG và phát triển bền vững.',
    path: ROUTES.ABOUT,
    action: 'Tìm hiểu thêm',
  },
]

export const NEWS: NewsItem[] = [
  {
    id: 'chemical-safety-seminar',
    title: 'Hội thảo An toàn hóa chất trong doanh nghiệp công nghiệp',
    publishedAt: '2026-09-20',
    path: ROUTES.NEWS,
  },
  {
    id: 'hse-training-da-nang',
    title: 'Chương trình đào tạo HSE cho doanh nghiệp Đà Nẵng',
    publishedAt: '2026-09-15',
    path: ROUTES.NEWS,
  },
  {
    id: 'chemical-spill-lessons',
    title: 'Ứng phó sự cố tràn đổ hóa chất – Bài học thực tiễn',
    publishedAt: '2026-09-10',
    path: ROUTES.NEWS,
  },
]

export const PARTNERS: Partner[] = [
  { id: 'petrovietnam', name: 'PetroVietnam' },
  { id: 'evn', name: 'EVN' },
  { id: 'vinamilk', name: 'Vinamilk' },
  { id: 'hoa-phat', name: 'Hòa Phát' },
  { id: 'samsung', name: 'Samsung' },
]

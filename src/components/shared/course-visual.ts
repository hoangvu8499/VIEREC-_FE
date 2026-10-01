import {
  Droplets,
  Flame,
  FlaskConical,
  GraduationCap,
  HardHat,
  HeartPulse,
  Leaf,
  Scale,
  Siren,
  Zap,
  type LucideIcon,
} from 'lucide-react'

export type CourseTone = 'primary' | 'secondary' | 'accent' | 'danger'

export interface CourseVisual {
  icon: LucideIcon
  tone: CourseTone
  /** Tên lĩnh vực hiện trên ảnh bìa. */
  label: string
}

/**
 * Backend chưa có lĩnh vực / ảnh bìa cho khoá học → đoán từ tên khoá (từ khoá không dấu).
 * Thứ tự quan trọng: mục cụ thể đứng trước (vd. "sự cố hoá chất" → hoá chất).
 */
const RULES: { keywords: string[]; visual: CourseVisual }[] = [
  {
    keywords: ['pccc', 'chay', 'thoat nan'],
    visual: { icon: Flame, tone: 'accent', label: 'PCCC' },
  },
  {
    keywords: ['hoa chat'],
    visual: { icon: FlaskConical, tone: 'primary', label: 'An toàn hoá chất' },
  },
  {
    keywords: ['tran dau', 'dau tran', 'dau mo'],
    visual: { icon: Droplets, tone: 'primary', label: 'Ứng phó sự cố' },
  },
  {
    keywords: ['su co', 'ung pho'],
    visual: { icon: Siren, tone: 'danger', label: 'Ứng phó sự cố' },
  },
  { keywords: ['dien'], visual: { icon: Zap, tone: 'accent', label: 'An toàn điện' } },
  {
    keywords: ['cap cuu', 'y te', 'suc khoe'],
    visual: { icon: HeartPulse, tone: 'danger', label: 'Sơ cấp cứu' },
  },
  {
    keywords: ['phap luat', 'luat', 'quy dinh'],
    visual: { icon: Scale, tone: 'primary', label: 'Pháp lý' },
  },
  {
    keywords: ['moi truong', 'chat thai', 'nuoc thai', 'khong khi', 'quan trac'],
    visual: { icon: Leaf, tone: 'secondary', label: 'Môi trường' },
  },
  {
    keywords: ['lao dong', 'hse', 'an toan'],
    visual: { icon: HardHat, tone: 'secondary', label: 'An toàn lao động' },
  },
]

const DEFAULT_VISUAL: CourseVisual = { icon: GraduationCap, tone: 'primary', label: 'Khoá học' }

/** "Phòng cháy chữa cháy" → "phong chay chua chay". */
function normalize(text: string): string {
  return text
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .replace(/đ/gi, 'd')
    .toLowerCase()
}

export function courseVisual(courseName: string): CourseVisual {
  const name = ` ${normalize(courseName)} `
  const rule = RULES.find(({ keywords }) =>
    keywords.some((keyword) => new RegExp(`\\b${keyword}\\b`).test(name)),
  )
  return rule?.visual ?? DEFAULT_VISUAL
}

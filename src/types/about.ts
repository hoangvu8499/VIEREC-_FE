import type { LucideIcon } from 'lucide-react'

/** Nội dung trang "Về VIEREC" (lấy từ hồ sơ năng lực). */

export interface CoreValue {
  id: string
  icon: LucideIcon
  label: string
}

export interface StrategicGoal {
  id: string
  title: string
  items: string[]
}

export interface Photo {
  src: string
  alt: string
}

export interface Capability {
  id: string
  title: string
  description: string
  photos: Photo[]
}

export interface TeamMember {
  id: string
  name: string
  photo: string
  /** Chức vụ (Ban giám đốc); chuyên gia không có. */
  position?: string
  degree: string
  major: string
}

export interface LegalDocument {
  id: string
  title: string
  number: string
  issuedBy: string
  /** Ngày đăng ký lần đầu, ISO `YYYY-MM-DD`. */
  firstRegisteredAt: string
}

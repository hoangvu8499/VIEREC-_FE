import type { LucideIcon } from 'lucide-react'

/** Kiểu nội dung dùng chung: trang user hiển thị, trang admin quản lý (CRUD). */

export interface Stat {
  id: string
  value: string
  label: string
  icon: LucideIcon
}

export interface Category {
  id: string
  name: string
  path: string
  icon: LucideIcon
  /** Màu icon (CSS color / token). */
  color: string
}

export interface NewsItem {
  id: string
  title: string
  /** ISO date `YYYY-MM-DD`. */
  publishedAt: string
  path: string
  image?: string
}

export interface Partner {
  id: string
  name: string
  logo?: string
  url?: string
}

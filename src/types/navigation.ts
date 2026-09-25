import type { LucideIcon } from 'lucide-react'

/** Mục menu — dùng chung cho menu user (MAIN_NAV) và sidebar admin. */
export interface NavItem {
  label: string
  path: string
  icon?: LucideIcon
  /** Menu con (sidebar admin nhiều cấp). */
  children?: NavItem[]
}

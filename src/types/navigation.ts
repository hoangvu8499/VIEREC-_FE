import type { LucideIcon } from 'lucide-react'

/** Mục menu — dùng chung cho menu user (MAIN_NAV) và sidebar admin. */
export interface NavItem {
  label: string
  path: string
  icon?: LucideIcon
  /** Mô tả ngắn (thẻ phân hệ trên dashboard admin). */
  description?: string
  /** Chỉ hiện với các role này (bỏ trống = mọi người được vào khu vực đó). */
  roles?: readonly string[]
  /** Menu con (sidebar admin nhiều cấp). */
  children?: NavItem[]
}

/** `location.state` khi chuyển trang sau thao tác thành công (hiện thông báo một lần). */
export interface FlashState {
  flash?: string
}

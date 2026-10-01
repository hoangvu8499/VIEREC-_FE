import { House, X } from 'lucide-react'
import { Link, NavLink } from 'react-router'

import { Logo } from '@/components/brand/logo'
import { IconButton } from '@/components/common/icon-button'
import { ADMIN_NAV } from '@/constants/admin-navigation'
import { ADMIN_ROUTES, ROUTES } from '@/constants/routes'
import { useAuthStore } from '@/stores/auth-store'
import { cn } from '@/utils/cn'
import { hasAnyRole } from '@/utils/user-roles'

import styles from './admin-sidebar.module.css'

export const ADMIN_SIDEBAR_ID = 'admin-sidebar'

interface AdminSidebarProps {
  /** Desktop: chỉ còn icon. */
  collapsed: boolean
  /** Mobile: ngăn kéo đang mở. */
  open: boolean
  onClose: () => void
}

export function AdminSidebar({ collapsed, open, onClose }: AdminSidebarProps) {
  const user = useAuthStore((state) => state.user)
  const items = ADMIN_NAV.filter((item) => !item.roles || hasAnyRole(user, item.roles))

  return (
    <aside
      id={ADMIN_SIDEBAR_ID}
      className={cn(styles.sidebar, collapsed && styles.collapsed, open && styles.open)}
      aria-label="Menu quản trị"
    >
      <div className={styles.brand}>
        <Logo variant="compact" to={ADMIN_ROUTES.DASHBOARD} title="VIEREC Admin" />
        <span className={styles.brandText}>
          <strong>VIEREC Academy</strong>
          <small>Quản trị hệ thống</small>
        </span>
        <IconButton className={styles.close} label="Đóng menu" onClick={onClose}>
          <X size={22} aria-hidden />
        </IconButton>
      </div>

      <nav className={styles.nav} aria-label="Quản trị">
        <p className={styles.section}>Quản lý</p>
        <ul className={styles.list}>
          {items.map(({ label, path, icon: Icon }) => (
            <li key={path}>
              <NavLink
                to={path}
                end={path === ADMIN_ROUTES.DASHBOARD}
                className={({ isActive }) => cn(styles.link, isActive && styles.active)}
                // Thu gọn: chỉ còn icon → hiện tên khi rê chuột.
                title={collapsed ? label : undefined}
                onClick={onClose}
              >
                {Icon && <Icon size={20} aria-hidden />}
                <span className={styles.label}>{label}</span>
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      <div className={styles.footer}>
        <Link
          to={ROUTES.HOME}
          className={styles.link}
          title={collapsed ? 'Về trang người dùng' : undefined}
        >
          <House size={20} aria-hidden />
          <span className={styles.label}>Về trang người dùng</span>
        </Link>
      </div>
    </aside>
  )
}

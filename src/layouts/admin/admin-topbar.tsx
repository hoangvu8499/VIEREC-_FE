import { ChevronRight, LogOut, Menu, PanelLeftClose, PanelLeftOpen } from 'lucide-react'
import { useLocation, useNavigate } from 'react-router'

import { IconButton } from '@/components/common/icon-button'
import { ADMIN_NAV } from '@/constants/admin-navigation'
import { ROUTES } from '@/constants/routes'
import { useLogout } from '@/hooks/use-logout'
import { ADMIN_SIDEBAR_ID } from '@/layouts/admin/admin-sidebar'
import { useAdminUiStore } from '@/stores/admin-ui-store'
import { useAuthStore } from '@/stores/auth-store'
import { userFullName } from '@/utils/user-full-name'
import { primaryRoleLabel } from '@/utils/user-roles'

import styles from './admin-topbar.module.css'

interface AdminTopbarProps {
  drawerOpen: boolean
  onOpenDrawer: () => void
}

/** Mục menu khớp đường dẫn hiện tại (khớp dài nhất, vd. `/admin/khoa-hoc/1` → Khoá học). */
function currentSection(pathname: string) {
  return ADMIN_NAV.filter(
    (item) => pathname === item.path || pathname.startsWith(`${item.path}/`),
  ).sort((a, b) => b.path.length - a.path.length)[0]
}

export function AdminTopbar({ drawerOpen, onOpenDrawer }: AdminTopbarProps) {
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const user = useAuthStore((state) => state.user)
  const collapsed = useAdminUiStore((state) => state.sidebarCollapsed)
  const toggleSidebar = useAdminUiStore((state) => state.toggleSidebar)
  const logout = useLogout({ onSettled: () => void navigate(ROUTES.LOGIN) })

  const name = user ? userFullName(user) || user.username : ''
  const section = currentSection(pathname)

  return (
    <header className={styles.topbar}>
      <IconButton
        className={styles.menuButton}
        label="Mở menu"
        aria-controls={ADMIN_SIDEBAR_ID}
        aria-expanded={drawerOpen}
        onClick={onOpenDrawer}
      >
        <Menu size={22} aria-hidden />
      </IconButton>
      <IconButton
        className={styles.collapseButton}
        label={collapsed ? 'Mở rộng menu' : 'Thu gọn menu'}
        aria-controls={ADMIN_SIDEBAR_ID}
        aria-expanded={!collapsed}
        onClick={toggleSidebar}
      >
        {collapsed ? (
          <PanelLeftOpen size={20} aria-hidden />
        ) : (
          <PanelLeftClose size={20} aria-hidden />
        )}
      </IconButton>

      <p className={styles.crumb}>
        <span className={styles.crumbRoot}>Quản trị</span>
        {section && (
          <>
            <ChevronRight className={styles.crumbRoot} size={14} aria-hidden />
            <strong>{section.label}</strong>
          </>
        )}
      </p>

      {user && (
        <div className={styles.right}>
          <div className={styles.user}>
            <span className={styles.avatar} aria-hidden>
              {(user.firstName.trim().split(/\s+/).at(-1) ?? user.username).charAt(0).toUpperCase()}
            </span>
            <span className={styles.userText}>
              <strong>{name}</strong>
              <small>{primaryRoleLabel(user)}</small>
            </span>
          </div>
          <IconButton
            className={styles.iconButton}
            label="Đăng xuất"
            disabled={logout.isPending}
            onClick={() => logout.mutate()}
          >
            <LogOut size={20} aria-hidden />
          </IconButton>
        </div>
      )}
    </header>
  )
}

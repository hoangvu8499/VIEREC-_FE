import { useEffect, useState } from 'react'
import { Outlet, ScrollRestoration } from 'react-router'

import { RequireRole } from '@/components/shared/require-role'
import { ADMIN_ROLES } from '@/constants/roles'
import { useSessionSync } from '@/hooks/use-session-sync'
import { AdminSidebar } from '@/layouts/admin/admin-sidebar'
import { AdminTopbar } from '@/layouts/admin/admin-topbar'
import { useAdminUiStore } from '@/stores/admin-ui-store'
import { cn } from '@/utils/cn'

import styles from './admin-layout.module.css'

/** Khung trang quản trị: sidebar (thu gọn được / ngăn kéo trên mobile) + topbar + nội dung. */
export function AdminLayout() {
  useSessionSync()
  const collapsed = useAdminUiStore((state) => state.sidebarCollapsed)
  const [drawerOpen, setDrawerOpen] = useState(false)

  // Esc đóng ngăn kéo menu trên mobile.
  useEffect(() => {
    if (!drawerOpen) return
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setDrawerOpen(false)
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [drawerOpen])

  return (
    <RequireRole roles={ADMIN_ROLES}>
      <div className={cn(styles.shell, collapsed && styles.collapsed)}>
        <AdminSidebar
          collapsed={collapsed}
          open={drawerOpen}
          onClose={() => setDrawerOpen(false)}
        />
        {drawerOpen && (
          <button
            type="button"
            className={styles.overlay}
            aria-label="Đóng menu"
            tabIndex={-1}
            onClick={() => setDrawerOpen(false)}
          />
        )}
        <div className={styles.main}>
          <AdminTopbar drawerOpen={drawerOpen} onOpenDrawer={() => setDrawerOpen(true)} />
          <main className={styles.content}>
            <Outlet />
          </main>
        </div>
      </div>
      <ScrollRestoration />
    </RequireRole>
  )
}

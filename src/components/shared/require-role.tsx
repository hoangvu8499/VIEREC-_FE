import { ShieldX } from 'lucide-react'
import type { ReactNode } from 'react'
import { Navigate, useLocation } from 'react-router'

import { Logo } from '@/components/brand/logo'
import { ButtonLink } from '@/components/common/button-link'
import { EmptyState } from '@/components/common/empty-state'
import { ROUTES } from '@/constants/routes'
import { useAuthStore } from '@/stores/auth-store'
import { hasAnyRole } from '@/utils/user-roles'

import styles from './require-role.module.css'

interface RequireRoleProps {
  /** Bỏ trống = chỉ cần đăng nhập. */
  roles?: readonly string[]
  /** Lời giải thích khi đăng nhập rồi nhưng không đủ quyền. */
  forbiddenDescription?: string
  children: ReactNode
}

/**
 * Chặn route theo đăng nhập / role. Chưa đăng nhập → trang đăng nhập (quay lại sau khi login).
 * Chỉ là lớp UI — backend vẫn kiểm tra quyền ở từng API.
 */
export function RequireRole({
  roles,
  forbiddenDescription = 'Khu vực này chỉ dành cho quản trị viên. Nếu bạn cần quyền truy cập, hãy liên hệ quản trị viên hệ thống.',
  children,
}: RequireRoleProps) {
  const user = useAuthStore((state) => state.user)
  const location = useLocation()

  if (!user) {
    return (
      <Navigate
        to={ROUTES.LOGIN}
        replace
        state={{ from: `${location.pathname}${location.search}` }}
      />
    )
  }

  if (roles && !hasAnyRole(user, roles)) {
    return (
      <main className={styles.forbidden}>
        <Logo />
        <EmptyState
          className={styles.card}
          icon={ShieldX}
          tone="danger"
          title="Bạn không có quyền truy cập trang này"
          description={forbiddenDescription}
          action={
            <ButtonLink to={ROUTES.HOME} variant="primary">
              Về trang chủ
            </ButtonLink>
          }
        />
      </main>
    )
  }

  return children
}

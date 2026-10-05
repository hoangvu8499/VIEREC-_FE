import { Building2, IdCard, UserRound } from 'lucide-react'

import { RequireRole } from '@/components/shared/require-role'
import { BUSINESS_NAV } from '@/constants/business-navigation'
import { ROLE_LABELS, ROLES } from '@/constants/roles'
import { BUSINESS_ROUTES } from '@/constants/routes'
import { AccountShell } from '@/layouts/user/account-shell'
import { useAuthStore } from '@/stores/auth-store'
import { userFullName } from '@/utils/user-full-name'

import styles from './learner-layout.module.css'

function BusinessShell() {
  const user = useAuthStore((state) => state.user)
  if (!user) return null

  return (
    <AccountShell
      bannerLabel="Thông tin doanh nghiệp"
      avatar={<Building2 size={32} />}
      greeting="Doanh nghiệp"
      name={user.businessName || 'Chưa gắn doanh nghiệp'}
      meta={
        <>
          <li className={styles.role}>{ROLE_LABELS.BUSINESS}</li>
          <li>
            <UserRound size={16} aria-hidden /> {userFullName(user) || user.username}
          </li>
          <li>
            <IdCard size={16} aria-hidden /> {user.username}
          </li>
        </>
      }
      navLabel="Góc doanh nghiệp"
      nav={BUSINESS_NAV}
      rootPath={BUSINESS_ROUTES.OVERVIEW}
    />
  )
}

/** Khung "Góc doanh nghiệp": chỉ tài khoản quản lý doanh nghiệp (BE chặn lại ở từng API). */
export function BusinessLayout() {
  return (
    <RequireRole
      roles={[ROLES.BUSINESS]}
      forbiddenDescription="Khu vực này dành cho tài khoản quản lý doanh nghiệp. Liên hệ VIEREC để được cấp tài khoản."
    >
      <BusinessShell />
    </RequireRole>
  )
}

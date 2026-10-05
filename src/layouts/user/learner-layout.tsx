import { CalendarDays, IdCard } from 'lucide-react'

import { RequireRole } from '@/components/shared/require-role'
import { LEARNER_NAV } from '@/constants/learner-navigation'
import { LEARNER_ROUTES } from '@/constants/routes'
import { AccountShell } from '@/layouts/user/account-shell'
import { useAuthStore } from '@/stores/auth-store'
import { formatDate } from '@/utils/format-date'
import { userFullName, userInitials } from '@/utils/user-full-name'
import { primaryRoleLabel } from '@/utils/user-roles'

import styles from './learner-layout.module.css'

function LearnerShell() {
  const user = useAuthStore((state) => state.user)
  if (!user) return null

  return (
    <AccountShell
      bannerLabel="Thông tin học viên"
      avatar={userInitials(user)}
      greeting="Xin chào,"
      name={userFullName(user) || user.username}
      meta={
        <>
          <li className={styles.role}>{primaryRoleLabel(user)}</li>
          <li>
            <IdCard size={16} aria-hidden /> {user.username}
          </li>
          <li>
            <CalendarDays size={16} aria-hidden /> Tham gia {formatDate(user.createdAt)}
          </li>
        </>
      }
      navLabel="Góc học viên"
      nav={LEARNER_NAV}
      rootPath={LEARNER_ROUTES.OVERVIEW}
    />
  )
}

/** Khung "Góc học viên": chỉ cần đăng nhập (admin cũng vào được để học). */
export function LearnerLayout() {
  return (
    <RequireRole>
      <LearnerShell />
    </RequireRole>
  )
}

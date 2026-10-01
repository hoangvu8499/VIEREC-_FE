import { CalendarDays, IdCard } from 'lucide-react'
import { useEffect, useRef } from 'react'
import { NavLink, Outlet, useLocation } from 'react-router'

import { Container } from '@/components/common/container'
import { RequireRole } from '@/components/shared/require-role'
import { LEARNER_NAV } from '@/constants/learner-navigation'
import { LEARNER_ROUTES } from '@/constants/routes'
import { useAuthStore } from '@/stores/auth-store'
import { cn } from '@/utils/cn'
import { formatDate } from '@/utils/format-date'
import { userFullName, userInitials } from '@/utils/user-full-name'
import { primaryRoleLabel } from '@/utils/user-roles'

import styles from './learner-layout.module.css'

function LearnerShell() {
  const user = useAuthStore((state) => state.user)
  const { pathname } = useLocation()
  const navRef = useRef<HTMLElement>(null)

  // Màn hẹp menu cuộn ngang: đưa mục đang chọn vào tầm nhìn (vd. "Hồ sơ cá nhân" ở cuối).
  useEffect(() => {
    const active = navRef.current?.querySelector<HTMLElement>(`a[href="${pathname}"]`)
    active?.scrollIntoView?.({ block: 'nearest', inline: 'center' })
  }, [pathname])

  if (!user) return null

  return (
    <div className={styles.page}>
      <section className={styles.banner} aria-label="Thông tin học viên">
        <Container className={styles.bannerInner}>
          <span className={styles.avatar} aria-hidden>
            {userInitials(user)}
          </span>
          <div className={styles.identity}>
            <p className={styles.greeting}>Xin chào,</p>
            <p className={styles.name}>{userFullName(user) || user.username}</p>
            <ul className={styles.meta}>
              <li className={styles.role}>{primaryRoleLabel(user)}</li>
              <li>
                <IdCard size={16} aria-hidden /> {user.username}
              </li>
              <li>
                <CalendarDays size={16} aria-hidden /> Tham gia {formatDate(user.createdAt)}
              </li>
            </ul>
          </div>
        </Container>
      </section>

      <Container className={styles.body}>
        <nav ref={navRef} className={styles.nav} aria-label="Góc học viên">
          <ul className={styles.navList}>
            {LEARNER_NAV.map(({ label, path, icon: Icon }) => (
              <li key={path}>
                <NavLink
                  to={path}
                  end={path === LEARNER_ROUTES.OVERVIEW}
                  className={({ isActive }) => cn(styles.navLink, isActive && styles.active)}
                >
                  {Icon && <Icon size={18} aria-hidden />}
                  {label}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>
        <div className={styles.content}>
          <Outlet />
        </div>
      </Container>
    </div>
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

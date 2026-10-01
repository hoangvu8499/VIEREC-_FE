import { CircleUserRound, GraduationCap, LayoutDashboard, PhoneCall } from 'lucide-react'
import { useNavigate } from 'react-router'

import { Logo } from '@/components/brand/logo'
import { Button } from '@/components/common/button'
import { ButtonLink } from '@/components/common/button-link'
import { Container } from '@/components/common/container'
import { LanguageSwitcher } from '@/components/shared/language-switcher'
import { CONTACT } from '@/constants/contact'
import { ADMIN_ROUTES, LEARNER_ROUTES, ROUTES } from '@/constants/routes'
import { useLogout } from '@/hooks/use-logout'
import { useAuthStore } from '@/stores/auth-store'
import { userFullName } from '@/utils/user-full-name'
import { isAdmin } from '@/utils/user-roles'

import styles from './site-header.module.css'

export function SiteHeader() {
  const navigate = useNavigate()
  const user = useAuthStore((state) => state.user)
  const logout = useLogout({ onSettled: () => void navigate(ROUTES.HOME) })

  return (
    <header className={styles.header}>
      <Container className={styles.inner}>
        <Logo className={styles.logo} />
        <a className={styles.hotline} href={`tel:${CONTACT.HOTLINE.replaceAll(' ', '')}`}>
          <span className={styles.hotlineIcon}>
            <PhoneCall size={20} aria-hidden />
          </span>
          <span className={styles.hotlineText}>
            <span className={styles.hotlineLabel}>Đường dây nóng 24/7</span>
            <span className={styles.hotlineNumber}>{CONTACT.HOTLINE}</span>
          </span>
        </a>
        <div className={styles.actions}>
          {user ? (
            <>
              <span className={styles.user}>
                <CircleUserRound size={20} aria-hidden />
                {userFullName(user) || user.username}
              </span>
              <ButtonLink to={LEARNER_ROUTES.OVERVIEW} variant="outline" aria-label="Góc học viên">
                <GraduationCap size={18} aria-hidden />
                <span className={styles.buttonLabel}>Góc học viên</span>
              </ButtonLink>
              {isAdmin(user) && (
                <ButtonLink to={ADMIN_ROUTES.DASHBOARD} variant="outline" aria-label="Quản trị">
                  <LayoutDashboard size={18} aria-hidden />
                  <span className={styles.buttonLabel}>Quản trị</span>
                </ButtonLink>
              )}
              <Button variant="ghost" loading={logout.isPending} onClick={() => logout.mutate()}>
                {logout.isPending ? 'Đang đăng xuất...' : 'Đăng xuất'}
              </Button>
            </>
          ) : (
            <>
              <ButtonLink to={ROUTES.LOGIN} variant="ghost">
                Đăng nhập
              </ButtonLink>
              <ButtonLink to={ROUTES.REGISTER} variant="accent">
                Đăng ký
              </ButtonLink>
            </>
          )}
          <LanguageSwitcher className={styles.language} />
        </div>
      </Container>
    </header>
  )
}

import { useEffect, useRef, type ReactNode } from 'react'
import { NavLink, Outlet, useLocation } from 'react-router'

import { Container } from '@/components/common/container'
import type { NavItem } from '@/types/navigation'
import { cn } from '@/utils/cn'

import styles from './learner-layout.module.css'

interface AccountShellProps {
  /** Nhãn vùng banner, vd. "Thông tin học viên". */
  bannerLabel: string
  avatar: ReactNode
  greeting: string
  name: string
  /** Các `<li>` dưới tên. */
  meta: ReactNode
  /** Nhãn menu, vd. "Góc học viên". */
  navLabel: string
  nav: NavItem[]
  /** Mục chỉ sáng khi đúng path này (trang tổng quan). */
  rootPath: string
}

/** Khung chung của Góc học viên và Góc doanh nghiệp: banner, menu trái (màn hẹp cuộn ngang), nội dung. */
export function AccountShell({
  bannerLabel,
  avatar,
  greeting,
  name,
  meta,
  navLabel,
  nav,
  rootPath,
}: AccountShellProps) {
  const { pathname } = useLocation()
  const navRef = useRef<HTMLElement>(null)

  // Màn hẹp menu cuộn ngang: đưa mục đang chọn vào tầm nhìn (vd. "Hồ sơ cá nhân" ở cuối).
  useEffect(() => {
    const active = navRef.current?.querySelector<HTMLElement>(`a[href="${pathname}"]`)
    active?.scrollIntoView?.({ block: 'nearest', inline: 'center' })
  }, [pathname])

  return (
    <div className={styles.page}>
      <section className={styles.banner} aria-label={bannerLabel}>
        <Container className={styles.bannerInner}>
          <span className={styles.avatar} aria-hidden>
            {avatar}
          </span>
          <div className={styles.identity}>
            <p className={styles.greeting}>{greeting}</p>
            <p className={styles.name}>{name}</p>
            <ul className={styles.meta}>{meta}</ul>
          </div>
        </Container>
      </section>

      <Container className={styles.body}>
        <nav ref={navRef} className={styles.nav} aria-label={navLabel}>
          <ul className={styles.navList}>
            {nav.map(({ label, path, icon: Icon }) => (
              <li key={path}>
                <NavLink
                  to={path}
                  end={path === rootPath}
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

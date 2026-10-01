import type { ReactNode } from 'react'

import { Logo } from '@/components/brand/logo'
import { Container } from '@/components/common/container'

import styles from './auth-shell.module.css'

interface AuthShellProps {
  /** id của `<h1>` — section trỏ `aria-labelledby` tới đây. */
  titleId: string
  title: string
  subtitle?: ReactNode
  children: ReactNode
  /** Dòng điều hướng dưới card, vd. "Chưa có tài khoản? Đăng ký". */
  footer?: ReactNode
}

/** Khung card căn giữa cho các trang đăng nhập / quên mật khẩu / đặt lại mật khẩu. */
export function AuthShell({ titleId, title, subtitle, children, footer }: AuthShellProps) {
  return (
    <div className={styles.page}>
      <Container className={styles.inner}>
        <section className={styles.card} aria-labelledby={titleId}>
          <header className={styles.header}>
            <Logo variant="compact" className={styles.logo} />
            <h1 id={titleId} className={styles.title}>
              {title}
            </h1>
            {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
          </header>
          {children}
          {footer && <div className={styles.footer}>{footer}</div>}
        </section>
      </Container>
    </div>
  )
}

import { Outlet, ScrollRestoration } from 'react-router'

import { useSessionSync } from '@/hooks/use-session-sync'
import { MainNav } from '@/layouts/user/main-nav'
import { SiteFooter } from '@/layouts/user/site-footer'
import { SiteHeader } from '@/layouts/user/site-header'

import styles from './user-layout.module.css'

export function UserLayout() {
  useSessionSync()

  return (
    <div className={styles.layout}>
      <SiteHeader />
      <MainNav />
      <main className={styles.main}>
        <Outlet />
      </main>
      <SiteFooter />
      <ScrollRestoration />
    </div>
  )
}

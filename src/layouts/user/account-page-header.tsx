import type { ReactNode } from 'react'

import styles from './account-page-header.module.css'

interface AccountPageHeaderProps {
  title: string
  description: string
  action?: ReactNode
}

/** Đầu trang trong Góc học viên / Góc doanh nghiệp. */
export function AccountPageHeader({ title, description, action }: AccountPageHeaderProps) {
  return (
    <header className={styles.pageHeader}>
      <div>
        <h1 className={styles.pageTitle}>{title}</h1>
        <p className={styles.pageDescription}>{description}</p>
      </div>
      {action}
    </header>
  )
}

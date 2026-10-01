import type { ReactNode } from 'react'

import styles from './learner-ui.module.css'

interface LearnerPageHeaderProps {
  title: string
  description: string
  action?: ReactNode
}

export function LearnerPageHeader({ title, description, action }: LearnerPageHeaderProps) {
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

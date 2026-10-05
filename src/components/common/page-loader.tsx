import { LoaderCircle } from 'lucide-react'

import styles from './page-loader.module.css'

export function PageLoader({ label = 'Đang tải…' }: { label?: string }) {
  return (
    <output className={styles.loader} aria-busy>
      <LoaderCircle className={styles.spinner} size={32} aria-hidden />
      <span className="sr-only">{label}</span>
    </output>
  )
}

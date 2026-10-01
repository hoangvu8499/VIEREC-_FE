import { CircleCheck, Hammer } from 'lucide-react'

import { EmptyState } from '@/components/common/empty-state'

import styles from './admin-coming-soon.module.css'

interface AdminComingSoonProps {
  /** Những việc phân hệ sẽ làm được. */
  features: string[]
}

/** Nội dung tạm cho phân hệ quản trị chưa có API. */
export function AdminComingSoon({ features }: AdminComingSoonProps) {
  return (
    <section className={styles.card} aria-label="Phân hệ đang xây dựng">
      <EmptyState
        icon={Hammer}
        title="Phân hệ đang được xây dựng"
        description="Giao diện quản lý sẽ có ngay khi hệ thống sẵn sàng. Dự kiến gồm:"
      />
      <ul className={styles.features}>
        {features.map((feature) => (
          <li key={feature}>
            <CircleCheck size={18} aria-hidden />
            {feature}
          </li>
        ))}
      </ul>
    </section>
  )
}

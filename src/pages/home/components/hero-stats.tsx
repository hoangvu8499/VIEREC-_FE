import { StatCard } from '@/components/common/stat-card'
import type { Stat } from '@/types/content'

import styles from './hero-stats.module.css'

export function HeroStats({ stats }: { stats: Stat[] }) {
  return (
    <ul className={styles.stats}>
      {stats.map((stat) => (
        <li key={stat.id}>
          <StatCard value={stat.value} label={stat.label} icon={stat.icon} />
        </li>
      ))}
    </ul>
  )
}

import { Link } from 'react-router'

import type { Category } from '@/types/content'

import styles from './category-grid.module.css'

export function CategoryCard({ category }: { category: Category }) {
  const { name, path, icon: Icon, color } = category

  return (
    <Link to={path} className={styles.card}>
      <span className={styles.icon} style={{ color }}>
        <Icon size={24} strokeWidth={1.9} aria-hidden />
      </span>
      <span className={styles.name}>{name}</span>
    </Link>
  )
}

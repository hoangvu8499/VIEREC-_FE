import { ArrowRight } from 'lucide-react'
import { Link } from 'react-router'

import type { Category } from '@/types/content'

import styles from './category-grid.module.css'

export function CategoryCard({ category }: { category: Category }) {
  const { name, path, icon: Icon, color } = category

  return (
    <Link to={path} className={styles.card}>
      <Icon size={44} strokeWidth={1.75} color={color} aria-hidden />
      <span className={styles.name}>{name}</span>
      <ArrowRight className={styles.arrow} size={16} aria-hidden />
    </Link>
  )
}

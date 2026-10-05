import { CategoryCard } from '@/pages/home/components/category-card'
import { HomeSection } from '@/pages/home/components/home-section'
import type { Category } from '@/types/content'

import styles from './category-grid.module.css'

export function CategoryGrid({ categories }: { categories: Category[] }) {
  return (
    <HomeSection id="categories-title" title="Lĩnh vực đào tạo">
      <ul className={styles.grid}>
        {categories.map((category) => (
          <li key={category.id}>
            <CategoryCard category={category} />
          </li>
        ))}
      </ul>
    </HomeSection>
  )
}

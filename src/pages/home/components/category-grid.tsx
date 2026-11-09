import { CategoryCard } from '@/pages/home/components/category-card'
import { PageSection } from '@/components/shared/page-section'
import type { Category } from '@/types/content'

import styles from './category-grid.module.css'

export function CategoryGrid({ categories }: { categories: Category[] }) {
  return (
    <PageSection id="categories-title" title="Lĩnh vực đào tạo">
      <ul className={styles.grid}>
        {categories.map((category) => (
          <li key={category.id}>
            <CategoryCard category={category} />
          </li>
        ))}
      </ul>
    </PageSection>
  )
}

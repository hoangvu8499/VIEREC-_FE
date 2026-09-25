import { Container } from '@/components/common/container'
import { CategoryCard } from '@/pages/home/components/category-card'
import type { Category } from '@/types/content'

import styles from './category-grid.module.css'

export function CategoryGrid({ categories }: { categories: Category[] }) {
  return (
    <section className={styles.section} aria-labelledby="categories-title">
      <Container>
        <h2 id="categories-title" className="sr-only">
          Lĩnh vực đào tạo
        </h2>
        <ul className={styles.grid}>
          {categories.map((category) => (
            <li key={category.id}>
              <CategoryCard category={category} />
            </li>
          ))}
        </ul>
      </Container>
    </section>
  )
}

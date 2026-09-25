import { SectionHeader } from '@/components/common/section-header'
import { ROUTES } from '@/constants/routes'
import { NewsCard } from '@/pages/home/components/news-card'
import type { NewsItem } from '@/types/content'

import styles from './news-section.module.css'

export function NewsSection({ news }: { news: NewsItem[] }) {
  return (
    <section aria-labelledby="news-title">
      <SectionHeader id="news-title" title="Tin tức & Sự kiện" viewAllTo={ROUTES.NEWS} />
      <ul className={styles.list}>
        {news.map((item) => (
          <li key={item.id}>
            <NewsCard news={item} />
          </li>
        ))}
      </ul>
    </section>
  )
}

import { ROUTES } from '@/constants/routes'
import { HomeSection } from '@/pages/home/components/home-section'
import { NewsCard } from '@/pages/home/components/news-card'
import type { NewsItem } from '@/types/content'

import styles from './news-section.module.css'

export function NewsSection({ news }: { news: NewsItem[] }) {
  return (
    <HomeSection
      id="news-title"
      title="Tin tức & Sự kiện"
      viewAll={{ to: ROUTES.NEWS, label: 'Xem tất cả' }}
      white
    >
      <ul className={styles.list}>
        {news.map((item) => (
          <li key={item.id}>
            <NewsCard news={item} />
          </li>
        ))}
      </ul>
    </HomeSection>
  )
}

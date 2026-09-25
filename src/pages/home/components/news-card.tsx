import { Newspaper } from 'lucide-react'
import { Link } from 'react-router'

import type { NewsItem } from '@/types/content'
import { formatDate } from '@/utils/format-date'

import styles from './news-section.module.css'

export function NewsCard({ news }: { news: NewsItem }) {
  return (
    <Link to={news.path} className={styles.card}>
      <div className={styles.thumb}>
        {news.image ? (
          <img src={news.image} alt="" loading="lazy" />
        ) : (
          <Newspaper size={28} aria-hidden />
        )}
      </div>
      <div className={styles.meta}>
        <time className={styles.date} dateTime={news.publishedAt}>
          {formatDate(news.publishedAt)}
        </time>
        <h3 className={styles.title}>{news.title}</h3>
      </div>
    </Link>
  )
}

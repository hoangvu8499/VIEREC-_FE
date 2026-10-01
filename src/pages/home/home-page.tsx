import { Container } from '@/components/common/container'
import { useDocumentTitle } from '@/hooks/use-document-title'
import { CategoryGrid } from '@/pages/home/components/category-grid'
import { HeroSection } from '@/pages/home/components/hero-section'
import { LatestCourses } from '@/pages/home/components/latest-courses'
import { NewsSection } from '@/pages/home/components/news-section'
import { PartnersSection } from '@/pages/home/components/partners-section'
import { PromoCards } from '@/pages/home/components/promo-cards'
import { CATEGORIES, NEWS, PARTNERS } from '@/pages/home/home-data'

import styles from './home-page.module.css'

export default function HomePage() {
  useDocumentTitle('Trang chủ')

  return (
    <div className={styles.page}>
      <HeroSection />
      <CategoryGrid categories={CATEGORIES} />
      <LatestCourses />
      <PromoCards />
      <Container className={styles.bottom}>
        <NewsSection news={NEWS} />
        <PartnersSection partners={PARTNERS} />
      </Container>
    </div>
  )
}

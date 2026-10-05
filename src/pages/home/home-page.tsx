import { useDocumentTitle } from '@/hooks/use-document-title'
import { CategoryGrid } from '@/pages/home/components/category-grid'
import { HeroSection } from '@/pages/home/components/hero-section'
import { LatestCourses } from '@/pages/home/components/latest-courses'
import { NewsSection } from '@/pages/home/components/news-section'
import { PartnersSection } from '@/pages/home/components/partners-section'
import { ServiceCards } from '@/pages/home/components/service-cards'
import { CATEGORIES, NEWS, PARTNERS, SERVICES } from '@/pages/home/home-data'

import styles from './home-page.module.css'

export default function HomePage() {
  useDocumentTitle('Trang chủ')

  return (
    <div className={styles.page}>
      <HeroSection />
      <CategoryGrid categories={CATEGORIES} />
      <LatestCourses />
      <ServiceCards services={SERVICES} />
      <NewsSection news={NEWS} />
      <PartnersSection partners={PARTNERS} />
    </div>
  )
}

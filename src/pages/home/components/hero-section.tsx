import { GraduationCap, ShieldCheck } from 'lucide-react'

import bannerImage from '@/assets/images/banner.webp'
import { ButtonLink } from '@/components/common/button-link'
import { Container } from '@/components/common/container'
import { ROUTES } from '@/constants/routes'
import { HeroStats } from '@/pages/home/components/hero-stats'
import { HERO_STATS } from '@/pages/home/home-data'

import styles from './hero-section.module.css'

export function HeroSection() {
  return (
    <>
      <div className={styles.banner}>
        <img
          src={bannerImage}
          alt="VIEREC Academy – An toàn là bước đầu để phát triển"
          width={1920}
          height={231}
        />
      </div>

      <section className={styles.hero} aria-labelledby="hero-title">
        <Container className={styles.inner}>
          <div className={styles.content}>
            <p className={styles.tagline}>Đào tạo – Ứng phó – Kiến tạo</p>
            <h1 id="hero-title" className={styles.title}>
              Vì một Việt Nam an toàn và phát triển bền vững
            </h1>
            <p className={styles.description}>
              Nền tảng đào tạo và hỗ trợ ứng phó sự cố, đồng hành cùng cá nhân, doanh nghiệp và cộng
              đồng xây dựng môi trường làm việc an toàn, xanh và bền vững.
            </p>
            <div className={styles.actions}>
              <ButtonLink to={ROUTES.COURSES} variant="accent" size="lg">
                <GraduationCap size={22} aria-hidden />
                Khám phá khóa học
              </ButtonLink>
              <ButtonLink to={ROUTES.INCIDENT_RESPONSE} variant="outline" size="lg">
                <ShieldCheck size={22} aria-hidden />
                Tìm hiểu dịch vụ
              </ButtonLink>
            </div>
          </div>
          <HeroStats stats={HERO_STATS} />
        </Container>
      </section>
    </>
  )
}

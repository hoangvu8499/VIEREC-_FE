import { GraduationCap, ShieldCheck } from 'lucide-react'

import bannerImage from '@/assets/images/banner.jpg'
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
        <img src={bannerImage} alt="VIEREC Academy – An toàn là bước đầu để phát triển" />
      </div>

      <section className={styles.hero} aria-labelledby="hero-title">
        <Container className={styles.inner}>
          <div className={styles.content}>
            <p className={styles.tagline}>ĐÀO TẠO – ỨNG PHÓ – KIẾN TẠO</p>
            <h1 id="hero-title" className={styles.title}>
              Vì một Việt Nam an toàn và phát triển bền vững
            </h1>
            <p className={styles.description}>
              VIEREC là nền tảng đào tạo và hỗ trợ ứng phó sự cố toàn diện, đồng hành cùng cá nhân,
              doanh nghiệp và cộng đồng trong xây dựng môi trường làm việc an toàn, xanh và bền
              vững.
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
            <HeroStats stats={HERO_STATS} />
          </div>

          <div className={styles.visual}>
            <p className={styles.slogan}>
              Chủ động hôm nay
              <br />
              An toàn ngày mai
            </p>
          </div>
        </Container>
      </section>
    </>
  )
}

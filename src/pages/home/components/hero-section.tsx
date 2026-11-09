import { GraduationCap, MapPin, Phone, ShieldCheck } from 'lucide-react'

import drillImage from '@/assets/images/about/drill-water-spray.webp'
import hazmatImage from '@/assets/images/about/response-hazmat.webp'
import trainingImage from '@/assets/images/about/training-class.webp'
import practiceImage from '@/assets/images/about/training-practice.webp'
import logoImage from '@/assets/images/logo-mark.webp'
import { ButtonLink } from '@/components/common/button-link'
import { Container } from '@/components/common/container'
import { COMPANY, CONTACT, MOTTO, telHref } from '@/constants/contact'
import { ROUTES } from '@/constants/routes'
import { HeroStats } from '@/pages/home/components/hero-stats'
import { HERO_STATS } from '@/pages/home/home-data'

import styles from './hero-section.module.css'

// Ảnh gốc cắt từ hồ sơ năng lực chỉ rộng ~380px nên hiển thị dạng lưới nhỏ cho nét.
const PHOTOS = [
  { src: trainingImage, alt: 'Lớp huấn luyện an toàn do VIEREC tổ chức' },
  { src: drillImage, alt: 'Diễn tập ứng phó sự cố tràn dầu trên biển' },
  { src: hazmatImage, alt: 'Ứng phó sự cố hoá chất' },
  { src: practiceImage, alt: 'Học viên thực hành kỹ năng ứng phó' },
]

export function HeroSection() {
  return (
    <section className={styles.hero} aria-labelledby="hero-title">
      <Container className={styles.inner}>
        <div className={styles.content}>
          <p className={styles.tagline}>VIEREC Academy · Đào tạo – Ứng phó – Kiến tạo</p>
          <h1 id="hero-title" className={styles.title}>
            Vì một Việt Nam <span className={styles.highlight}>an toàn</span> và phát triển bền vững
          </h1>
          <p className={styles.description}>
            Chương trình đào tạo phòng ngừa và ứng phó sự cố trực thuộc{' '}
            <strong>{COMPANY.NAME}</strong>, đồng hành cùng cá nhân, doanh nghiệp và cộng đồng xây
            dựng môi trường làm việc an toàn, xanh và bền vững.
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
          <ul className={styles.contacts}>
            <li>
              <a href={telHref(CONTACT.HOTLINE)}>
                <Phone size={16} aria-hidden />
                Hotline <strong>{CONTACT.HOTLINE}</strong>
              </a>
            </li>
            <li>
              <a href={telHref(CONTACT.PHONE)}>
                <Phone size={16} aria-hidden />
                {CONTACT.PHONE}
              </a>
            </li>
            <li>
              <MapPin size={16} aria-hidden />
              {COMPANY.ADDRESS}
            </li>
          </ul>
        </div>

        <div className={styles.visual}>
          <ul className={styles.photos}>
            {PHOTOS.map((photo) => (
              <li key={photo.src}>
                <img src={photo.src} alt={photo.alt} width={384} height={250} />
              </li>
            ))}
          </ul>
          <div className={styles.badge}>
            <img src={logoImage} alt="" width={204} height={204} />
            <p>{MOTTO}</p>
          </div>
        </div>
      </Container>

      <Container>
        <HeroStats stats={HERO_STATS} />
      </Container>
    </section>
  )
}

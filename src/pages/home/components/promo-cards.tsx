import { ArrowRight, Siren } from 'lucide-react'

import { ButtonLink } from '@/components/common/button-link'
import { Container } from '@/components/common/container'
import { ROUTES } from '@/constants/routes'
import { PromoCard } from '@/pages/home/components/promo-card'

import styles from './promo-cards.module.css'

export function PromoCards() {
  return (
    <section className={styles.section} aria-label="Dịch vụ nổi bật">
      <Container className={styles.grid}>
        <PromoCard
          variant="green"
          title="VIEREC"
          description="Đồng hành cùng doanh nghiệp vì mục tiêu ESG và phát triển bền vững"
          action={
            <ButtonLink to={ROUTES.ABOUT} variant="secondary">
              Tìm hiểu ngay <ArrowRight size={18} aria-hidden />
            </ButtonLink>
          }
        />
        <PromoCard
          variant="blue"
          icon={<Siren size={44} color="var(--color-danger)" aria-hidden />}
          title="BÁO SỰ CỐ KHẨN CẤP"
          description="Kết nối nhanh với Trung tâm Ứng phó sự cố VIEREC"
          action={
            <ButtonLink to={ROUTES.EMERGENCY_REPORT} variant="light">
              Gửi thông tin ngay <ArrowRight size={18} aria-hidden />
            </ButtonLink>
          }
        />
        <PromoCard
          variant="light"
          title="VIEREC ACADEMY"
          subtitle="Dành cho doanh nghiệp"
          description="Giải pháp đào tạo, quản lý chứng chỉ và nâng cao năng lực HSE cho doanh nghiệp"
          action={
            <ButtonLink to={ROUTES.ENTERPRISE} variant="primary">
              Xem giải pháp <ArrowRight size={18} aria-hidden />
            </ButtonLink>
          }
        />
      </Container>
    </section>
  )
}

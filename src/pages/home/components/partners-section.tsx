import { SectionHeader } from '@/components/common/section-header'
import { ROUTES } from '@/constants/routes'
import type { Partner } from '@/types/content'

import styles from './partners-section.module.css'

export function PartnersSection({ partners }: { partners: Partner[] }) {
  return (
    <section aria-labelledby="partners-title">
      <SectionHeader id="partners-title" title="Đối tác & Khách hàng" viewAllTo={ROUTES.PARTNERS} />
      <ul className={styles.list}>
        {partners.map((partner) => {
          const content = partner.logo ? (
            <img src={partner.logo} alt={partner.name} loading="lazy" />
          ) : (
            partner.name
          )

          return (
            <li key={partner.id}>
              {partner.url ? (
                <a className={styles.item} href={partner.url} target="_blank" rel="noreferrer">
                  {content}
                </a>
              ) : (
                <div className={styles.item}>{content}</div>
              )}
            </li>
          )
        })}
      </ul>
    </section>
  )
}

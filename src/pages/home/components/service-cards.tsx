import { ArrowRight } from 'lucide-react'
import { Link } from 'react-router'

import { HomeSection } from '@/pages/home/components/home-section'
import type { Service } from '@/types/content'
import { cn } from '@/utils/cn'

import styles from './service-cards.module.css'

export function ServiceCards({ services }: { services: Service[] }) {
  return (
    <HomeSection id="services-title" eyebrow="Dịch vụ" title="VIEREC đồng hành cùng bạn">
      <ul className={styles.grid}>
        {services.map(({ id, icon: Icon, title, description, path, action, urgent }) => (
          <li key={id}>
            <Link to={path} className={cn(styles.card, urgent && styles.urgent)}>
              <span className={styles.icon}>
                <Icon size={24} aria-hidden />
              </span>
              <h3 className={styles.title}>{title}</h3>
              <p className={styles.description}>{description}</p>
              <span className={styles.action}>
                {action} <ArrowRight size={16} aria-hidden />
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </HomeSection>
  )
}

import { Menu, X } from 'lucide-react'
import { useId, useState } from 'react'
import { NavLink } from 'react-router'

import { Container } from '@/components/common/container'
import { IconButton } from '@/components/common/icon-button'
import { EmergencyReportButton } from '@/components/shared/emergency-report-button'
import { MAIN_NAV } from '@/constants/navigation'
import { ROUTES } from '@/constants/routes'
import { cn } from '@/utils/cn'

import styles from './main-nav.module.css'

export function MainNav() {
  const listId = useId()
  const [isOpen, setIsOpen] = useState(false)

  return (
    <nav className={styles.nav} aria-label="Menu chính">
      <Container className={styles.bar}>
        <IconButton
          className={styles.toggle}
          label={isOpen ? 'Đóng menu' : 'Mở menu'}
          aria-expanded={isOpen}
          aria-controls={listId}
          onClick={() => setIsOpen((open) => !open)}
        >
          {isOpen ? <X size={24} aria-hidden /> : <Menu size={24} aria-hidden />}
        </IconButton>

        <ul id={listId} className={cn(styles.list, isOpen && styles.listOpen)}>
          {MAIN_NAV.map(({ label, path, icon: Icon }) => (
            <li key={path}>
              <NavLink
                to={path}
                end={path === ROUTES.HOME}
                className={({ isActive }) => cn(styles.link, isActive && styles.active)}
                onClick={() => setIsOpen(false)}
              >
                {Icon && <Icon className={styles.linkIcon} size={18} aria-hidden />}
                {label}
              </NavLink>
            </li>
          ))}
        </ul>

        <EmergencyReportButton size="sm" />
      </Container>
    </nav>
  )
}

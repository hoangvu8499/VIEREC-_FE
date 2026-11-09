import { Globe, Mail, MapPin, Phone, ShieldCheck } from 'lucide-react'
import { Link } from 'react-router'

import { Container } from '@/components/common/container'
import { FacebookIcon, LinkedinIcon, YoutubeIcon } from '@/components/icons/social-icons'
import { COMPANY, CONTACT, SLOGAN, telHref } from '@/constants/contact'
import { ROUTES } from '@/constants/routes'

import styles from './site-footer.module.css'

const SOCIAL_LINKS = [
  { label: 'Facebook', href: CONTACT.SOCIAL.FACEBOOK, Icon: FacebookIcon },
  { label: 'YouTube', href: CONTACT.SOCIAL.YOUTUBE, Icon: YoutubeIcon },
  { label: 'LinkedIn', href: CONTACT.SOCIAL.LINKEDIN, Icon: LinkedinIcon },
]

export function SiteFooter() {
  return (
    <footer className={styles.footer}>
      <Container className={styles.inner}>
        <div className={styles.company}>
          <p className={styles.companyName}>{COMPANY.NAME}</p>
          <p className={styles.companyIntl}>{COMPANY.INTERNATIONAL_NAME}</p>
          <p className={styles.contact}>
            <MapPin size={16} aria-hidden /> {COMPANY.ADDRESS}
          </p>
          <p>Mã số thuế: {COMPANY.TAX_CODE}</p>
        </div>

        <ul className={styles.contacts}>
          <li>
            <a className={styles.contact} href={telHref(CONTACT.HOTLINE)}>
              <Phone size={16} aria-hidden /> Hotline: {CONTACT.HOTLINE}
            </a>
          </li>
          <li>
            <a className={styles.contact} href={telHref(CONTACT.PHONE)}>
              <Phone size={16} aria-hidden /> Điện thoại: {CONTACT.PHONE}
            </a>
          </li>
          <li>
            <a className={styles.contact} href={`mailto:${CONTACT.EMAIL}`}>
              <Mail size={16} aria-hidden /> {CONTACT.EMAIL}
            </a>
          </li>
          <li>
            <a className={styles.contact} href={CONTACT.WEBSITE}>
              <Globe size={16} aria-hidden /> {CONTACT.WEBSITE}
            </a>
          </li>
          <li>
            <Link className={styles.contact} to={ROUTES.VERIFY_CERTIFICATE}>
              <ShieldCheck size={16} aria-hidden /> Tra cứu chứng chỉ
            </Link>
          </li>
        </ul>

        <div className={styles.socials}>
          {SOCIAL_LINKS.map(({ label, href, Icon }) => (
            <a
              key={label}
              className={styles.social}
              href={href}
              target="_blank"
              rel="noreferrer"
              aria-label={label}
            >
              <Icon size={20} />
            </a>
          ))}
        </div>
      </Container>
      <div className={styles.slogan}>{SLOGAN}</div>
    </footer>
  )
}

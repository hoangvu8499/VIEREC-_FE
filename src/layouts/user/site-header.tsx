import { useNavigate } from 'react-router'

import { Logo } from '@/components/brand/logo'
import { ButtonLink } from '@/components/common/button-link'
import { Container } from '@/components/common/container'
import { LanguageSwitcher } from '@/components/shared/language-switcher'
import { SearchBox } from '@/components/shared/search-box'
import { ROUTES } from '@/constants/routes'

import styles from './site-header.module.css'

export function SiteHeader() {
  const navigate = useNavigate()

  return (
    <header className={styles.header}>
      <Container className={styles.inner}>
        <Logo className={styles.logo} />
        <SearchBox
          className={styles.search}
          placeholder="Tìm khóa học, tài liệu, tin tức..."
          onSearch={(keyword) => navigate(`${ROUTES.SEARCH}?q=${encodeURIComponent(keyword)}`)}
        />
        <div className={styles.actions}>
          <ButtonLink to={ROUTES.LOGIN} variant="ghost">
            Đăng nhập
          </ButtonLink>
          <ButtonLink to={ROUTES.REGISTER} variant="accent">
            Đăng ký
          </ButtonLink>
          <LanguageSwitcher className={styles.language} />
        </div>
      </Container>
    </header>
  )
}

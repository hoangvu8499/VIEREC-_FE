import { ButtonLink } from '@/components/common/button-link'
import { Alert } from '@/components/common/alert'
import { ROUTES } from '@/constants/routes'

import styles from './register-form.module.css'

export function RegisterSuccess({ fullName }: { fullName: string }) {
  return (
    <div className={styles.form}>
      <Alert variant="success" title="Đăng ký thành công!">
        Chào mừng {fullName} đến với VIEREC Academy. Bạn có thể đăng nhập để bắt đầu học.
      </Alert>
      <div className={styles.footer}>
        <ButtonLink to={ROUTES.LOGIN} variant="accent" size="lg" block>
          Đăng nhập ngay
        </ButtonLink>
        <ButtonLink to={ROUTES.HOME} variant="ghost">
          Về trang chủ
        </ButtonLink>
      </div>
    </div>
  )
}

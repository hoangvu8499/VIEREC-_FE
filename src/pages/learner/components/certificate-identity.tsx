import { ArrowRight, BadgeCheck } from 'lucide-react'
import { Link } from 'react-router'

import { LEARNER_ROUTES } from '@/constants/routes'
import type { User } from '@/types/user'
import { formatDate } from '@/utils/format-date'
import { userFullName } from '@/utils/user-full-name'

import styles from './learner-ui.module.css'

interface CertificateIdentityProps {
  user: User
}

/** Thông tin in trên chứng chỉ — nhắc học viên kiểm tra trước khi được cấp. */
export function CertificateIdentity({ user }: CertificateIdentityProps) {
  return (
    <section className={styles.identity} aria-labelledby="certificate-identity-title">
      <h2 id="certificate-identity-title" className={styles.identityTitle}>
        <BadgeCheck size={20} aria-hidden /> Thông tin in trên chứng chỉ
      </h2>
      <dl className={styles.identityList}>
        <div>
          <dt>Họ và tên</dt>
          <dd>{userFullName(user) || '—'}</dd>
        </div>
        <div>
          <dt>Ngày sinh</dt>
          <dd>{user.dateOfBirth ? formatDate(user.dateOfBirth) : '—'}</dd>
        </div>
        <div>
          <dt>Số CCCD</dt>
          <dd>{user.cccd || '—'}</dd>
        </div>
      </dl>
      <p className={styles.identityNote}>
        Vì chứng chỉ cho mỗi học viên là duy nhất, vui lòng kiểm tra kỹ các thông tin trên để không
        mất quyền lợi.{' '}
        <Link to={LEARNER_ROUTES.PROFILE} className={styles.inlineLink}>
          Xem hồ sơ <ArrowRight size={14} aria-hidden />
        </Link>
      </p>
    </section>
  )
}

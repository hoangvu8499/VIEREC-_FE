import { CircleCheck } from 'lucide-react'
import { useState } from 'react'

import { Logo } from '@/components/brand/logo'
import { Alert } from '@/components/common/alert'
import { Container } from '@/components/common/container'
import { useDocumentTitle } from '@/hooks/use-document-title'
import { RegisterForm } from '@/pages/register/components/register-form'
import { RegisterSuccess } from '@/pages/register/components/register-success'
import type { User } from '@/types/user'

import styles from './register-page.module.css'

const BENEFITS = [
  'Khóa học về an toàn lao động, hóa chất, PCCC, môi trường và ứng phó sự cố',
  'Chứng chỉ cấp theo đúng thông tin cá nhân của học viên',
  'Theo dõi tiến độ học tập và quản lý chứng chỉ trực tuyến',
]

export default function RegisterPage() {
  useDocumentTitle('Đăng ký')
  const [registeredUser, setRegisteredUser] = useState<User | null>(null)

  return (
    <div className={styles.page}>
      <Container className={styles.inner}>
        <aside className={styles.aside}>
          <Logo variant="compact" />
          <p className={styles.asideTitle}>Trở thành học viên VIEREC Academy</p>
          <p className={styles.asideText}>An toàn hôm nay – Phát triển bền vững ngày mai.</p>
          <ul className={styles.benefits}>
            {BENEFITS.map((benefit) => (
              <li key={benefit}>
                <CircleCheck size={20} aria-hidden />
                {benefit}
              </li>
            ))}
          </ul>
        </aside>

        <section className={styles.card} aria-labelledby="register-title">
          <header className={styles.header}>
            <h1 id="register-title" className={styles.title}>
              Đăng ký tài khoản học viên
            </h1>
            <p className={styles.subtitle}>Điền thông tin bên dưới để tạo tài khoản.</p>
          </header>

          {registeredUser ? (
            <RegisterSuccess
              fullName={`${registeredUser.last_name} ${registeredUser.first_name}`.trim()}
            />
          ) : (
            <>
              <Alert variant="warning" title="Lưu ý quan trọng" className={styles.notice}>
                Vì chứng chỉ cho mỗi học viên là duy nhất, học viên đăng ký vui lòng nhập đúng thông
                tin để không mất quyền lợi.
              </Alert>
              <RegisterForm onSuccess={setRegisteredUser} />
            </>
          )}
        </section>
      </Container>
    </div>
  )
}

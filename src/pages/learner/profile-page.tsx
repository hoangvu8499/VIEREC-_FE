import { Contact, KeyRound, SquarePen, UserRound, type LucideIcon } from 'lucide-react'
import { useState, type ReactNode } from 'react'

import { Alert } from '@/components/common/alert'
import { Button } from '@/components/common/button'
import { ROLE_LABELS, ROLE_ORDER } from '@/constants/roles'
import { USER_STATUS_LABELS } from '@/constants/user'
import { useDocumentTitle } from '@/hooks/use-document-title'
import { useMyCertificates } from '@/hooks/use-enrollments'
import { ChangePasswordForm } from '@/pages/learner/components/change-password-form'
import { AccountPageHeader } from '@/layouts/user/account-page-header'
import { ProfileForm } from '@/pages/learner/components/profile-form'
import { useAuthStore } from '@/stores/auth-store'
import type { User } from '@/types/user'
import { formatDate } from '@/utils/format-date'

import styles from './profile-page.module.css'

interface InfoGroupProps {
  id: string
  title: string
  icon: LucideIcon
  hint?: string
  items?: { label: string; value: ReactNode }[]
  action?: ReactNode
  children?: ReactNode
}

function InfoGroup({ id, title, hint, icon: Icon, items, action, children }: InfoGroupProps) {
  return (
    <section className={styles.group} aria-labelledby={id}>
      <div className={styles.groupHeader}>
        <h2 id={id} className={styles.groupTitle}>
          <span className={styles.groupIcon}>
            <Icon size={18} aria-hidden />
          </span>
          {title}
        </h2>
        {action}
      </div>
      {hint && <p className={styles.hint}>{hint}</p>}
      {items && (
        <dl className={styles.list}>
          {items.map(({ label, value }) => (
            <div key={label} className={styles.row}>
              <dt>{label}</dt>
              <dd>{value || '—'}</dd>
            </div>
          ))}
        </dl>
      )}
      {children}
    </section>
  )
}

/** Vai trò theo thứ tự quyền cao trước; mã lạ giữ nguyên. */
function roleLabels(user: User): string {
  const known = ROLE_ORDER.filter((role) => user.roles.includes(role)).map(
    (role) => ROLE_LABELS[role],
  )
  const unknown = user.roles.filter((role) => !ROLE_ORDER.some((code) => code === role))
  return [...known, ...unknown].join(', ')
}

type Editing = 'profile' | 'password' | null

const SAVED_MESSAGES: Record<Exclude<Editing, null>, string> = {
  profile: 'Đã cập nhật hồ sơ.',
  password: 'Đã đổi mật khẩu. Lần đăng nhập sau hãy dùng mật khẩu mới.',
}

export default function ProfilePage() {
  useDocumentTitle('Hồ sơ cá nhân')
  const user = useAuthStore((state) => state.user)
  const certificates = useMyCertificates()
  const [editing, setEditing] = useState<Editing>(null)
  const [saved, setSaved] = useState<Editing>(null)

  if (!user) return null
  // Đã có chứng chỉ: backend khoá họ tên, ngày sinh, CCCD.
  const identityLocked = (certificates.data?.totalElements ?? 0) > 0

  const startEditing = (next: Exclude<Editing, null>) => {
    setSaved(null)
    setEditing(next)
  }
  const finish = (next: Exclude<Editing, null>) => {
    setEditing(null)
    setSaved(next)
  }

  return (
    <>
      <AccountPageHeader
        title="Hồ sơ cá nhân"
        description="Thông tin bạn đã đăng ký với VIEREC Academy."
        action={
          editing !== 'profile' && (
            <Button variant="outline" onClick={() => startEditing('profile')}>
              <SquarePen size={18} aria-hidden /> Chỉnh sửa hồ sơ
            </Button>
          )
        }
      />

      {saved && <Alert variant="success">{SAVED_MESSAGES[saved]}</Alert>}

      {editing === 'profile' ? (
        <InfoGroup
          id="profile-edit"
          title="Chỉnh sửa hồ sơ"
          icon={SquarePen}
          hint="Họ tên, ngày sinh và CCCD được in trên chứng chỉ — vui lòng nhập đúng như trên CCCD."
        >
          <ProfileForm
            user={user}
            identityLocked={identityLocked}
            onSuccess={() => finish('profile')}
            onCancel={() => setEditing(null)}
          />
        </InfoGroup>
      ) : (
        <div className={styles.groups}>
          <InfoGroup
            id="profile-personal"
            title="Thông tin cá nhân"
            hint="Họ tên, ngày sinh và CCCD được in trên chứng chỉ."
            icon={UserRound}
            items={[
              { label: 'Họ và tên đệm', value: user.lastName },
              { label: 'Tên', value: user.firstName },
              { label: 'Ngày sinh', value: user.dateOfBirth && formatDate(user.dateOfBirth) },
              { label: 'Số CCCD', value: user.cccd },
            ]}
          />
          <InfoGroup
            id="profile-contact"
            title="Liên hệ"
            icon={Contact}
            items={[
              { label: 'Email', value: user.email },
              { label: 'Số điện thoại', value: user.phoneNumber },
              { label: 'Địa chỉ', value: user.address },
            ]}
          />
        </div>
      )}

      <InfoGroup
        id="profile-account"
        title="Tài khoản"
        icon={KeyRound}
        items={[
          { label: 'Tên đăng nhập', value: user.username },
          { label: 'Vai trò', value: roleLabels(user) },
          { label: 'Trạng thái', value: USER_STATUS_LABELS[user.status] },
          { label: 'Ngày tạo', value: formatDate(user.createdAt) },
        ]}
        action={
          editing !== 'password' && (
            <Button variant="outline" size="sm" onClick={() => startEditing('password')}>
              Đổi mật khẩu
            </Button>
          )
        }
      >
        {editing === 'password' && (
          <div className={styles.password}>
            <ChangePasswordForm
              onSuccess={() => finish('password')}
              onCancel={() => setEditing(null)}
            />
          </div>
        )}
      </InfoGroup>
    </>
  )
}

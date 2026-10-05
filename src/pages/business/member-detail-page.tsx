import { ArrowLeft, BookOpen, CalendarPlus, CircleAlert, UserX } from 'lucide-react'
import { useState } from 'react'
import { useLocation, useParams } from 'react-router'

import { Alert } from '@/components/common/alert'
import { Button } from '@/components/common/button'
import { ButtonLink } from '@/components/common/button-link'
import { EmptyState } from '@/components/common/empty-state'
import { MemberCourses } from '@/components/shared/member-courses'
import { API_ERROR_CODES } from '@/constants/api-error-codes'
import { BUSINESS_ROUTES, businessCertificatePath } from '@/constants/routes'
import { useDocumentTitle } from '@/hooks/use-document-title'
import { AccountPageHeader } from '@/layouts/user/account-page-header'
import { businessErrorMessage, useMyMember } from '@/pages/business/use-my-business'
import type { FlashState } from '@/types/navigation'
import { cn } from '@/utils/cn'
import { formatDate } from '@/utils/format-date'

import styles from './business.module.css'

function useUserIdParam(): number | undefined {
  const value = Number(useParams().userId)
  return Number.isInteger(value) && value > 0 ? value : undefined
}

/** Tiến độ và kết quả học tập của một học viên của doanh nghiệp. */
export default function MemberDetailPage() {
  const userId = useUserIdParam()
  const detail = useMyMember(userId)
  const location = useLocation()
  const [flash] = useState((location.state as FlashState | null)?.flash)
  useDocumentTitle(
    detail.data
      ? `${detail.data.member.fullName} – Góc doanh nghiệp`
      : 'Học viên – Góc doanh nghiệp',
  )

  const back = (
    <ButtonLink to={BUSINESS_ROUTES.OVERVIEW} variant="outline">
      <ArrowLeft size={18} aria-hidden /> Danh sách học viên
    </ButtonLink>
  )

  if (!userId || detail.error?.code === API_ERROR_CODES.BUSINESS_MEMBER_NOT_FOUND) {
    return (
      <EmptyState
        icon={UserX}
        title="Không tìm thấy học viên"
        description="Học viên không tồn tại hoặc không thuộc doanh nghiệp của bạn."
        action={back}
      />
    )
  }
  if (detail.isError) {
    return (
      <EmptyState
        icon={CircleAlert}
        tone="danger"
        title="Không tải được thông tin học viên"
        description={businessErrorMessage(detail.error, 'Đã có lỗi xảy ra. Vui lòng thử lại.')}
        action={
          <Button variant="outline" onClick={() => void detail.refetch()}>
            Thử lại
          </Button>
        }
      />
    )
  }
  if (!detail.data) {
    return (
      <p className={styles.loading} aria-busy>
        Đang tải thông tin học viên…
      </p>
    )
  }

  const { member, courses } = detail.data
  return (
    <>
      <AccountPageHeader
        title={member.fullName}
        description={`@${member.username}`}
        action={back}
      />

      {flash && <Alert variant="success">{flash}</Alert>}

      <section className={cn(styles.panel, styles.padded)} aria-labelledby="member-info-title">
        <h2 id="member-info-title" className={styles.panelTitle}>
          Thông tin học viên
        </h2>
        <dl className={styles.info}>
          <div>
            <dt>Ngày sinh</dt>
            <dd>{formatDate(member.dateOfBirth)}</dd>
          </div>
          <div>
            <dt>Số CCCD</dt>
            <dd>{member.cccd}</dd>
          </div>
          <div>
            <dt>Số điện thoại</dt>
            <dd>{member.phoneNumber}</dd>
          </div>
          <div>
            <dt>Email</dt>
            <dd>{member.email}</dd>
          </div>
        </dl>
      </section>

      <section className={cn(styles.panel, styles.padded)} aria-labelledby="member-courses-title">
        <h2 id="member-courses-title" className={styles.panelTitle}>
          Khoá học ({courses.length})
        </h2>
        {courses.length > 0 ? (
          <MemberCourses courses={courses} certificateHref={businessCertificatePath} />
        ) : (
          <EmptyState
            icon={BookOpen}
            title="Học viên chưa đăng ký khoá học nào"
            action={
              <ButtonLink to={BUSINESS_ROUTES.ENROLL} variant="accent">
                <CalendarPlus size={18} aria-hidden /> Đăng ký khoá học
              </ButtonLink>
            }
          />
        )}
      </section>
    </>
  )
}

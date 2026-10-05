import { BookOpen, CircleAlert, UserX } from 'lucide-react'
import { Link, useParams } from 'react-router'

import { Button } from '@/components/common/button'
import { EmptyState } from '@/components/common/empty-state'
import { MemberCourses } from '@/components/shared/member-courses'
import { API_ERROR_CODES } from '@/constants/api-error-codes'
import { ADMIN_ROUTES, adminBusinessPath, adminUserPath } from '@/constants/routes'
import { useDocumentTitle } from '@/hooks/use-document-title'
import { AdminPageHeader } from '@/layouts/admin/admin-page-header'
import { useBusiness, useBusinessMember } from '@/pages/admin/businesses/use-businesses'
import { apiErrorMessage } from '@/utils/api-error-message'
import { formatDate } from '@/utils/format-date'

import styles from './components/business.module.css'

function usePositiveParam(name: 'businessId' | 'userId'): number | undefined {
  const value = Number(useParams()[name])
  return Number.isInteger(value) && value > 0 ? value : undefined
}

/** Tiến độ, điểm thi, chứng chỉ của một học viên doanh nghiệp (admin xem như người quản lý). */
export default function BusinessMemberPage() {
  const businessId = usePositiveParam('businessId')
  const userId = usePositiveParam('userId')
  const business = useBusiness(businessId)
  const detail = useBusinessMember(businessId, userId)
  useDocumentTitle(
    detail.data ? `${detail.data.member.fullName} – Quản trị` : 'Học viên doanh nghiệp – Quản trị',
  )

  const back = {
    to: businessId ? adminBusinessPath(businessId) : ADMIN_ROUTES.BUSINESSES,
    label: business.data?.name ?? 'Doanh nghiệp',
  }

  if (!businessId || !userId || detail.error?.code === API_ERROR_CODES.BUSINESS_MEMBER_NOT_FOUND) {
    return (
      <>
        <AdminPageHeader back={back} title="Không tìm thấy học viên" />
        <EmptyState
          icon={UserX}
          title="Học viên không thuộc doanh nghiệp này"
          description="Học viên có thể đã bị xoá hoặc chuyển khỏi doanh nghiệp."
        />
      </>
    )
  }
  if (detail.isError) {
    return (
      <>
        <AdminPageHeader back={back} title="Học viên doanh nghiệp" />
        <EmptyState
          icon={CircleAlert}
          tone="danger"
          title="Không tải được thông tin học viên"
          description={apiErrorMessage(detail.error, {
            fallback: 'Đã có lỗi xảy ra. Vui lòng thử lại.',
          })}
          action={
            <Button variant="outline" onClick={() => void detail.refetch()}>
              Thử lại
            </Button>
          }
        />
      </>
    )
  }
  if (!detail.data) {
    return (
      <>
        <AdminPageHeader back={back} title="Học viên doanh nghiệp" />
        <p className={styles.loading} aria-busy>
          Đang tải thông tin học viên…
        </p>
      </>
    )
  }

  const { member, courses } = detail.data
  return (
    <>
      <AdminPageHeader
        back={back}
        title={member.fullName}
        description={`@${member.username} · ${member.phoneNumber} · ${member.email}`}
      />
      <div className={styles.layout}>
        <div className={styles.aside}>
          <section className={styles.card} aria-labelledby="member-info-title">
            <h2 id="member-info-title" className={styles.cardTitle}>
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
                <dt>Tạo tài khoản</dt>
                <dd>{formatDate(member.createdAt)}</dd>
              </div>
            </dl>
            <Link className={styles.summary} to={adminUserPath('USER_DETAIL', member.id)}>
              Xem tài khoản trong mục Người dùng
            </Link>
          </section>
        </div>
        <section className={styles.card} aria-labelledby="member-courses-title">
          <h2 id="member-courses-title" className={styles.cardTitle}>
            <BookOpen size={18} aria-hidden /> Khoá học ({courses.length})
          </h2>
          {courses.length > 0 ? (
            <MemberCourses courses={courses} />
          ) : (
            <EmptyState icon={BookOpen} title="Học viên chưa đăng ký khoá học nào" />
          )}
        </section>
      </div>
    </>
  )
}

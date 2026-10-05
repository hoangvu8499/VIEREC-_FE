import { BookOpenCheck, RotateCw, Search } from 'lucide-react'
import { useSearchParams } from 'react-router'

import { Button } from '@/components/common/button'
import { ButtonLink } from '@/components/common/button-link'
import { EmptyState } from '@/components/common/empty-state'
import { Pagination } from '@/components/common/pagination'
import { ENROLLMENT_STATUS_LABELS, ENROLLMENT_STATUSES } from '@/constants/course'
import { LEARNER_ROUTES } from '@/constants/routes'
import { useDocumentTitle } from '@/hooks/use-document-title'
import { useMyEnrollments } from '@/hooks/use-enrollments'
import { EnrollmentItem } from '@/pages/learner/components/enrollment-item'
import { AccountPageHeader } from '@/layouts/user/account-page-header'
import type { EnrollmentStatus } from '@/types/course'
import { apiErrorMessage } from '@/utils/api-error-message'
import { cn } from '@/utils/cn'

import styles from './my-courses-page.module.css'

/** Tham số trên URL (`?trang-thai=COMPLETED&trang=2`), trang đếm từ 1. */
const PARAM = { STATUS: 'trang-thai', PAGE: 'trang' } as const

const FILTERS: { value: EnrollmentStatus | undefined; label: string }[] = [
  // Bỏ trống: backend trả mọi trạng thái trừ CANCELLED.
  { value: undefined, label: 'Tất cả' },
  ...ENROLLMENT_STATUSES.map((status) => ({
    value: status,
    label: ENROLLMENT_STATUS_LABELS[status],
  })),
]

const EMPTY_TEXT: Record<EnrollmentStatus | 'ALL', string> = {
  ALL: 'Bạn chưa đăng ký khoá học nào.',
  PENDING: 'Bạn không có yêu cầu đăng ký nào đang chờ duyệt.',
  ENROLLED: 'Bạn không có khoá học nào đang học.',
  COMPLETED: 'Bạn chưa hoàn thành khoá học nào.',
  CANCELLED: 'Bạn chưa huỷ khoá học nào.',
}

function isEnrollmentStatus(value: string | null): value is EnrollmentStatus {
  return ENROLLMENT_STATUSES.some((status) => status === value)
}

function useMyCoursesParams() {
  const [searchParams, setSearchParams] = useSearchParams()
  const statusParam = searchParams.get(PARAM.STATUS)
  const pageParam = Number(searchParams.get(PARAM.PAGE))
  const status = isEnrollmentStatus(statusParam) ? statusParam : undefined
  const page = Number.isInteger(pageParam) && pageParam > 1 ? pageParam - 1 : 0

  const update = (next: { status?: EnrollmentStatus; page: number }) => {
    const search = new URLSearchParams()
    if (next.status) search.set(PARAM.STATUS, next.status)
    if (next.page) search.set(PARAM.PAGE, String(next.page + 1))
    setSearchParams(search)
  }

  return {
    status,
    page,
    setStatus: (nextStatus: EnrollmentStatus | undefined) =>
      update({ status: nextStatus, page: 0 }),
    setPage: (nextPage: number) => update({ status, page: nextPage }),
  }
}

export default function MyCoursesPage() {
  useDocumentTitle('Khoá học của tôi')
  const { status, page, setStatus, setPage } = useMyCoursesParams()
  const enrollments = useMyEnrollments({ status, page })
  const data = enrollments.data

  return (
    <>
      <AccountPageHeader
        title="Khoá học của tôi"
        description="Các khoá bạn đã đăng ký: chờ duyệt, đang học và đã hoàn thành."
        action={
          <ButtonLink to={LEARNER_ROUTES.ENROLL} variant="outline">
            <Search size={18} aria-hidden /> Tìm thêm khoá học
          </ButtonLink>
        }
      />

      <section className={styles.panel} aria-label="Danh sách khoá học của tôi">
        <fieldset className={styles.filters}>
          <legend className="sr-only">Lọc theo trạng thái</legend>
          {FILTERS.map(({ value, label }) => (
            <button
              key={label}
              type="button"
              className={cn(styles.filter, status === value && styles.active)}
              aria-pressed={status === value}
              onClick={() => setStatus(value)}
            >
              {label}
            </button>
          ))}
        </fieldset>

        {enrollments.isPending ? (
          <p className={styles.loading} aria-busy>
            Đang tải khoá học…
          </p>
        ) : enrollments.isError ? (
          <EmptyState
            icon={RotateCw}
            tone="danger"
            title="Không tải được khoá học của bạn"
            description={apiErrorMessage(enrollments.error, {
              fallback: 'Đã có lỗi xảy ra. Vui lòng thử lại.',
            })}
            action={
              <Button variant="outline" onClick={() => void enrollments.refetch()}>
                Thử lại
              </Button>
            }
          />
        ) : data && data.content.length > 0 ? (
          <>
            <ul className={styles.list} aria-busy={enrollments.isPlaceholderData}>
              {data.content.map((enrollment) => (
                <li key={enrollment.id}>
                  <EnrollmentItem enrollment={enrollment} />
                </li>
              ))}
            </ul>
            <Pagination
              className={styles.pagination}
              page={data.page}
              totalPages={data.totalPages}
              onChange={setPage}
              label="Phân trang khoá học của tôi"
            />
          </>
        ) : (
          <EmptyState
            icon={BookOpenCheck}
            title={EMPTY_TEXT[status ?? 'ALL']}
            description="Chọn một khoá học đang mở để bắt đầu."
            action={
              <ButtonLink to={LEARNER_ROUTES.ENROLL} variant="accent">
                <Search size={18} aria-hidden /> Tìm khoá học
              </ButtonLink>
            }
          />
        )}
      </section>
    </>
  )
}

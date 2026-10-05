import { ArrowRight } from 'lucide-react'
import { Link } from 'react-router'

import { SectionHeader } from '@/components/common/section-header'
import { CourseCard } from '@/components/shared/course-card'
import { LEARNER_NAV } from '@/constants/learner-navigation'
import { LEARNER_ROUTES } from '@/constants/routes'
import { useDocumentTitle } from '@/hooks/use-document-title'
import { useMyCertificates, useMyEnrollments } from '@/hooks/use-enrollments'
import { usePublishedCourses } from '@/hooks/use-published-courses'
import { CertificateIdentity } from '@/pages/learner/components/certificate-identity'
import { EnrollmentItem } from '@/pages/learner/components/enrollment-item'
import { AccountPageHeader } from '@/layouts/user/account-page-header'
import { useAuthStore } from '@/stores/auth-store'
import { cn } from '@/utils/cn'

import styles from './overview-page.module.css'

/** Màu thẻ lối tắt theo mục. */
const SHORTCUT_TONES: Record<string, 'primary' | 'accent' | 'secondary' | 'neutral'> = {
  [LEARNER_ROUTES.MY_COURSES]: 'primary',
  [LEARNER_ROUTES.ENROLL]: 'accent',
  [LEARNER_ROUTES.PAYMENTS]: 'neutral',
  [LEARNER_ROUTES.CERTIFICATES]: 'secondary',
  [LEARNER_ROUTES.PROFILE]: 'neutral',
}

/** Số khoá mới / khoá đang học hiện ở trang tổng quan. */
const LATEST_LIMIT = 3

const numberFormatter = new Intl.NumberFormat('vi-VN')

/** Số liệu trên thẻ lối tắt; `undefined` khi đang tải / lỗi (không hiện số đoán). */
function useShortcutStats(): Partial<Record<string, string>> {
  const pending = useMyEnrollments({ status: 'PENDING', size: 1 })
  const learning = useMyEnrollments({ status: 'ENROLLED', size: LATEST_LIMIT })
  const completed = useMyEnrollments({ status: 'COMPLETED', size: 1 })
  const certificates = useMyCertificates()
  const count = (value: number | undefined) =>
    value === undefined ? undefined : numberFormatter.format(value)

  const learningCount = count(learning.data?.totalElements)
  const completedCount = count(completed.data?.totalElements)
  const certificateCount = count(certificates.data?.totalElements)
  const pendingCount = pending.data?.totalElements
  return {
    [LEARNER_ROUTES.MY_COURSES]:
      learningCount !== undefined && completedCount !== undefined
        ? [
            pendingCount ? `${count(pendingCount)} chờ duyệt` : undefined,
            `${learningCount} đang học`,
            `${completedCount} đã hoàn thành`,
          ]
            .filter(Boolean)
            .join(' · ')
        : undefined,
    [LEARNER_ROUTES.CERTIFICATES]:
      certificateCount !== undefined ? `${certificateCount} chứng chỉ` : undefined,
  }
}

/** Khoá đang học (tối đa 3). Chưa có thì ẩn khối. */
function ContinueLearning() {
  const learning = useMyEnrollments({ status: 'ENROLLED', size: LATEST_LIMIT })
  const items = learning.data?.content ?? []
  if (items.length === 0) return null

  return (
    <section className={styles.panel} aria-labelledby="continue-title">
      <SectionHeader
        id="continue-title"
        title="Tiếp tục học"
        viewAllTo={LEARNER_ROUTES.MY_COURSES}
        viewAllLabel="Khoá học của tôi"
      />
      <ul className={styles.enrollments}>
        {items.map((enrollment) => (
          <li key={enrollment.id}>
            <EnrollmentItem enrollment={enrollment} />
          </li>
        ))}
      </ul>
    </section>
  )
}

function LatestCourses() {
  // Như trang "Đăng ký khoá học": bỏ khoá đã được duyệt / đã hoàn thành.
  const courses = usePublishedCourses({ page: 0, excludeLearning: true })
  const items = courses.data?.content.slice(0, LATEST_LIMIT) ?? []

  // Lỗi / chưa có khoá: ẩn khối (đã có trang "Đăng ký khoá học" báo lỗi chi tiết).
  if (courses.isError || (courses.isSuccess && items.length === 0)) return null

  return (
    <section className={styles.panel} aria-labelledby="latest-courses-title">
      <SectionHeader
        id="latest-courses-title"
        title="Khoá học mới mở"
        viewAllTo={LEARNER_ROUTES.ENROLL}
        viewAllLabel="Xem tất cả"
      />
      {courses.isPending ? (
        <p className={styles.loading} aria-busy>
          Đang tải khoá học…
        </p>
      ) : (
        <ul className={styles.courses}>
          {items.map((course) => (
            <li key={course.id}>
              <CourseCard course={course} />
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}

export default function OverviewPage() {
  useDocumentTitle('Góc học viên')
  const user = useAuthStore((state) => state.user)
  const shortcuts = LEARNER_NAV.filter((item) => item.path !== LEARNER_ROUTES.OVERVIEW)
  const stats = useShortcutStats()

  return (
    <>
      <AccountPageHeader
        title="Góc học viên"
        description="Khoá học, chứng chỉ và hồ sơ của bạn tại VIEREC Academy."
      />

      <nav aria-label="Lối tắt">
        <ul className={styles.shortcuts}>
          {shortcuts.map(({ label, path, icon: Icon, description }) => (
            <li key={path}>
              <Link
                to={path}
                className={cn(styles.shortcut, styles[SHORTCUT_TONES[path] ?? 'primary'])}
              >
                <span className={styles.shortcutIcon}>
                  {Icon && <Icon size={22} aria-hidden />}
                </span>
                <span className={styles.shortcutBody}>
                  <span className={styles.shortcutLabel}>{label}</span>
                  {stats[path] && <span className={styles.stat}>{stats[path]}</span>}
                  <span className={styles.shortcutText}>{description}</span>
                </span>
                <ArrowRight className={styles.shortcutArrow} size={18} aria-hidden />
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      <ContinueLearning />

      <LatestCourses />

      {user && <CertificateIdentity user={user} />}
    </>
  )
}

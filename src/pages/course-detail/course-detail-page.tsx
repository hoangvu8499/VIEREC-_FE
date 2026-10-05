import {
  ArrowLeft,
  BookOpen,
  CalendarDays,
  CircleAlert,
  FileText,
  Phone,
  PlayCircle,
  UserRound,
} from 'lucide-react'
import { Link, useLocation } from 'react-router'

import { Alert } from '@/components/common/alert'
import { Button } from '@/components/common/button'
import { ButtonLink } from '@/components/common/button-link'
import { Container } from '@/components/common/container'
import { EmptyState } from '@/components/common/empty-state'
import { courseVisual } from '@/components/shared/course-visual'
import { EnrollAction } from '@/components/shared/enroll-action'
import { API_ERROR_CODES } from '@/constants/api-error-codes'
import { CONTACT } from '@/constants/contact'
import { ROUTES } from '@/constants/routes'
import { useCourseDetail, usePositiveIdParam } from '@/hooks/use-course-detail'
import { useDocumentTitle } from '@/hooks/use-document-title'
import { useAuthStore } from '@/stores/auth-store'
import type { CourseDetail, Lesson } from '@/types/course'
import { apiErrorMessage } from '@/utils/api-error-message'
import { cn } from '@/utils/cn'
import { formatVnd } from '@/utils/format-currency'
import { formatDate } from '@/utils/format-date'

import styles from './course-detail-page.module.css'

function hasVideo(lesson: Lesson): boolean {
  return Boolean(lesson.videoUrl) || lesson.files.some((file) => file.fileType === 'VIDEO')
}

function CourseContent({ course }: { course: CourseDetail }) {
  const location = useLocation()
  const user = useAuthStore((state) => state.user)
  const { icon: Icon, tone, label } = courseVisual(course.name)
  const lessonCount = course.lessons.length
  const documentCount = course.lessons.filter((lesson) =>
    lesson.files.some((file) => file.fileType === 'DOCUMENT'),
  ).length
  const videoCount = course.lessons.filter(hasVideo).length
  const loginState = { from: location.pathname }

  return (
    <>
      <section className={cn(styles.hero, styles[tone])} aria-labelledby="course-title">
        <Container className={styles.heroInner}>
          <Link to={ROUTES.COURSES} className={styles.back}>
            <ArrowLeft size={16} aria-hidden /> Tất cả khoá học
          </Link>
          <p className={styles.field}>
            <Icon size={16} aria-hidden /> {label}
          </p>
          <h1 id="course-title" className={styles.title}>
            {course.name}
          </h1>
          <ul className={styles.heroMeta}>
            <li>
              <UserRound size={18} aria-hidden /> Giảng viên:{' '}
              <strong>{course.instructorName}</strong>
            </li>
            <li>
              <BookOpen size={18} aria-hidden /> <strong>{lessonCount}</strong> bài học
            </li>
            <li>
              <CalendarDays size={18} aria-hidden /> Cập nhật {formatDate(course.updatedAt)}
            </li>
          </ul>
          <Icon className={styles.heroIcon} size={220} strokeWidth={1} aria-hidden />
        </Container>
      </section>

      <Container className={styles.body}>
        <div className={styles.main}>
          {course.status !== 'PUBLISHED' && (
            <Alert variant="warning" title="Khoá học chưa xuất bản">
              Bạn đang xem với quyền quản trị. Học viên chưa thấy khoá học này.
            </Alert>
          )}

          <section className={styles.card} aria-labelledby="about-title">
            <h2 id="about-title" className={styles.cardTitle}>
              Giới thiệu khoá học
            </h2>
            <p className={styles.description}>{course.description}</p>
          </section>

          <section className={styles.card} aria-labelledby="outline-title" id="noi-dung">
            <h2 id="outline-title" className={styles.cardTitle}>
              Nội dung khoá học
              <span className={styles.badge}>{lessonCount} bài</span>
            </h2>
            {lessonCount === 0 ? (
              <EmptyState
                icon={BookOpen}
                title="Bài học đang được cập nhật"
                description="Nội dung chi tiết của khoá học sẽ sớm có mặt."
              />
            ) : (
              <ol className={styles.outline}>
                {course.lessons.map((lesson, index) => (
                  <li key={lesson.id} className={styles.lesson}>
                    <span className={styles.step} aria-hidden>
                      {String(index + 1).padStart(2, '0')}
                    </span>
                    <div className={styles.lessonBody}>
                      <h3 className={styles.lessonTitle}>{lesson.title}</h3>
                      <p className={styles.lessonText}>{lesson.instructions}</p>
                    </div>
                  </li>
                ))}
              </ol>
            )}
          </section>
        </div>

        <aside className={styles.aside} aria-label="Tóm tắt khoá học">
          <div className={styles.summary}>
            <div className={cn(styles.summaryCover, styles[tone])} aria-hidden>
              <Icon size={64} strokeWidth={1.5} />
            </div>
            <div className={styles.summaryBody}>
              <p className={styles.price}>
                <span>Học phí</span>
                <strong>{formatVnd(course.price)}</strong>
              </p>
              <p className={styles.summaryTitle}>Khoá học gồm</p>
              <ul className={styles.includes}>
                <li>
                  <BookOpen size={18} aria-hidden /> {lessonCount} bài học
                </li>
                <li>
                  <FileText size={18} aria-hidden /> {documentCount} tài liệu đọc
                </li>
                <li>
                  <PlayCircle size={18} aria-hidden /> {videoCount} video bài giảng
                </li>
              </ul>
              {user ? (
                course.status === 'PUBLISHED' && <EnrollAction course={course} />
              ) : (
                <>
                  <ButtonLink to={ROUTES.REGISTER} variant="accent" block>
                    Đăng ký tài khoản học viên
                  </ButtonLink>
                  <ButtonLink to={ROUTES.LOGIN} state={loginState} variant="outline" block>
                    Tôi đã có tài khoản
                  </ButtonLink>
                </>
              )}
              <p className={styles.hotline}>
                <Phone size={16} aria-hidden />
                <span>
                  Cần tư vấn cho doanh nghiệp?
                  <a href={`tel:${CONTACT.HOTLINE.replace(/\s/g, '')}`}>{CONTACT.HOTLINE}</a>
                </span>
              </p>
            </div>
          </div>
        </aside>
      </Container>
    </>
  )
}

export default function CourseDetailPage() {
  const courseId = usePositiveIdParam('courseId')
  const course = useCourseDetail(courseId)
  useDocumentTitle(course.data?.name ?? 'Khoá học')

  const notFound =
    !courseId || (course.isError && course.error.code === API_ERROR_CODES.COURSE_NOT_FOUND)

  return (
    <div className={styles.page}>
      {notFound ? (
        <Container className={styles.state}>
          <EmptyState
            icon={CircleAlert}
            tone="danger"
            title="Không tìm thấy khoá học"
            description="Khoá học không tồn tại, đã bị gỡ hoặc chưa được mở."
            action={
              <ButtonLink to={ROUTES.COURSES} variant="accent">
                Xem các khoá học khác
              </ButtonLink>
            }
          />
        </Container>
      ) : course.isPending ? (
        <Container className={styles.state}>
          <p className={styles.loading} aria-busy>
            Đang tải khoá học…
          </p>
        </Container>
      ) : course.isError ? (
        <Container className={styles.state}>
          <EmptyState
            icon={CircleAlert}
            tone="danger"
            title="Không tải được khoá học"
            description={apiErrorMessage(course.error, {
              fallback: 'Đã có lỗi xảy ra. Vui lòng thử lại.',
            })}
            action={
              <Button variant="outline" onClick={() => void course.refetch()}>
                Thử lại
              </Button>
            }
          />
        </Container>
      ) : (
        <CourseContent course={course.data} />
      )}
    </div>
  )
}

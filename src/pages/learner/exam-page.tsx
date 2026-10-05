import { ArrowLeft, CircleAlert, ClipboardX, Lock } from 'lucide-react'

import { Button } from '@/components/common/button'
import { ButtonLink } from '@/components/common/button-link'
import { EmptyState } from '@/components/common/empty-state'
import { API_ERROR_CODES } from '@/constants/api-error-codes'
import { CONTACT } from '@/constants/contact'
import { coursePath, learnPath, LEARNER_ROUTES } from '@/constants/routes'
import { useCourseDetail, usePositiveIdParam } from '@/hooks/use-course-detail'
import { useDocumentTitle } from '@/hooks/use-document-title'
import { ExamIntro } from '@/pages/learner/components/exam-intro'
import { ExamPaper } from '@/pages/learner/components/exam-paper'
import { ExamResult } from '@/pages/learner/components/exam-result'
import { AccountPageHeader } from '@/layouts/user/account-page-header'
import { useMyExam } from '@/pages/learner/use-my-exam'
import type { ApiError } from '@/types/api'
import { apiErrorMessage } from '@/utils/api-error-message'

import styles from './learn-page.module.css'

function LoadError({ error, onRetry }: { error: ApiError; onRetry: () => void }) {
  return (
    <EmptyState
      icon={CircleAlert}
      tone="danger"
      title="Không tải được bài thi"
      description={apiErrorMessage(error, { fallback: 'Đã có lỗi xảy ra. Vui lòng thử lại.' })}
      action={
        <Button variant="outline" onClick={onRetry}>
          Thử lại
        </Button>
      }
    />
  )
}

/** Làm bài thi chứng chỉ: quy chế → bài làm (đếm ngược) → kết quả. Server chấm điểm. */
export default function ExamPage() {
  const courseId = usePositiveIdParam('courseId')
  const course = useCourseDetail(courseId)
  const exam = useMyExam(courseId)
  useDocumentTitle(course.data ? `Thi chứng chỉ: ${course.data.name}` : 'Thi chứng chỉ')

  if (!courseId || course.error?.code === API_ERROR_CODES.COURSE_NOT_FOUND) {
    return (
      <EmptyState
        icon={CircleAlert}
        tone="danger"
        title="Không tìm thấy khoá học"
        description="Khoá học không tồn tại hoặc đã bị gỡ."
        action={
          <ButtonLink to={LEARNER_ROUTES.MY_COURSES} variant="accent">
            Về khoá học của tôi
          </ButtonLink>
        }
      />
    )
  }

  if (course.isError) {
    return <LoadError error={course.error} onRetry={() => void course.refetch()} />
  }

  const status = course.data?.myEnrollmentStatus
  const learning = status === 'ENROLLED' || status === 'COMPLETED'
  if ((course.data && !learning) || exam.error?.code === API_ERROR_CODES.EXAM_NOT_ALLOWED) {
    return (
      <EmptyState
        icon={Lock}
        title="Bạn chưa thể thi khoá học này"
        description="Chỉ học viên đã được duyệt vào khoá học mới được thi chứng chỉ."
        action={
          <ButtonLink to={coursePath(courseId)} variant="accent">
            Xem khoá học
          </ButtonLink>
        }
      />
    )
  }

  if (exam.error?.code === API_ERROR_CODES.EXAM_NOT_FOUND) {
    return (
      <EmptyState
        icon={ClipboardX}
        title="Khoá học chưa có bài thi chứng chỉ"
        description={`Bài thi trực tuyến của khoá học chưa sẵn sàng. Vui lòng gọi ${CONTACT.HOTLINE} để được hỗ trợ.`}
        action={
          <ButtonLink to={learnPath(courseId)} variant="outline">
            <ArrowLeft size={18} aria-hidden /> Về bài học
          </ButtonLink>
        }
      />
    )
  }

  if (exam.isError) {
    return <LoadError error={exam.error} onRetry={() => void exam.refetch()} />
  }

  if (!course.data || !exam.data) {
    return (
      <p className={styles.loading} aria-busy>
        Đang tải bài thi…
      </p>
    )
  }

  const { attempt } = exam.data
  return (
    <>
      <AccountPageHeader
        title={exam.data.title}
        description={course.data.name}
        // Đang làm bài thì không đặt link rời trang ngay cạnh đồng hồ.
        action={
          attempt?.status !== 'IN_PROGRESS' && (
            <ButtonLink to={learnPath(courseId)} variant="outline">
              <ArrowLeft size={18} aria-hidden /> Về bài học
            </ButtonLink>
          )
        }
      />
      {!attempt && <ExamIntro course={course.data} exam={exam.data} />}
      {attempt?.status === 'IN_PROGRESS' && (
        // `key`: lượt thi khác thì đếm giờ và đáp án làm lại từ đầu.
        <ExamPaper key={attempt.id} courseId={courseId} attempt={attempt} />
      )}
      {attempt?.status === 'SUBMITTED' && <ExamResult attempt={attempt} />}
    </>
  )
}

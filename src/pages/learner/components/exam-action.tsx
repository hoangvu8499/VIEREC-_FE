import { Award, ClipboardCheck, GraduationCap } from 'lucide-react'
import type { ReactNode } from 'react'

import { Button } from '@/components/common/button'
import { ButtonLink } from '@/components/common/button-link'
import { API_ERROR_CODES } from '@/constants/api-error-codes'
import { CONTACT } from '@/constants/contact'
import { EXAM_WATCH_RATIO } from '@/constants/course'
import { EXAM_MAX_SCORE } from '@/constants/exam'
import { examPath, LEARNER_ROUTES } from '@/constants/routes'
import { useMyExam } from '@/pages/learner/use-my-exam'
import { formatScore } from '@/utils/exam-score'

import styles from './exam-action.module.css'

const percentFormatter = new Intl.NumberFormat('vi-VN', { style: 'percent' })
const HINT_ID = 'exam-hint'

interface ExamActionProps {
  courseId: number
  /** Đã xem đủ video để mở bài thi. */
  watchedEnough: boolean
  /** Lượt đăng ký đã hoàn thành (thi đạt, hoặc admin xác nhận). */
  completed: boolean
}

/** Nút thi chứng chỉ ở trang học: theo tiến độ xem video và lượt thi của học viên. */
export function ExamAction({ courseId, watchedEnough, completed }: ExamActionProps) {
  const exam = useMyExam(courseId)
  const attempt = exam.data?.attempt
  const result = attempt?.status === 'SUBMITTED' ? attempt : undefined
  const resultText =
    result &&
    `Điểm thi ${formatScore(result.score)}/${EXAM_MAX_SCORE} · ${result.passed ? 'Đạt' : 'Không đạt'}`
  const resultLink = (
    <ButtonLink to={examPath(courseId)} variant="outline">
      <ClipboardCheck size={18} aria-hidden /> Xem kết quả thi
    </ButtonLink>
  )

  if (completed) {
    return (
      <Layout hint={resultText}>
        {result && resultLink}
        <ButtonLink to={LEARNER_ROUTES.CERTIFICATES} variant="outline">
          <Award size={18} aria-hidden /> Xem chứng chỉ
        </ButtonLink>
      </Layout>
    )
  }
  if (result) {
    return <Layout hint={`${resultText}. Mỗi học viên chỉ được thi 1 lần.`}>{resultLink}</Layout>
  }
  if (attempt?.status === 'IN_PROGRESS') {
    return (
      <Layout hint="Bạn đang làm bài thi dở, đồng hồ vẫn đang chạy.">
        <ButtonLink to={examPath(courseId)} variant="accent">
          <GraduationCap size={18} aria-hidden /> Tiếp tục làm bài
        </ButtonLink>
      </Layout>
    )
  }
  if (watchedEnough && exam.data) {
    return (
      <Layout hint="Bạn đã đủ điều kiện thi chứng chỉ.">
        <ButtonLink to={examPath(courseId)} variant="accent">
          <GraduationCap size={18} aria-hidden /> Thi chứng chỉ
        </ButtonLink>
      </Layout>
    )
  }

  let hint = `Xem tối thiểu ${percentFormatter.format(EXAM_WATCH_RATIO)} tổng thời lượng video để mở bài thi.`
  if (exam.error?.code === API_ERROR_CODES.EXAM_NOT_FOUND) {
    hint = `Khoá học chưa có bài thi trực tuyến. Vui lòng gọi ${CONTACT.HOTLINE} để đăng ký thi.`
  } else if (watchedEnough) {
    hint = exam.isError ? 'Không tải được bài thi. Vui lòng tải lại trang.' : 'Đang tải bài thi…'
  }
  return (
    <Layout hint={hint}>
      <Button variant="accent" disabled aria-describedby={HINT_ID}>
        <GraduationCap size={18} aria-hidden /> Thi chứng chỉ
      </Button>
    </Layout>
  )
}

function Layout({ hint, children }: { hint?: string; children: ReactNode }) {
  return (
    <div className={styles.exam}>
      <div className={styles.examButtons}>{children}</div>
      {hint && (
        <p id={HINT_ID} className={styles.hint}>
          {hint}
        </p>
      )}
    </div>
  )
}

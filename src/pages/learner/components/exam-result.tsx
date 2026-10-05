import { Award, CircleX } from 'lucide-react'

import { Alert } from '@/components/common/alert'
import { ButtonLink } from '@/components/common/button-link'
import { CONTACT } from '@/constants/contact'
import { EXAM_MAX_SCORE } from '@/constants/exam'
import { LEARNER_ROUTES } from '@/constants/routes'
import type { ExamAttemptResult } from '@/types/exam'
import { cn } from '@/utils/cn'
import { formatDateTime } from '@/utils/format-date-time'
import { formatScore } from '@/utils/exam-score'

import styles from './exam.module.css'

interface ExamResultProps {
  attempt: ExamAttemptResult
}

export function ExamResult({ attempt }: ExamResultProps) {
  const { passed } = attempt
  const Icon = passed ? Award : CircleX

  return (
    <section className={cn(styles.card, styles.result)} aria-labelledby="exam-result-title">
      <span className={cn(styles.resultIcon, passed ? styles.pass : styles.fail)} aria-hidden>
        <Icon size={32} />
      </span>
      <h2 id="exam-result-title" className={styles.resultTitle}>
        {passed ? 'Chúc mừng, bạn đã thi đạt!' : 'Bạn chưa đạt bài thi'}
      </h2>

      <p className={styles.score}>
        <span className="sr-only">Điểm thi: </span>
        <strong>{formatScore(attempt.score)}</strong>
        <span>/{EXAM_MAX_SCORE} điểm</span>
      </p>
      <p className={cn(styles.verdict, passed ? styles.pass : styles.fail)}>
        {passed ? 'Đạt' : 'Không đạt'}
      </p>

      <dl className={styles.facts}>
        <div>
          <dt>Số câu đúng</dt>
          <dd>
            {attempt.correctCount}/{attempt.questionCount}
          </dd>
        </div>
        <div>
          <dt>Điểm đạt</dt>
          <dd>
            {formatScore(attempt.passScore)}/{EXAM_MAX_SCORE}
          </dd>
        </div>
        <div>
          <dt>Nộp bài lúc</dt>
          <dd>{formatDateTime(attempt.submittedAt)}</dd>
        </div>
      </dl>

      {passed ? (
        <Alert variant="success">
          Khoá học đã được ghi nhận hoàn thành. Chứng chỉ do VIEREC cấp sẽ hiện ở mục Chứng chỉ của
          bạn.
        </Alert>
      ) : (
        <Alert variant="info">
          Mỗi học viên chỉ được thi 1 lần. Cần hỗ trợ thi lại, vui lòng gọi hotline{' '}
          {CONTACT.HOTLINE}.
        </Alert>
      )}

      {passed && (
        <div className={styles.actions}>
          <ButtonLink to={LEARNER_ROUTES.CERTIFICATES} variant="accent">
            <Award size={18} aria-hidden /> Chứng chỉ của tôi
          </ButtonLink>
        </div>
      )}
    </section>
  )
}

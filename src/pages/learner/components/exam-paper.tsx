import { Clock, Send } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'

import { Alert } from '@/components/common/alert'
import { Button } from '@/components/common/button'
import { ConfirmDialog } from '@/components/common/confirm-dialog'
import { RadioGroupField } from '@/components/form/radio-group-field'
import { EXAM_OPTION_FIELDS, EXAM_OPTIONS } from '@/constants/exam'
import {
  submitExamErrorMessage,
  useCountdown,
  useExamAnswers,
  useSubmitExam,
} from '@/pages/learner/use-my-exam'
import type { ExamAttemptInProgress, ExamOption } from '@/types/exam'
import { cn } from '@/utils/cn'

import styles from './exam.module.css'

/** Dưới mốc này (giây) đồng hồ chuyển màu cảnh báo. */
const WARNING_SECONDS = 5 * 60

const pad = (value: number) => String(value).padStart(2, '0')

/** `754` → `12:34`; từ 1 giờ: `1:02:03`. */
function formatClock(seconds: number): string {
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const clock = `${pad(minutes)}:${pad(seconds % 60)}`
  return hours > 0 ? `${hours}:${clock}` : clock
}

/** Báo cho trình đọc màn hình ở các mốc, không đọc từng giây. */
function timeAnnouncement(seconds: number): string {
  if (seconds === 0) return 'Hết giờ làm bài'
  if (seconds <= 60) return 'Còn 1 phút'
  if (seconds <= WARNING_SECONDS) return 'Còn 5 phút'
  return ''
}

function questionAnchor(index: number): string {
  return `cau-${index + 1}`
}

interface ExamPaperProps {
  courseId: number
  attempt: ExamAttemptInProgress
}

/** Bài làm: đồng hồ đếm ngược, chọn đáp án, nộp bài (hết giờ tự nộp). */
export function ExamPaper({ courseId, attempt }: ExamPaperProps) {
  const { answers, choose } = useExamAnswers(attempt.id)
  const remaining = useCountdown(attempt.remainingSeconds)
  const submit = useSubmitExam(courseId)
  const [confirming, setConfirming] = useState(false)

  const timeUp = remaining === 0
  const { questions } = attempt
  const answered = questions.filter((question) => answers[question.id]).length
  const unanswered = questions.length - answered
  const send = () => submit.mutate(answers)

  // Hết giờ: tự nộp đúng một lần (lỗi thì học viên bấm "Nộp lại", server còn nhận thêm 1 phút).
  const autoSubmitted = useRef(false)
  useEffect(() => {
    if (!timeUp || autoSubmitted.current) return
    autoSubmitted.current = true
    submit.mutate(answers)
  }, [timeUp, submit, answers])

  const jumpTo = (index: number) => {
    const target = document.getElementById(questionAnchor(index))
    target?.scrollIntoView?.({ behavior: 'smooth', block: 'start' })
    target?.querySelector('input')?.focus({ preventScroll: true })
  }

  const errorMessage = submit.error ? submitExamErrorMessage(submit.error) : undefined

  return (
    <div className={styles.paper}>
      <div className={styles.toolbar}>
        <div
          className={cn(styles.timer, remaining <= WARNING_SECONDS && styles.timerWarning)}
          role="timer"
          aria-label="Thời gian còn lại"
        >
          <Clock size={20} aria-hidden />
          <span>{formatClock(remaining)}</span>
        </div>
        <p className="sr-only" aria-live="polite">
          {timeAnnouncement(remaining)}
        </p>
        <p className={styles.answered}>
          Đã trả lời{' '}
          <strong>
            {answered}/{questions.length}
          </strong>
        </p>
        <Button
          variant="accent"
          loading={submit.isPending}
          onClick={timeUp ? send : () => setConfirming(true)}
        >
          <Send size={18} aria-hidden /> {timeUp && submit.isError ? 'Nộp lại' : 'Nộp bài'}
        </Button>
      </div>

      {timeUp && submit.isPending && (
        <Alert variant="info">Hết giờ làm bài. Hệ thống đang nộp bài của bạn…</Alert>
      )}
      {errorMessage && !confirming && <Alert variant="error">{errorMessage}</Alert>}

      <div className={styles.paperLayout}>
        <ol className={styles.questions}>
          {questions.map((question, index) => (
            <li key={question.id} id={questionAnchor(index)} className={styles.question}>
              <RadioGroupField
                label={`Câu ${index + 1}. ${question.content}`}
                name={`question-${question.id}`}
                options={EXAM_OPTIONS.map((option) => ({
                  value: option,
                  label: `${option}. ${question[EXAM_OPTION_FIELDS[option]]}`,
                }))}
                value={answers[question.id] ?? ''}
                onChange={(event) => choose(question.id, event.target.value as ExamOption)}
                disabled={timeUp || submit.isPending}
                fieldClassName={styles.questionField}
              />
            </li>
          ))}
        </ol>

        <nav className={styles.navigator} aria-label="Chuyển nhanh tới câu hỏi">
          <p className={styles.navigatorTitle}>Danh sách câu hỏi</p>
          <ol className={styles.navList}>
            {questions.map((question, index) => {
              const done = Boolean(answers[question.id])
              return (
                <li key={question.id}>
                  <button
                    type="button"
                    className={cn(styles.navItem, done && styles.navDone)}
                    aria-label={`Câu ${index + 1}, ${done ? 'đã trả lời' : 'chưa trả lời'}`}
                    onClick={() => jumpTo(index)}
                  >
                    {index + 1}
                  </button>
                </li>
              )
            })}
          </ol>
        </nav>
      </div>

      <ConfirmDialog
        open={confirming && !timeUp}
        tone="primary"
        icon={Send}
        title="Nộp bài?"
        description={
          unanswered > 0
            ? `Bạn còn ${unanswered} câu chưa trả lời. Sau khi nộp bạn không thể làm lại.`
            : 'Bạn đã trả lời tất cả các câu. Sau khi nộp bạn không thể làm lại.'
        }
        confirmLabel="Nộp bài"
        cancelLabel="Làm tiếp"
        loading={submit.isPending}
        error={errorMessage}
        onConfirm={send}
        onCancel={() => {
          setConfirming(false)
          submit.reset()
        }}
      />
    </div>
  )
}

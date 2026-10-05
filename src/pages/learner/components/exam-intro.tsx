import { Play, Timer } from 'lucide-react'
import { useState } from 'react'

import { Alert } from '@/components/common/alert'
import { Button } from '@/components/common/button'
import { ConfirmDialog } from '@/components/common/confirm-dialog'
import { CONTACT } from '@/constants/contact'
import { EXAM_WATCH_RATIO } from '@/constants/course'
import { EXAM_MAX_SCORE } from '@/constants/exam'
import { startExamErrorMessage, useStartExam } from '@/pages/learner/use-my-exam'
import {
  lessonVideos,
  summarizeProgress,
  useWatchProgress,
} from '@/pages/learner/use-watch-progress'
import { useAuthStore } from '@/stores/auth-store'
import type { CourseDetail } from '@/types/course'
import type { MyExam } from '@/types/exam'
import { formatScore, minCorrectToPass } from '@/utils/exam-score'

import styles from './exam.module.css'

const percentFormatter = new Intl.NumberFormat('vi-VN', { style: 'percent' })

interface ExamIntroProps {
  course: CourseDetail
  exam: MyExam
}

/** Quy chế thi và nút bắt đầu — chưa xem đủ video thì khoá (khoá đã hoàn thành thì không chặn). */
export function ExamIntro({ course, exam }: ExamIntroProps) {
  const userId = useAuthStore((state) => state.user?.id ?? 0)
  const { progress, sync } = useWatchProgress(userId, course.id)
  const watchedEnough =
    course.myEnrollmentStatus === 'COMPLETED' ||
    summarizeProgress(course.lessons.flatMap(lessonVideos), progress).examReady
  const start = useStartExam(course.id)
  const [confirming, setConfirming] = useState(false)
  const count = exam.questionCount
  const canStart = watchedEnough && count > 0

  const closeConfirm = () => {
    setConfirming(false)
    start.reset()
  }

  return (
    <section className={styles.card} aria-labelledby="exam-rules-title">
      <h2 id="exam-rules-title" className={styles.cardTitle}>
        Quy chế thi
      </h2>

      <dl className={styles.facts}>
        <div>
          <dt>Số câu hỏi</dt>
          <dd>{count} câu</dd>
        </div>
        <div>
          <dt>Thời gian</dt>
          <dd>{exam.durationMinutes} phút</dd>
        </div>
        <div>
          <dt>Điểm đạt</dt>
          <dd>
            {formatScore(exam.passScore)}/{EXAM_MAX_SCORE}
          </dd>
        </div>
      </dl>

      <ul className={styles.rules}>
        <li>Mỗi câu có 4 đáp án A, B, C, D và chỉ có 1 đáp án đúng.</li>
        {count > 0 && (
          <li>
            Điểm = số câu đúng / tổng số câu × {EXAM_MAX_SCORE}. Bạn cần đúng ít nhất{' '}
            <strong>
              {minCorrectToPass(exam.passScore, count)}/{count} câu
            </strong>{' '}
            để đạt.
          </li>
        )}
        <li>
          Đồng hồ đếm ngược từ lúc bấm <strong>Bắt đầu làm bài</strong> và không dừng lại, kể cả khi
          bạn rời trang. Tải lại trang không làm mất các đáp án đã chọn trên máy này.
        </li>
        <li>Hết giờ, hệ thống tự động nộp bài.</li>
        <li>
          <strong>Mỗi học viên chỉ được thi 1 lần.</strong>
        </li>
      </ul>

      {!watchedEnough && (
        <Alert variant="warning">
          Bạn cần xem tối thiểu {percentFormatter.format(EXAM_WATCH_RATIO)} tổng thời lượng video
          của khoá học để mở bài thi.
        </Alert>
      )}
      {count === 0 && (
        <Alert variant="warning">
          Bài thi chưa có câu hỏi. Vui lòng gọi {CONTACT.HOTLINE} để được hỗ trợ.
        </Alert>
      )}

      <div className={styles.actions}>
        <Button variant="accent" disabled={!canStart} onClick={() => setConfirming(true)}>
          <Play size={18} aria-hidden /> Bắt đầu làm bài
        </Button>
      </div>

      <ConfirmDialog
        open={confirming}
        tone="primary"
        icon={Timer}
        title="Bắt đầu làm bài?"
        description={`Đồng hồ ${exam.durationMinutes} phút sẽ chạy ngay và không dừng lại. Bạn chỉ được thi 1 lần.`}
        confirmLabel="Bắt đầu"
        cancelLabel="Để sau"
        loading={start.isPending}
        error={start.error ? startExamErrorMessage(start.error) : undefined}
        // Gửi nốt tiến độ xem video: server kiểm tra lại điều kiện 80% lúc bắt đầu.
        onConfirm={() => void sync().then(() => start.mutate())}
        onCancel={closeConfirm}
      />
    </section>
  )
}

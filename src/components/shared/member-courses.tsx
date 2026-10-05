import { Award, BookOpen, ClipboardCheck, PlayCircle } from 'lucide-react'
import { Link } from 'react-router'

import { ENROLLMENT_STATUS_LABELS, EXAM_WATCH_RATIO } from '@/constants/course'
import { EXAM_MAX_SCORE } from '@/constants/exam'
import type { CourseProgress, MemberCourse, MemberExamResult } from '@/types/business'
import { cn } from '@/utils/cn'
import { formatDate } from '@/utils/format-date'
import { formatScore } from '@/utils/exam-score'

import styles from './member-courses.module.css'

const percentFormatter = new Intl.NumberFormat('vi-VN', { style: 'percent' })

function ProgressLine({ progress }: { progress: CourseProgress }) {
  if (progress.percent === null) {
    return <p className={styles.muted}>Khoá học không có video để theo dõi.</p>
  }
  const minutes = (seconds: number) => Math.round(seconds / 60)
  return (
    <>
      <div className={styles.bar}>
        <progress
          className={styles.meter}
          max={100}
          value={progress.percent}
          aria-label="Tiến độ xem video"
        >
          {progress.percent}%
        </progress>
        <i style={{ left: `${EXAM_WATCH_RATIO * 100}%` }} aria-hidden />
      </div>
      <p className={styles.muted}>
        Đã xem <strong>{progress.percent}%</strong> ({minutes(progress.watchedSeconds)} /{' '}
        {minutes(progress.totalSeconds)} phút)
        {progress.unopenedCount > 0 &&
          ` · ${progress.unopenedCount}/${progress.videoCount} video chưa mở`}
        {progress.examReady
          ? ' · Đủ điều kiện thi'
          : ` · Cần ${percentFormatter.format(EXAM_WATCH_RATIO)} để thi`}
      </p>
    </>
  )
}

function ExamLine({ exam }: { exam: MemberExamResult | null }) {
  if (!exam) return <span className={styles.muted}>Chưa thi</span>
  if (!exam.submitted) return <span className={styles.muted}>Đang làm bài</span>
  return (
    <span>
      <strong>
        {formatScore(exam.score ?? 0)}/{EXAM_MAX_SCORE}
      </strong>{' '}
      ({exam.correctCount}/{exam.questionCount} câu đúng) ·{' '}
      <span className={cn(styles.verdict, exam.passed ? styles.pass : styles.fail)}>
        {exam.passed ? 'Đạt' : 'Không đạt'}
      </span>
    </span>
  )
}

/** Các khoá của một học viên: trạng thái đăng ký, tiến độ video, điểm thi, chứng chỉ. */
interface MemberCoursesProps {
  courses: MemberCourse[]
  /** Link tới trang chứng chỉ theo mã; bỏ trống thì chỉ hiện mã. */
  certificateHref?: (code: string) => string
}

export function MemberCourses({ courses, certificateHref }: MemberCoursesProps) {
  return (
    <ul className={styles.list}>
      {courses.map((course) => (
        <li key={course.enrollmentId} className={styles.course}>
          <div className={styles.head}>
            <h3 className={styles.title}>
              <BookOpen size={18} aria-hidden /> {course.courseName}
            </h3>
            <span className={cn(styles.status, styles[course.status])}>
              {ENROLLMENT_STATUS_LABELS[course.status]}
            </span>
          </div>
          <p className={styles.muted}>
            Đăng ký {formatDate(course.enrolledAt)}
            {course.approvedAt && ` · Duyệt ${formatDate(course.approvedAt)}`}
            {course.completedAt && ` · Hoàn thành ${formatDate(course.completedAt)}`}
          </p>

          {course.progress && (
            <div className={styles.row}>
              <PlayCircle size={18} aria-hidden />
              <div className={styles.rowBody}>
                <ProgressLine progress={course.progress} />
              </div>
            </div>
          )}
          {course.status !== 'PENDING' && course.status !== 'CANCELLED' && (
            <div className={styles.row}>
              <ClipboardCheck size={18} aria-hidden />
              <p className={styles.rowBody}>
                Bài thi: <ExamLine exam={course.exam} />
              </p>
            </div>
          )}
          {course.certificate && (
            <div className={styles.row}>
              <Award size={18} aria-hidden />
              <p className={styles.rowBody}>
                Chứng chỉ{' '}
                {certificateHref ? (
                  <Link to={certificateHref(course.certificate.code)}>
                    <strong>{course.certificate.code}</strong>
                  </Link>
                ) : (
                  <strong>{course.certificate.code}</strong>
                )}{' '}
                · cấp ngày {formatDate(course.certificate.issuedAt)}
              </p>
            </div>
          )}
        </li>
      ))}
    </ul>
  )
}

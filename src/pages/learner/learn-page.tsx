import {
  ArrowLeft,
  ArrowRight,
  CircleAlert,
  CircleCheck,
  Download,
  ExternalLink,
  FileText,
  GraduationCap,
  Hourglass,
  Lock,
} from 'lucide-react'
import { useSearchParams } from 'react-router'

import { Button } from '@/components/common/button'
import { ButtonLink } from '@/components/common/button-link'
import { EmptyState } from '@/components/common/empty-state'
import { API_ERROR_CODES } from '@/constants/api-error-codes'
import { EXAM_WATCH_RATIO } from '@/constants/course'
import { coursePath, LEARNER_ROUTES } from '@/constants/routes'
import { useCourseDetail, usePositiveIdParam } from '@/hooks/use-course-detail'
import { useDocumentTitle } from '@/hooks/use-document-title'
import { AccountPageHeader } from '@/layouts/user/account-page-header'
import { ExamAction } from '@/pages/learner/components/exam-action'
import { LessonVideo } from '@/pages/learner/components/lesson-video'
import {
  lessonVideos,
  summarizeProgress,
  useWatchProgress,
  type ProgressSummary,
} from '@/pages/learner/use-watch-progress'
import { useAuthStore } from '@/stores/auth-store'
import type { CourseDetail, Lesson } from '@/types/course'
import { apiErrorMessage } from '@/utils/api-error-message'
import { apiFileUrl } from '@/utils/api-file-url'
import { cn } from '@/utils/cn'
import { formatFileSize } from '@/utils/format-file-size'
import { videoHost } from '@/utils/video-host'
import { youtubeVideoId } from '@/utils/youtube-video-id'

import styles from './learn-page.module.css'

/** Bài đang xem trên URL: `?bai=<lessonId>`. */
const LESSON_PARAM = 'bai'

function formatMinutes(seconds: number): string {
  return `${Math.round(seconds / 60)} phút`
}

export default function LearnPage() {
  const courseId = usePositiveIdParam('courseId')
  const course = useCourseDetail(courseId)
  useDocumentTitle(course.data ? `Học: ${course.data.name}` : 'Vào học')

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

  if (course.isPending) {
    return (
      <p className={styles.loading} aria-busy>
        Đang tải khoá học…
      </p>
    )
  }

  if (course.isError) {
    return (
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
    )
  }

  const status = course.data.myEnrollmentStatus
  if (status === 'PENDING') {
    return (
      <EmptyState
        icon={Hourglass}
        title="Khoá học đang chờ duyệt"
        description="Quản trị viên sẽ đối chiếu khoản chuyển và mở khoá học cho bạn. Cần hỗ trợ, vui lòng gọi hotline."
        action={
          <ButtonLink to={LEARNER_ROUTES.MY_COURSES} variant="outline">
            Về khoá học của tôi
          </ButtonLink>
        }
      />
    )
  }
  if (status !== 'ENROLLED' && status !== 'COMPLETED') {
    return (
      <EmptyState
        icon={Lock}
        title="Bạn chưa tham gia khoá học này"
        description="Đăng ký và thanh toán học phí, khoá học sẽ mở sau khi được duyệt."
        action={
          <ButtonLink to={coursePath(course.data.id)} variant="accent">
            Xem khoá học và đăng ký
          </ButtonLink>
        }
      />
    )
  }

  // `key`: đổi khoá thì nạp lại tiến độ của khoá đó.
  return <Classroom key={course.data.id} course={course.data} />
}

function Classroom({ course }: { course: CourseDetail }) {
  const userId = useAuthStore((state) => state.user?.id ?? 0)
  const { progress, reportDuration, reportWatched } = useWatchProgress(userId, course.id)
  const [searchParams, setSearchParams] = useSearchParams()
  const { lessons } = course

  const videos = lessons.flatMap(lessonVideos)
  const summary = summarizeProgress(videos, progress)

  const selectedId = Number(searchParams.get(LESSON_PARAM))
  const index = Math.max(
    0,
    lessons.findIndex((lesson) => lesson.id === selectedId),
  )
  const lesson = lessons[index]

  const openLesson = (target: Lesson) => {
    setSearchParams({ [LESSON_PARAM]: String(target.id) })
    window.scrollTo?.({ top: 0, behavior: 'smooth' })
  }

  return (
    <>
      <AccountPageHeader
        title={course.name}
        description={`Giảng viên ${course.instructorName} · ${lessons.length} bài học`}
        action={
          <ButtonLink to={LEARNER_ROUTES.MY_COURSES} variant="outline">
            <ArrowLeft size={18} aria-hidden /> Khoá học của tôi
          </ButtonLink>
        }
      />

      <ProgressPanel
        courseId={course.id}
        summary={summary}
        videoCount={videos.length}
        completed={course.myEnrollmentStatus === 'COMPLETED'}
      />

      {lesson ? (
        <div className={styles.layout}>
          <nav className={styles.lessonNav} aria-label="Danh sách bài học">
            <ol className={styles.lessonList}>
              {lessons.map((item, itemIndex) => {
                const lessonSummary = summarizeProgress(lessonVideos(item), progress)
                const watchedAll = lessonVideos(item).length > 0 && lessonSummary.examReady
                return (
                  <li key={item.id}>
                    <button
                      type="button"
                      className={cn(styles.lessonButton, item.id === lesson.id && styles.current)}
                      aria-current={item.id === lesson.id ? 'step' : undefined}
                      onClick={() => openLesson(item)}
                    >
                      <span className={styles.lessonNumber}>Bài {itemIndex + 1}</span>
                      <span className={styles.lessonTitle}>{item.title}</span>
                      {watchedAll && (
                        <CircleCheck
                          className={styles.lessonDone}
                          size={18}
                          aria-label="Đã xem video"
                        />
                      )}
                    </button>
                  </li>
                )
              })}
            </ol>
          </nav>

          <article className={styles.lesson} aria-labelledby="lesson-title">
            <p className={styles.eyebrow}>
              Bài {index + 1}/{lessons.length}
            </p>
            <h2 id="lesson-title" className={styles.lessonHeading}>
              {lesson.title}
            </h2>

            <LessonVideos lesson={lesson} onDuration={reportDuration} onWatched={reportWatched} />

            {lesson.instructions && <p className={styles.instructions}>{lesson.instructions}</p>}

            <LessonDocuments lesson={lesson} />

            <div className={styles.pager}>
              {lessons[index - 1] && (
                <Button variant="ghost" onClick={() => openLesson(lessons[index - 1] as Lesson)}>
                  <ArrowLeft size={18} aria-hidden /> Bài trước
                </Button>
              )}
              {lessons[index + 1] && (
                <Button
                  variant="outline"
                  className={styles.next}
                  onClick={() => openLesson(lessons[index + 1] as Lesson)}
                >
                  Bài tiếp theo <ArrowRight size={18} aria-hidden />
                </Button>
              )}
            </div>
          </article>
        </div>
      ) : (
        <EmptyState
          icon={GraduationCap}
          title="Khoá học chưa có bài học"
          description="Bài học sẽ hiện ở đây khi giảng viên đăng tải."
        />
      )}
    </>
  )
}

function ProgressPanel({
  courseId,
  summary,
  videoCount,
  completed,
}: {
  courseId: number
  summary: ProgressSummary
  videoCount: number
  completed: boolean
}) {
  const percent = Math.min(100, Math.floor(summary.ratio * 100))

  return (
    <section className={styles.progress} aria-labelledby="progress-title">
      <div className={styles.progressInfo}>
        <h2 id="progress-title" className={styles.progressTitle}>
          Tiến độ xem video
        </h2>
        {videoCount > 0 ? (
          <>
            <div className={styles.bar}>
              <progress
                className={styles.meter}
                aria-labelledby="progress-title"
                max={100}
                value={percent}
              >
                {percent}%
              </progress>
              <i style={{ left: `${EXAM_WATCH_RATIO * 100}%` }} aria-hidden />
            </div>
            <p className={styles.progressText}>
              Đã xem <strong>{percent}%</strong>
              {summary.total > 0 &&
                ` (${formatMinutes(summary.watched)} / ${formatMinutes(summary.total)})`}
              {summary.unknown > 0 &&
                ` · còn ${summary.unknown}/${videoCount} video chưa mở, mở để tính đủ thời lượng`}
            </p>
          </>
        ) : (
          <p className={styles.progressText}>Khoá học không có video để theo dõi.</p>
        )}
      </div>

      <ExamAction courseId={courseId} watchedEnough={summary.examReady} completed={completed} />
    </section>
  )
}

function LessonVideos({
  lesson,
  onDuration,
  onWatched,
}: {
  lesson: Lesson
  onDuration: (videoKey: string, seconds: number) => void
  onWatched: (videoKey: string, from: number, to: number) => void
}) {
  const videos = lessonVideos(lesson)
  // Link video không phải YouTube (Drive...): không nhúng được nên không tính tiến độ.
  const externalUrl =
    lesson.videoUrl && !youtubeVideoId(lesson.videoUrl) ? lesson.videoUrl : undefined

  if (videos.length === 0 && !externalUrl) return null

  return (
    <div className={styles.videos}>
      {videos.map((video, videoIndex) => (
        <LessonVideo
          key={video.key}
          video={video}
          title={videos.length > 1 ? `${lesson.title} – video ${videoIndex + 1}` : lesson.title}
          onDuration={onDuration}
          onWatched={onWatched}
        />
      ))}
      {externalUrl && (
        <a className={styles.externalVideo} href={externalUrl} target="_blank" rel="noreferrer">
          <ExternalLink size={16} aria-hidden /> Xem video trên{' '}
          {videoHost(externalUrl) || 'trang ngoài'}
          <span className="sr-only"> (tab mới)</span>
        </a>
      )}
    </div>
  )
}

function LessonDocuments({ lesson }: { lesson: Lesson }) {
  const documents = lesson.files.filter((file) => file.fileType === 'DOCUMENT')
  if (documents.length === 0) return null

  return (
    <section className={styles.documents} aria-labelledby={`documents-${lesson.id}`}>
      <h3 id={`documents-${lesson.id}`} className={styles.documentsTitle}>
        Tài liệu
      </h3>
      <ul className={styles.documentList}>
        {documents.map((file) => (
          <li key={file.fileId}>
            <a className={styles.document} href={apiFileUrl(file.url)} download={file.originalName}>
              <FileText size={20} aria-hidden />
              <span className={styles.documentName}>{file.originalName}</span>
              <span className={styles.documentSize}>{formatFileSize(file.sizeBytes)}</span>
              <Download size={18} aria-hidden />
              <span className="sr-only"> (tải về)</span>
            </a>
          </li>
        ))}
      </ul>
    </section>
  )
}

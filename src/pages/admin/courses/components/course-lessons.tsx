import { ExternalLink, FilePlus2, FileText, Film, Link2, Pencil, Trash2 } from 'lucide-react'
import { Link } from 'react-router'

import { ButtonLink } from '@/components/common/button-link'
import { EmptyState } from '@/components/common/empty-state'
import { IconButton } from '@/components/common/icon-button'
import { adminCoursePath, adminLessonEditPath } from '@/constants/routes'
import type { CourseDetail, Lesson, LessonFile } from '@/types/course'
import { apiFileUrl } from '@/utils/api-file-url'
import { cn } from '@/utils/cn'
import { formatFileSize } from '@/utils/format-file-size'
import { videoHost } from '@/utils/video-host'

import styles from './course-detail.module.css'

interface CourseLessonsProps {
  course: CourseDetail
  onDelete: (lesson: Lesson) => void
}

function FileLink({ file }: { file: LessonFile }) {
  const Icon = file.fileType === 'VIDEO' ? Film : FileText
  return (
    <a
      href={apiFileUrl(file.url)}
      target="_blank"
      rel="noreferrer"
      className={styles.file}
      aria-label={`Mở ${file.fileType === 'VIDEO' ? 'video' : 'tài liệu'} ${file.originalName} (tab mới)`}
    >
      <Icon size={18} aria-hidden />
      <span className={styles.fileName}>{file.originalName}</span>
      <span className={styles.fileSize}>{formatFileSize(file.sizeBytes)}</span>
      <ExternalLink size={14} aria-hidden />
    </a>
  )
}

function VideoLink({ url }: { url: string }) {
  const host = videoHost(url)
  return (
    <a
      href={url}
      target="_blank"
      rel="noreferrer"
      className={styles.file}
      aria-label={`Mở link video${host ? ` trên ${host}` : ''} (tab mới)`}
    >
      <Link2 size={18} aria-hidden />
      <span className={styles.fileName}>Link video</span>
      {host && <span className={styles.fileSize}>{host}</span>}
      <ExternalLink size={14} aria-hidden />
    </a>
  )
}

/** Danh sách bài học (đã xếp theo `sortOrder`), mỗi bài có file, xem video, sửa, xoá. */
export function CourseLessons({ course, onDelete }: CourseLessonsProps) {
  const addLesson = (
    <ButtonLink to={adminCoursePath('LESSON_CREATE', course.id)} variant="accent" size="sm">
      <FilePlus2 size={16} aria-hidden /> Thêm bài học
    </ButtonLink>
  )

  return (
    <section className={styles.card} aria-labelledby="lessons-title">
      <div className={styles.cardHeader}>
        <h2 id="lessons-title" className={styles.cardTitle}>
          Bài học <span className={styles.count}>{course.lessons.length}</span>
        </h2>
        {course.lessons.length > 0 && addLesson}
      </div>

      {course.lessons.length === 0 ? (
        <EmptyState
          icon={FilePlus2}
          title="Khoá học chưa có bài học"
          description="Mỗi bài học gồm hướng dẫn, một file tài liệu và video bài giảng (file tải lên hoặc link)."
          action={addLesson}
        />
      ) : (
        <ol className={styles.lessons}>
          {course.lessons.map((lesson) => {
            const video = lesson.files.find((file) => file.fileType === 'VIDEO')
            return (
              <li key={lesson.id} className={styles.lesson}>
                <span className={styles.order} aria-hidden>
                  {lesson.sortOrder}
                </span>
                <div className={styles.lessonBody}>
                  <div className={styles.lessonHead}>
                    <h3 className={styles.lessonTitle}>
                      <span className="sr-only">Bài {lesson.sortOrder}: </span>
                      {lesson.title}
                    </h3>
                    <div className={styles.lessonActions}>
                      <Link
                        to={adminLessonEditPath(course.id, lesson.id)}
                        className={styles.iconAction}
                        aria-label={`Sửa bài ${lesson.title}`}
                        title="Sửa bài học"
                      >
                        <Pencil size={18} aria-hidden />
                      </Link>
                      <IconButton
                        className={cn(styles.iconAction, styles.danger)}
                        label={`Xoá bài ${lesson.title}`}
                        title="Xoá bài học"
                        onClick={() => onDelete(lesson)}
                      >
                        <Trash2 size={18} aria-hidden />
                      </IconButton>
                    </div>
                  </div>
                  <p className={styles.instructions}>{lesson.instructions}</p>
                  <div className={styles.files}>
                    {lesson.files.map((file) => (
                      <FileLink key={file.fileId} file={file} />
                    ))}
                    {lesson.videoUrl && <VideoLink url={lesson.videoUrl} />}
                  </div>
                  {video && (
                    <details className={styles.player}>
                      <summary>Xem video ngay tại đây</summary>
                      {/* Không tải trước: danh sách có thể nhiều video lớn. */}
                      <video controls preload="none" src={apiFileUrl(video.url)}>
                        <track kind="captions" />
                      </video>
                    </details>
                  )}
                </div>
              </li>
            )
          })}
        </ol>
      )}
    </section>
  )
}

import { CircleCheck, ExternalLink, FileText, Film, Link2, Plus } from 'lucide-react'
import { useEffect, useRef } from 'react'

import { Button } from '@/components/common/button'
import { ButtonLink } from '@/components/common/button-link'
import { adminCoursePath } from '@/constants/routes'
import type { Lesson, LessonFileType } from '@/types/course'
import { apiFileUrl } from '@/utils/api-file-url'
import { formatFileSize } from '@/utils/format-file-size'

import styles from './lesson-form.module.css'

const FILE_TYPE_LABELS: Record<LessonFileType, string> = {
  DOCUMENT: 'Tài liệu',
  VIDEO: 'Video',
}

interface LessonCreatedProps {
  lesson: Lesson
  onCreateAnother: () => void
}

/** Kết quả sau khi tạo bài học: file đã lưu (mở được ngay) + bước tiếp theo. */
export function LessonCreated({ lesson, onCreateAnother }: LessonCreatedProps) {
  const titleRef = useRef<HTMLHeadingElement>(null)

  // Form vừa biến mất → đưa focus tới kết quả để trình đọc màn hình đọc ngay.
  useEffect(() => titleRef.current?.focus(), [])

  return (
    <div className={styles.created}>
      <CircleCheck className={styles.createdIcon} size={40} aria-hidden />
      <h2 ref={titleRef} tabIndex={-1} className={styles.createdTitle}>
        Đã tạo bài học
      </h2>
      <p className={styles.createdLesson}>
        Bài {lesson.sortOrder}: <strong>{lesson.title}</strong>
      </p>

      <ul className={styles.createdFiles} aria-label="File đã tải lên">
        {lesson.files.map((file) => {
          const Icon = file.fileType === 'VIDEO' ? Film : FileText
          return (
            <li key={file.fileId}>
              <Icon size={20} aria-hidden />
              <span className={styles.createdFileText}>
                <small>{FILE_TYPE_LABELS[file.fileType]}</small>
                <strong>{file.originalName}</strong>
                <small>{formatFileSize(file.sizeBytes)}</small>
              </span>
              <a
                href={apiFileUrl(file.url)}
                target="_blank"
                rel="noreferrer"
                aria-label={`Mở ${file.originalName} (tab mới)`}
              >
                Mở <ExternalLink size={14} aria-hidden />
              </a>
            </li>
          )
        })}
        {lesson.videoUrl && (
          <li>
            <Link2 size={20} aria-hidden />
            <span className={styles.createdFileText}>
              <small>Link video</small>
              <strong>{lesson.videoUrl}</strong>
            </span>
            <a
              href={lesson.videoUrl}
              target="_blank"
              rel="noreferrer"
              aria-label="Mở link video (tab mới)"
            >
              Mở <ExternalLink size={14} aria-hidden />
            </a>
          </li>
        )}
      </ul>

      <div className={styles.createdActions}>
        <ButtonLink to={adminCoursePath('COURSE_DETAIL', lesson.courseId)} variant="outline">
          Về trang khoá học
        </ButtonLink>
        <Button variant="accent" onClick={onCreateAnother}>
          <Plus size={18} aria-hidden /> Thêm bài học tiếp theo
        </Button>
      </div>
    </div>
  )
}

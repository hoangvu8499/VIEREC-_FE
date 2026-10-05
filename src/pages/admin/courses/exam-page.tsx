import { ClipboardList, FilePlus2, FileSpreadsheet, Pencil, Plus, RotateCw } from 'lucide-react'
import { useState } from 'react'

import { Alert } from '@/components/common/alert'
import { Button } from '@/components/common/button'
import { ConfirmDialog } from '@/components/common/confirm-dialog'
import { Dialog } from '@/components/common/dialog'
import { EmptyState } from '@/components/common/empty-state'
import { API_ERROR_CODES } from '@/constants/api-error-codes'
import { EXAM_MAX_SCORE } from '@/constants/exam'
import { adminCoursePath } from '@/constants/routes'
import { useDocumentTitle } from '@/hooks/use-document-title'
import { AdminPageHeader } from '@/layouts/admin/admin-page-header'
import { AdminPanel } from '@/layouts/admin/admin-panel'
import { CourseQueryState } from '@/pages/admin/courses/components/course-query-state'
import { ExamImportDialog } from '@/pages/admin/courses/components/exam-import-dialog'
import { ExamQuestionForm } from '@/pages/admin/courses/components/exam-question-form'
import { ExamQuestionList } from '@/pages/admin/courses/components/exam-question-list'
import { ExamSettingsForm } from '@/pages/admin/courses/components/exam-settings-form'
import { useCourseDetail, usePositiveIdParam } from '@/pages/admin/courses/use-course-detail'
import {
  deleteQuestionErrorMessage,
  useDeleteQuestion,
  useExam,
} from '@/pages/admin/courses/use-exam'
import type { CourseDetail } from '@/types/course'
import type { Exam, ExamQuestion } from '@/types/exam'
import { apiErrorMessage } from '@/utils/api-error-message'
import { cn } from '@/utils/cn'
import { formatScore, minCorrectToPass } from '@/utils/exam-score'

import detailStyles from './components/course-detail.module.css'
import styles from './components/exam.module.css'

function ExamSummary({ exam, onEdit }: { exam: Exam; onEdit: () => void }) {
  const count = exam.questionCount
  return (
    <aside className={cn(detailStyles.card, styles.summary)} aria-labelledby="exam-settings-title">
      <div className={detailStyles.cardHeader}>
        <h2 id="exam-settings-title" className={detailStyles.cardTitle}>
          Cài đặt
        </h2>
        <Button variant="outline" size="sm" onClick={onEdit}>
          <Pencil size={16} aria-hidden /> Sửa
        </Button>
      </div>
      <dl className={detailStyles.info}>
        <div>
          <dt>Tên bài thi</dt>
          <dd>{exam.title}</dd>
        </div>
        <div>
          <dt>Thời gian làm bài</dt>
          <dd>{exam.durationMinutes} phút</dd>
        </div>
        <div>
          <dt>Điểm đạt</dt>
          <dd>
            {formatScore(exam.passScore)} / {EXAM_MAX_SCORE}
          </dd>
        </div>
        <div>
          <dt>Cách tính điểm</dt>
          <dd>
            {count > 0 ? (
              <>
                <span>Mỗi câu đúng {formatScore(EXAM_MAX_SCORE / count)} điểm</span>
                <span className={detailStyles.muted}>
                  Cần đúng ít nhất {minCorrectToPass(exam.passScore, count)}/{count} câu để đạt
                </span>
              </>
            ) : (
              <span className={detailStyles.muted}>
                Số câu đúng / tổng số câu × {EXAM_MAX_SCORE}
              </span>
            )}
          </dd>
        </div>
      </dl>
    </aside>
  )
}

interface ExamContentProps {
  course: CourseDetail
  onFlash: (message: string) => void
}

function ExamContent({ course, onFlash }: ExamContentProps) {
  const exam = useExam(course.id)
  const deleteQuestion = useDeleteQuestion(course.id)
  const [editingSettings, setEditingSettings] = useState(false)
  /** `null`: thêm câu mới; câu hỏi: đang sửa câu đó; `undefined`: đóng. */
  const [editing, setEditing] = useState<ExamQuestion | null>()
  const [importOpen, setImportOpen] = useState(false)
  const [toDelete, setToDelete] = useState<{ question: ExamQuestion; number: number }>()
  const [dialogBusy, setDialogBusy] = useState(false)

  if (exam.isPending) {
    return (
      <AdminPanel>
        <p className={detailStyles.loading} aria-busy>
          Đang tải bài thi…
        </p>
      </AdminPanel>
    )
  }

  if (exam.isError) {
    if (exam.error.code === API_ERROR_CODES.EXAM_NOT_FOUND) {
      return (
        <AdminPanel padded aria-labelledby="exam-create-title">
          <h2 id="exam-create-title" className={styles.createTitle}>
            Khoá học chưa có bài thi chứng chỉ
          </h2>
          <p className={styles.createText}>
            Mỗi khoá học có một bài thi trắc nghiệm, mỗi câu 4 đáp án A–D và chỉ 1 đáp án đúng. Điểm
            tính theo thang {EXAM_MAX_SCORE}. Tạo bài thi rồi thêm câu hỏi bằng tay hoặc import từ
            file Excel.
          </p>
          <ExamSettingsForm
            courseId={course.id}
            courseName={course.name}
            onSaved={() =>
              onFlash('Đã tạo bài thi. Hãy thêm câu hỏi bằng tay hoặc import từ Excel.')
            }
          />
        </AdminPanel>
      )
    }
    return (
      <AdminPanel>
        <EmptyState
          icon={RotateCw}
          tone="danger"
          title="Không tải được bài thi"
          description={apiErrorMessage(exam.error, {
            fallback: 'Đã có lỗi xảy ra. Vui lòng thử lại.',
          })}
          action={
            <Button variant="outline" onClick={() => void exam.refetch()}>
              Thử lại
            </Button>
          }
        />
      </AdminPanel>
    )
  }

  const data = exam.data
  const questionActions = (
    <div className={styles.questionActions}>
      <Button variant="outline" size="sm" onClick={() => setImportOpen(true)}>
        <FileSpreadsheet size={16} aria-hidden /> Import Excel
      </Button>
      <Button variant="accent" size="sm" onClick={() => setEditing(null)}>
        <Plus size={16} aria-hidden /> Thêm câu hỏi
      </Button>
    </div>
  )
  const closeSettings = () => {
    setEditingSettings(false)
    setDialogBusy(false)
  }
  const closeQuestionDialog = () => {
    setEditing(undefined)
    setDialogBusy(false)
  }
  const closeDeleteDialog = () => {
    setToDelete(undefined)
    deleteQuestion.reset()
  }

  return (
    <>
      <div className={detailStyles.layout}>
        <section className={detailStyles.card} aria-labelledby="exam-questions-title">
          <div className={detailStyles.cardHeader}>
            <h2 id="exam-questions-title" className={detailStyles.cardTitle}>
              Câu hỏi <span className={detailStyles.count}>{data.questionCount}</span>
            </h2>
            {data.questionCount > 0 && questionActions}
          </div>
          {data.questionCount === 0 ? (
            <EmptyState
              icon={FilePlus2}
              title="Bài thi chưa có câu hỏi"
              description="Thêm từng câu, hoặc điền nhiều câu vào file Excel mẫu rồi import một lần."
              action={questionActions}
            />
          ) : (
            <ExamQuestionList
              questions={data.questions}
              onEdit={setEditing}
              onDelete={(question, number) => setToDelete({ question, number })}
            />
          )}
        </section>

        <ExamSummary exam={data} onEdit={() => setEditingSettings(true)} />
      </div>

      <Dialog
        open={editingSettings}
        title="Cài đặt bài thi"
        busy={dialogBusy}
        onClose={closeSettings}
      >
        <ExamSettingsForm
          courseId={course.id}
          courseName={course.name}
          exam={data}
          onBusyChange={setDialogBusy}
          onCancel={closeSettings}
          onSaved={() => {
            closeSettings()
            onFlash('Đã lưu cài đặt bài thi.')
          }}
        />
      </Dialog>

      <Dialog
        open={editing !== undefined}
        title={
          editing
            ? `Sửa câu ${data.questions.findIndex((question) => question.id === editing.id) + 1}`
            : 'Thêm câu hỏi'
        }
        description={editing ? undefined : 'Câu mới được thêm vào cuối bài thi.'}
        busy={dialogBusy}
        onClose={closeQuestionDialog}
      >
        <ExamQuestionForm
          // Đổi câu đang sửa → form mới với giá trị của câu đó.
          key={editing?.id ?? 'new'}
          courseId={course.id}
          question={editing ?? undefined}
          onBusyChange={setDialogBusy}
          onCancel={closeQuestionDialog}
          onSaved={() => {
            onFlash(editing ? 'Đã lưu câu hỏi.' : 'Đã thêm câu hỏi vào cuối bài thi.')
            closeQuestionDialog()
          }}
        />
      </Dialog>

      <ExamImportDialog
        courseId={course.id}
        open={importOpen}
        questionCount={data.questionCount}
        onClose={() => setImportOpen(false)}
        onImported={(result, mode) =>
          onFlash(
            mode === 'REPLACE'
              ? `Đã thay toàn bộ câu hỏi bằng ${result.importedCount} câu trong file.`
              : `Đã import thêm ${result.importedCount} câu hỏi. Bài thi có ${result.exam.questionCount} câu.`,
          )
        }
      />

      <ConfirmDialog
        open={Boolean(toDelete)}
        title={`Xoá câu ${toDelete?.number ?? ''}?`}
        description={<p className={styles.deletePreview}>“{toDelete?.question.content}”</p>}
        confirmLabel="Xoá câu hỏi"
        loading={deleteQuestion.isPending}
        error={
          deleteQuestion.isError ? deleteQuestionErrorMessage(deleteQuestion.error) : undefined
        }
        onConfirm={() => {
          if (!toDelete) return
          const { number } = toDelete
          deleteQuestion.mutate(toDelete.question, {
            onSuccess: () => {
              onFlash(`Đã xoá câu ${number}.`)
              closeDeleteDialog()
            },
          })
        }}
        onCancel={closeDeleteDialog}
      />
    </>
  )
}

/** Bài thi lấy chứng chỉ của một khoá: cài đặt, câu hỏi (thêm / sửa / xoá, import Excel). */
export default function ExamPage() {
  const courseId = usePositiveIdParam('courseId')
  const course = useCourseDetail(courseId)
  useDocumentTitle(`Bài thi – ${course.data?.name ?? 'Khoá học'} – Quản trị`)
  const [flash, setFlash] = useState<string>()

  return (
    <>
      <AdminPageHeader
        back={
          courseId
            ? { to: adminCoursePath('COURSE_DETAIL', courseId), label: 'Chi tiết khoá học' }
            : undefined
        }
        title="Bài thi chứng chỉ"
        description={
          course.data && (
            <>
              <ClipboardList size={16} aria-hidden className={styles.headerIcon} />
              {course.data.name}
            </>
          )
        }
      />

      {flash && (
        <Alert variant="success" className={detailStyles.flash}>
          {flash}
        </Alert>
      )}

      <CourseQueryState query={courseId ? course : undefined}>
        {(data) => <ExamContent course={data} onFlash={setFlash} />}
      </CourseQueryState>
    </>
  )
}

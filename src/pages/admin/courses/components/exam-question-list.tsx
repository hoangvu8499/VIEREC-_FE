import { CircleCheck, Pencil, Trash2 } from 'lucide-react'

import { IconButton } from '@/components/common/icon-button'
import { EXAM_OPTION_FIELDS, EXAM_OPTIONS } from '@/constants/exam'
import type { ExamQuestion } from '@/types/exam'
import { cn } from '@/utils/cn'

import detailStyles from './course-detail.module.css'
import styles from './exam.module.css'

interface ExamQuestionListProps {
  questions: ExamQuestion[]
  onEdit: (question: ExamQuestion) => void
  onDelete: (question: ExamQuestion, number: number) => void
}

/** Câu hỏi theo thứ tự trong bài thi, đáp án đúng được tô xanh. */
export function ExamQuestionList({ questions, onEdit, onDelete }: ExamQuestionListProps) {
  return (
    <ol className={styles.questions}>
      {questions.map((question, index) => {
        const number = index + 1
        return (
          <li key={question.id} className={styles.question}>
            <div className={styles.questionHead}>
              <span className={styles.questionNumber}>Câu {number}</span>
              <div className={detailStyles.lessonActions}>
                <IconButton
                  className={detailStyles.iconAction}
                  label={`Sửa câu ${number}`}
                  onClick={() => onEdit(question)}
                >
                  <Pencil size={18} aria-hidden />
                </IconButton>
                <IconButton
                  className={cn(detailStyles.iconAction, detailStyles.danger)}
                  label={`Xoá câu ${number}`}
                  onClick={() => onDelete(question, number)}
                >
                  <Trash2 size={18} aria-hidden />
                </IconButton>
              </div>
            </div>
            <p className={styles.questionContent}>{question.content}</p>
            <ul className={styles.options} aria-label={`Đáp án câu ${number}`}>
              {EXAM_OPTIONS.map((option) => {
                const correct = option === question.correctOption
                return (
                  <li key={option} className={cn(styles.option, correct && styles.correct)}>
                    <span className={styles.optionLetter} aria-hidden>
                      {option}
                    </span>
                    <span className={styles.optionText}>
                      <span className="sr-only">{option}. </span>
                      {question[EXAM_OPTION_FIELDS[option]]}
                      {correct && <span className="sr-only"> (đáp án đúng)</span>}
                    </span>
                    {correct && (
                      <CircleCheck className={styles.correctIcon} size={18} aria-hidden />
                    )}
                  </li>
                )
              })}
            </ul>
          </li>
        )
      })}
    </ol>
  )
}

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useCallback, useEffect, useState } from 'react'

import { API_ERROR_CODES } from '@/constants/api-error-codes'
import { CONTACT } from '@/constants/contact'
import { COURSE_QUERY_KEYS, ENROLLMENT_QUERY_KEYS } from '@/constants/course'
import { EXAM_QUERY_KEYS } from '@/constants/exam'
import { STORAGE_KEYS } from '@/constants/storage-keys'
import { myExamService } from '@/services/exam-service'
import type { ApiError } from '@/types/api'
import type { ExamAnswers, ExamOption, MyExam } from '@/types/exam'
import { apiErrorMessage } from '@/utils/api-error-message'
import { storage } from '@/utils/storage'

/** Lỗi mà thử lại cũng vô ích: khoá không có bài thi / học viên không được thi. */
const FINAL_ERRORS: readonly string[] = [
  API_ERROR_CODES.COURSE_NOT_FOUND,
  API_ERROR_CODES.EXAM_NOT_FOUND,
  API_ERROR_CODES.EXAM_NOT_ALLOWED,
]

/** `GET /courses/{id}/my-exam`: luật thi và lượt thi của học viên (không kèm đáp án). */
export function useMyExam(courseId: number | undefined, enabled = true) {
  return useQuery<MyExam, ApiError>({
    queryKey: EXAM_QUERY_KEYS.mine(courseId ?? 0),
    queryFn: () => myExamService.get(courseId ?? 0),
    enabled: enabled && courseId !== undefined,
    retry: (count, error) => !FINAL_ERRORS.includes(error.code ?? '') && count < 1,
  })
}

function useSetMyExam(courseId: number) {
  const queryClient = useQueryClient()
  return (exam: MyExam) => queryClient.setQueryData(EXAM_QUERY_KEYS.mine(courseId), exam)
}

export function useStartExam(courseId: number) {
  const setMyExam = useSetMyExam(courseId)
  return useMutation<MyExam, ApiError, void>({
    mutationFn: () => myExamService.start(courseId),
    onSuccess: setMyExam,
  })
}

export function useSubmitExam(courseId: number) {
  const queryClient = useQueryClient()
  const setMyExam = useSetMyExam(courseId)
  return useMutation<MyExam, ApiError, ExamAnswers>({
    mutationFn: (answers) => myExamService.submit(courseId, answers),
    onSuccess: (exam) => {
      setMyExam(exam)
      if (exam.attempt) storage.remove(examAnswersKey(exam.attempt.id))
      // Thi đạt → khoá thành "Hoàn thành" (`myEnrollmentStatus`, danh sách khoá của tôi).
      void queryClient.invalidateQueries({ queryKey: COURSE_QUERY_KEYS.all })
      void queryClient.invalidateQueries({ queryKey: ENROLLMENT_QUERY_KEYS.all })
    },
    onError: (error) => {
      // Đã nộp ở tab khác / hết giờ đã chấm: tải lại để hiện kết quả.
      if (error.code === API_ERROR_CODES.EXAM_ALREADY_TAKEN) {
        void queryClient.invalidateQueries({ queryKey: EXAM_QUERY_KEYS.mine(courseId) })
      }
    },
  })
}

export function startExamErrorMessage(error: ApiError): string {
  if (error.code === API_ERROR_CODES.EXAM_HAS_NO_QUESTIONS) {
    return `Bài thi chưa có câu hỏi. Vui lòng gọi ${CONTACT.HOTLINE} để được hỗ trợ.`
  }
  if (error.code === API_ERROR_CODES.EXAM_NOT_ALLOWED) {
    return 'Bạn chưa được duyệt vào khoá học này nên chưa thể thi.'
  }
  if (error.code === API_ERROR_CODES.EXAM_PROGRESS_NOT_ENOUGH) {
    return 'Hệ thống chưa ghi nhận đủ 80% thời lượng video. Hãy mở và xem tiếp các video còn thiếu rồi thử lại.'
  }
  return apiErrorMessage(error, { fallback: 'Không bắt đầu được bài thi. Vui lòng thử lại.' })
}

export function submitExamErrorMessage(error: ApiError): string {
  if (error.code === API_ERROR_CODES.EXAM_ALREADY_TAKEN) {
    return 'Bài thi đã được nộp trước đó. Đang tải kết quả…'
  }
  if (error.status === 0) {
    return 'Chưa nộp được bài vì mất kết nối. Đáp án vẫn được giữ, kiểm tra mạng rồi bấm "Nộp bài" lại.'
  }
  return apiErrorMessage(error, { fallback: 'Không nộp được bài. Vui lòng thử lại.' })
}

function examAnswersKey(attemptId: number): string {
  return `${STORAGE_KEYS.EXAM_ANSWERS}.${attemptId}`
}

/**
 * Đáp án đang chọn của một lượt thi, lưu localStorage để tải lại trang (hoặc mất mạng) không mất bài.
 * Server chỉ nhận đáp án lúc nộp; nộp xong `useSubmitExam` xoá bản lưu.
 */
export function useExamAnswers(attemptId: number) {
  const key = examAnswersKey(attemptId)
  const [answers, setAnswers] = useState<ExamAnswers>(() => storage.get<ExamAnswers>(key) ?? {})

  useEffect(() => {
    storage.set(key, answers)
  }, [key, answers])

  const choose = useCallback((questionId: number, option: ExamOption) => {
    setAnswers((previous) => ({ ...previous, [questionId]: option }))
  }, [])

  return { answers, choose }
}

/**
 * Đếm ngược từ `seconds` (số giây còn lại server trả về), tính theo đồng hồ máy kể từ lúc mount
 * nên không lệch dù giờ máy học viên sai.
 */
export function useCountdown(seconds: number): number {
  const [endAt] = useState(() => Date.now() + seconds * 1000)
  const [remaining, setRemaining] = useState(seconds)

  useEffect(() => {
    const timer = window.setInterval(() => {
      const left = Math.max(0, Math.ceil((endAt - Date.now()) / 1000))
      setRemaining(left)
      if (left === 0) window.clearInterval(timer)
    }, 250)
    return () => window.clearInterval(timer)
  }, [endAt])

  return remaining
}

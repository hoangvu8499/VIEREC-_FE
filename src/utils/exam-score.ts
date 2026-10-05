import { EXAM_MAX_SCORE } from '@/constants/exam'

const scoreFormatter = new Intl.NumberFormat('vi-VN', { maximumFractionDigits: 2 })

/** `7.5` → `7,5`; `6.666…` → `6,67`. */
export function formatScore(score: number): string {
  return scoreFormatter.format(score)
}

/**
 * Số câu đúng tối thiểu để đạt: đúng ≥ điểm đạt / 10 × số câu.
 * Khớp cách backend chấm (so phân số chính xác, không so điểm đã làm tròn).
 */
export function minCorrectToPass(passScore: number, questionCount: number): number {
  // `- 1e-9`: bỏ sai số dấu phẩy động (vd. 0,7 × 10 = 7,000000000000001).
  return Math.ceil((passScore / EXAM_MAX_SCORE) * questionCount - 1e-9)
}

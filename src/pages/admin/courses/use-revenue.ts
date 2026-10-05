import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { useSearchParams } from 'react-router'

import { ENROLLMENT_PAGE_SIZE, ENROLLMENT_QUERY_KEYS } from '@/constants/course'
import { enrollmentService } from '@/services/enrollment-service'
import type { ApiError } from '@/types/api'
import type { MonthlyRevenue } from '@/types/course'

/** Tham số trên URL: `?thang=2026-10&q=nguyen&trang=2`, trang đếm từ 1. */
const PARAM = { MONTH: 'thang', KEYWORD: 'q', PAGE: 'trang' } as const

const MONTH_PATTERN = /^\d{4}-(0[1-9]|1[0-2])$/

/** Số tháng gần nhất trong ô chọn tháng. */
const MONTH_OPTION_COUNT = 24

/** Tháng hiện tại theo giờ máy, `2026-10`. */
export function currentMonth(today = new Date()): string {
  return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`
}

/** `2026-10` → `10/2026`. */
export function monthLabel(month: string): string {
  const [year, monthNumber] = month.split('-')
  return `${monthNumber}/${year}`
}

/** Tháng hiện tại và các tháng trước, mới nhất trước; tháng đang xem ngoài danh sách thì thêm vào đầu. */
export function monthOptions(selected: string, today = new Date()) {
  const months = Array.from({ length: MONTH_OPTION_COUNT }, (_, index) =>
    currentMonth(new Date(today.getFullYear(), today.getMonth() - index, 1)),
  )
  if (!months.includes(selected)) months.unshift(selected)
  return months.map((month) => ({ value: month, label: `Tháng ${monthLabel(month)}` }))
}

export function useRevenueParams() {
  const [searchParams, setSearchParams] = useSearchParams()
  const monthParam = searchParams.get(PARAM.MONTH) ?? ''
  const month = MONTH_PATTERN.test(monthParam) ? monthParam : currentMonth()
  const keyword = searchParams.get(PARAM.KEYWORD)?.trim() || undefined
  const pageParam = Number(searchParams.get(PARAM.PAGE))
  const page = Number.isInteger(pageParam) && pageParam > 1 ? pageParam - 1 : 0

  const update = (next: { month: string; keyword?: string; page: number }) => {
    const search = new URLSearchParams()
    if (next.month !== currentMonth()) search.set(PARAM.MONTH, next.month)
    if (next.keyword) search.set(PARAM.KEYWORD, next.keyword)
    if (next.page) search.set(PARAM.PAGE, String(next.page + 1))
    setSearchParams(search)
  }

  return {
    month,
    keyword,
    page,
    /** Đổi tháng giữ từ khoá, về trang đầu. */
    setMonth: (nextMonth: string) => update({ month: nextMonth, keyword, page: 0 }),
    setKeyword: (nextKeyword: string | undefined) =>
      update({ month, keyword: nextKeyword, page: 0 }),
    setPage: (nextPage: number) => update({ month, keyword, page: nextPage }),
  }
}

/** Cùng tiền tố `ENROLLMENT_QUERY_KEYS.all` → duyệt / từ chối xong là doanh thu tự tính lại. */
export function useMonthlyRevenue({
  month,
  keyword,
  page,
}: {
  month: string
  keyword?: string
  page: number
}) {
  const params = { month, keyword, page, size: ENROLLMENT_PAGE_SIZE }
  return useQuery<MonthlyRevenue, ApiError>({
    queryKey: ENROLLMENT_QUERY_KEYS.monthlyRevenue(params),
    queryFn: () => enrollmentService.monthlyRevenue(params),
    placeholderData: keepPreviousData,
  })
}

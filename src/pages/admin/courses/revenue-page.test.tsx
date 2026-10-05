import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { transferContent } from '@/constants/payment'
import { ADMIN_ROUTES, adminCoursePath, adminUserPath } from '@/constants/routes'
import RevenuePage from '@/pages/admin/courses/revenue-page'
import { currentMonth, monthLabel, monthOptions } from '@/pages/admin/courses/use-revenue'
import { enrollmentService } from '@/services/enrollment-service'
import { ENROLLMENT_FIXTURE, pageOf } from '@/test/fixtures'
import { renderRoutes } from '@/test/render-routes'
import type { MonthlyRevenue } from '@/types/course'

const SECOND = {
  ...ENROLLMENT_FIXTURE,
  id: 16,
  userId: 8,
  username: 'tranthib',
  fullName: 'Trần Thị B',
  status: 'COMPLETED' as const,
  price: 500000,
}

const REVENUE: MonthlyRevenue = {
  from: '2026-10-01',
  to: '2026-10-31',
  amount: 2000000,
  enrollments: 2,
  courses: [
    {
      courseId: ENROLLMENT_FIXTURE.courseId,
      courseName: ENROLLMENT_FIXTURE.courseName,
      amount: 2000000,
      enrollments: 2,
    },
  ],
  matchedAmount: 2000000,
  items: pageOf([ENROLLMENT_FIXTURE, SECOND]),
}

const EMPTY: MonthlyRevenue = {
  ...REVENUE,
  amount: 0,
  enrollments: 0,
  courses: [],
  matchedAmount: 0,
  items: pageOf([]),
}

function renderPage(path: string = ADMIN_ROUTES.REVENUE) {
  return renderRoutes([{ path: ADMIN_ROUTES.REVENUE, element: <RevenuePage /> }], path)
}

describe('RevenuePage (doanh thu)', () => {
  afterEach(() => vi.restoreAllMocks())

  it('shows who paid what in the current month, by default', async () => {
    const monthly = vi.spyOn(enrollmentService, 'monthlyRevenue').mockResolvedValue(REVENUE)
    renderPage()

    const label = monthLabel(currentMonth())
    const overview = await screen.findByRole('region', { name: `Tổng quan tháng ${label}` })
    expect(within(overview).getByText(/^2\.000\.000\s₫$/)).toBeInTheDocument()
    expect(within(overview).getByText(`Tổng thu tháng ${label}`)).toBeInTheDocument()
    expect(monthly).toHaveBeenCalledWith({
      month: currentMonth(),
      keyword: undefined,
      page: 0,
      size: 10,
    })
    expect(screen.getByRole('combobox', { name: 'Tháng' })).toHaveValue(currentMonth())

    const byCourse = screen.getByRole('region', { name: 'Theo khoá học' })
    expect(within(byCourse).getByText('2 lượt · 100% tổng thu')).toBeInTheDocument()

    const row = screen.getByRole('rowheader', { name: /Trần Thị B/ }).closest('tr') as HTMLElement
    expect(within(row).getByRole('link', { name: 'Trần Thị B' })).toHaveAttribute(
      'href',
      adminUserPath('USER_DETAIL', SECOND.userId),
    )
    expect(within(row).getByRole('link', { name: SECOND.courseName })).toHaveAttribute(
      'href',
      adminCoursePath('COURSE_ENROLLMENTS', SECOND.courseId),
    )
    expect(within(row).getByText('Đã hoàn thành')).toBeInTheDocument()
    expect(within(row).getByText(/^500\.000\s₫$/)).toBeInTheDocument()
    expect(
      within(row).getByText(transferContent(SECOND.courseId, SECOND.userId)),
    ).toBeInTheDocument()
    expect(screen.getByText(/^2 khoản · tổng/)).toBeInTheDocument()
  })

  it('switches month from the picker and keeps it in the URL', async () => {
    const user = userEvent.setup()
    const monthly = vi.spyOn(enrollmentService, 'monthlyRevenue').mockResolvedValue(REVENUE)
    const { router } = renderPage()
    const previous = monthOptions(currentMonth())[1]?.value ?? ''

    await user.selectOptions(await screen.findByRole('combobox', { name: 'Tháng' }), previous)

    expect(router.state.location.search).toBe(`?thang=${previous}`)
    expect(monthly).toHaveBeenLastCalledWith({
      month: previous,
      keyword: undefined,
      page: 0,
      size: 10,
    })
  })

  it('searches the payments of the month and sums what matched', async () => {
    const user = userEvent.setup()
    const monthly = vi
      .spyOn(enrollmentService, 'monthlyRevenue')
      .mockImplementation(async ({ keyword } = {}) =>
        keyword ? { ...REVENUE, matchedAmount: 500000, items: pageOf([SECOND]) } : REVENUE,
      )
    renderPage(`${ADMIN_ROUTES.REVENUE}?thang=2026-09`)

    await user.type(await screen.findByRole('searchbox', { name: 'Tìm khoản thu' }), 'tranthib')
    await user.click(screen.getByRole('button', { name: 'Tìm' }))

    expect(monthly).toHaveBeenLastCalledWith({
      month: '2026-09',
      keyword: 'tranthib',
      page: 0,
      size: 10,
    })
    expect(await screen.findByText(/^1 khoản khớp tìm kiếm · tổng/)).toBeInTheDocument()
    // Tổng tháng không đổi theo từ khoá.
    expect(screen.getByText('Tổng thu tháng 09/2026')).toBeInTheDocument()
    expect(screen.queryByRole('rowheader', { name: /Nguyễn Văn A/ })).not.toBeInTheDocument()
  })

  it('says when the month has no approved payment', async () => {
    vi.spyOn(enrollmentService, 'monthlyRevenue').mockResolvedValue(EMPTY)
    renderPage(`${ADMIN_ROUTES.REVENUE}?thang=2020-08`)

    expect(await screen.findByText('Chưa có khoản thu nào trong tháng 08/2020')).toBeInTheDocument()
    expect(screen.queryByRole('region', { name: 'Theo khoá học' })).not.toBeInTheDocument()
    // Tháng ngoài danh sách gần đây vẫn chọn được.
    expect(screen.getByRole('combobox', { name: 'Tháng' })).toHaveValue('2020-08')
  })

  it('offers a retry when loading fails', async () => {
    vi.spyOn(enrollmentService, 'monthlyRevenue').mockRejectedValue({
      status: 0,
      message: 'Network Error',
    })
    renderPage()

    expect(await screen.findByText('Không tải được doanh thu')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Thử lại' })).toBeInTheDocument()
  })
})

describe('monthOptions', () => {
  it('lists the last 24 months, newest first', () => {
    const options = monthOptions('2026-10', new Date(2026, 9, 2))
    expect(options).toHaveLength(24)
    expect(options[0]).toEqual({ value: '2026-10', label: 'Tháng 10/2026' })
    expect(options[1]?.value).toBe('2026-09')
    expect(options[10]?.value).toBe('2025-12')
  })

  it('adds the month being viewed when it is older', () => {
    expect(monthOptions('2020-01', new Date(2026, 9, 2))[0]?.value).toBe('2020-01')
  })
})

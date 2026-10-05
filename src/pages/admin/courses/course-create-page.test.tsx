import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useLocation } from 'react-router'

import { ADMIN_ROUTES } from '@/constants/routes'
import CourseCreatePage from '@/pages/admin/courses/course-create-page'
import { COURSE_FIELD_MESSAGES } from '@/schemas/course-schema'
import { courseService } from '@/services/course-service'
import { userService } from '@/services/user-service'
import { COURSE_FIXTURE, USER_FIXTURE } from '@/test/fixtures'
import { renderRoutes } from '@/test/render-routes'
import type { CourseFlashState } from '@/types/course'
import type { User } from '@/types/user'

const INSTRUCTOR: User = { ...USER_FIXTURE, id: 3, username: 'vierec_admin' }

function DetailProbe() {
  const location = useLocation()
  const state = location.state as CourseFlashState | null
  return (
    <p>
      {location.pathname}: {state?.flash}
    </p>
  )
}

function renderPage() {
  return renderRoutes(
    [
      { path: ADMIN_ROUTES.COURSE_CREATE, element: <CourseCreatePage /> },
      { path: ADMIN_ROUTES.COURSE_DETAIL, element: <DetailProbe /> },
    ],
    ADMIN_ROUTES.COURSE_CREATE,
  )
}

async function pickInstructor(user: ReturnType<typeof userEvent.setup>) {
  await user.type(screen.getByLabelText(/^Giảng viên\s*\*?$/), 'nguyen')
  const results = await screen.findByRole('list', { name: 'Kết quả tìm giảng viên' })
  await user.click(within(results).getByRole('button', { name: /Nguyễn Văn A/ }))
}

describe('CourseCreatePage', () => {
  beforeEach(() => {
    vi.spyOn(userService, 'search').mockResolvedValue({
      content: [INSTRUCTOR],
      page: 0,
      size: 6,
      totalElements: 1,
      totalPages: 1,
      first: true,
      last: true,
      empty: false,
    })
  })

  afterEach(() => vi.restoreAllMocks())

  it('validates every required field on an empty submit', async () => {
    const user = userEvent.setup()
    const create = vi.spyOn(courseService, 'create')
    renderPage()

    await user.click(screen.getByRole('button', { name: 'Tạo khoá học' }))

    expect(await screen.findByText(COURSE_FIELD_MESSAGES.name.required)).toBeInTheDocument()
    expect(screen.getByText(COURSE_FIELD_MESSAGES.description.required)).toBeInTheDocument()
    expect(screen.getByText(COURSE_FIELD_MESSAGES.instructorId.required)).toBeInTheDocument()
    expect(screen.getByLabelText(/^Tên khoá học\s*\*?$/)).toHaveFocus()
    expect(create).not.toHaveBeenCalled()
  })

  it('searches active accounts, creates the course and returns to the list', async () => {
    const user = userEvent.setup()
    const create = vi.spyOn(courseService, 'create').mockResolvedValue(COURSE_FIXTURE)
    renderPage()

    await user.type(screen.getByLabelText(/^Tên khoá học\s*\*?$/), '  PCCC cơ bản ')
    await user.type(screen.getByLabelText(/^Mô tả\s*\*?$/), 'Kiến thức PCCC')
    await pickInstructor(user)
    expect(userService.search).toHaveBeenLastCalledWith({
      keyword: 'nguyen',
      status: 'ACTIVE',
      size: 6,
    })
    expect(screen.getByRole('button', { name: /^Đổi giảng viên/ })).toBeInTheDocument()

    await user.type(screen.getByLabelText(/^Học phí \(VND\)\s*\*?$/), '250.000')
    expect(screen.getByText(/^250\.000\s₫ — số tiền học viên chuyển khoản/)).toBeInTheDocument()
    await user.selectOptions(screen.getByLabelText(/^Trạng thái\s*\*?$/), 'Đã xuất bản')
    await user.click(screen.getByRole('button', { name: 'Tạo khoá học' }))

    expect(create).toHaveBeenCalledWith({
      name: 'PCCC cơ bản',
      description: 'Kiến thức PCCC',
      instructorId: 3,
      price: 250000,
      status: 'PUBLISHED',
    })
    expect(
      await screen.findByText(
        `/admin/khoa-hoc/7: Đã tạo khoá học “${COURSE_FIXTURE.name}”. Hãy thêm bài học đầu tiên.`,
      ),
    ).toBeInTheDocument()
  })

  it('shows an inactive instructor error on the instructor field', async () => {
    const user = userEvent.setup()
    vi.spyOn(courseService, 'create').mockRejectedValue({
      status: 400,
      code: 'VRC-400-201',
      message: 'Instructor account is not active',
    })
    renderPage()

    await user.type(screen.getByLabelText(/^Tên khoá học\s*\*?$/), 'PCCC')
    await user.type(screen.getByLabelText(/^Mô tả\s*\*?$/), 'Mô tả')
    await pickInstructor(user)
    await user.type(screen.getByLabelText(/^Học phí \(VND\)\s*\*?$/), '100000')
    await user.click(screen.getByRole('button', { name: 'Tạo khoá học' }))

    expect(await screen.findByRole('alert')).toHaveTextContent(
      COURSE_FIELD_MESSAGES.instructorId.notActive,
    )
    const change = screen.getByRole('button', { name: /^Đổi giảng viên/ })
    expect(change).toHaveAttribute('aria-invalid', 'true')
    expect(change).toHaveFocus()
    expect(screen.queryByText('Instructor account is not active')).not.toBeInTheDocument()
  })
})

import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { LEARNER_ROUTES, ROUTES } from '@/constants/routes'
import { LearnerLayout } from '@/layouts/user/learner-layout'
import { useAuthStore } from '@/stores/auth-store'
import { USER_FIXTURE } from '@/test/fixtures'
import { renderRoutes } from '@/test/render-routes'

function renderLayout(path: string = LEARNER_ROUTES.OVERVIEW) {
  return renderRoutes(
    [
      {
        path: LEARNER_ROUTES.OVERVIEW,
        element: <LearnerLayout />,
        children: [
          { index: true, element: <p>Nội dung tổng quan</p> },
          { path: LEARNER_ROUTES.PROFILE, element: <p>Nội dung hồ sơ</p> },
        ],
      },
      { path: ROUTES.LOGIN, element: <p>Trang đăng nhập</p> },
    ],
    path,
  )
}

describe('LearnerLayout', () => {
  afterEach(() => useAuthStore.getState().clearSession())

  it('sends guests to the login page and remembers where they were going', () => {
    const { router } = renderLayout(LEARNER_ROUTES.PROFILE)

    expect(screen.getByText('Trang đăng nhập')).toBeInTheDocument()
    expect(router.state.location.state).toEqual({ from: LEARNER_ROUTES.PROFILE })
  })

  it('greets the learner and navigates between sections', async () => {
    const user = userEvent.setup()
    useAuthStore.getState().setUser(USER_FIXTURE)
    renderLayout()

    const banner = screen.getByRole('region', { name: 'Thông tin học viên' })
    expect(within(banner).getByText('Nguyễn Văn A')).toBeInTheDocument()
    expect(within(banner).getByText('NA')).toBeInTheDocument()
    expect(within(banner).getByText('Học viên')).toBeInTheDocument()
    expect(within(banner).getByText(/Tham gia 25\/09\/2026/)).toBeInTheDocument()

    const nav = screen.getByRole('navigation', { name: 'Góc học viên' })
    expect(within(nav).getByRole('link', { name: 'Tổng quan' })).toHaveAttribute(
      'aria-current',
      'page',
    )
    await user.click(within(nav).getByRole('link', { name: 'Hồ sơ cá nhân' }))

    expect(screen.getByText('Nội dung hồ sơ')).toBeInTheDocument()
    expect(within(nav).getByRole('link', { name: 'Tổng quan' })).not.toHaveAttribute('aria-current')
  })
})

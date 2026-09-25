import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router'

import { MAIN_NAV } from '@/constants/navigation'
import { MainNav } from '@/layouts/user/main-nav'

function renderNav() {
  return render(
    <MemoryRouter>
      <MainNav />
    </MemoryRouter>,
  )
}

// jsdom không khớp media query desktop → danh sách menu ẩn cho tới khi mở bằng nút hamburger.
async function openMenu() {
  await userEvent.click(screen.getByRole('button', { name: 'Mở menu' }))
}

describe('MainNav', () => {
  it('renders every menu item and the emergency button', async () => {
    renderNav()
    await openMenu()

    for (const item of MAIN_NAV) {
      expect(screen.getByRole('link', { name: item.label })).toBeInTheDocument()
    }
    expect(screen.getByRole('link', { name: /báo sự cố khẩn cấp/i })).toBeInTheDocument()
  })

  it('marks the current route as active', async () => {
    renderNav()
    await openMenu()

    expect(screen.getByRole('link', { name: 'Trang chủ' })).toHaveAttribute('aria-current', 'page')
  })

  it('toggles the mobile menu', async () => {
    renderNav()

    const toggle = screen.getByRole('button', { name: 'Mở menu' })
    expect(toggle).toHaveAttribute('aria-expanded', 'false')

    await userEvent.click(toggle)
    expect(screen.getByRole('button', { name: 'Đóng menu' })).toHaveAttribute(
      'aria-expanded',
      'true',
    )

    await userEvent.click(screen.getByRole('link', { name: 'Khóa học' }))
    expect(screen.getByRole('button', { name: 'Mở menu' })).toHaveAttribute(
      'aria-expanded',
      'false',
    )
  })
})

import { render, screen, within } from '@testing-library/react'
import { MemoryRouter } from 'react-router'

import HomePage from '@/pages/home/home-page'
import { CATEGORIES, NEWS, PARTNERS } from '@/pages/home/home-data'

function renderHome() {
  return render(
    <MemoryRouter>
      <HomePage />
    </MemoryRouter>,
  )
}

describe('HomePage', () => {
  it('renders the hero heading and sets document title', () => {
    renderHome()

    expect(
      screen.getByRole('heading', { level: 1, name: /vì một việt nam an toàn/i }),
    ).toBeInTheDocument()
    expect(document.title).toMatch(/^Trang chủ/)
  })

  it('renders all categories', () => {
    renderHome()

    const section = screen.getByRole('region', { name: 'Lĩnh vực đào tạo' })
    expect(within(section).getAllByRole('link')).toHaveLength(CATEGORIES.length)
  })

  it('renders news with formatted dates', () => {
    renderHome()

    const section = screen.getByRole('region', { name: 'Tin tức & Sự kiện' })
    expect(within(section).getAllByRole('heading', { level: 3 })).toHaveLength(NEWS.length)
    expect(within(section).getByText('20/09/2026')).toBeInTheDocument()
  })

  it('renders partners', () => {
    renderHome()

    const section = screen.getByRole('region', { name: 'Đối tác & Khách hàng' })
    expect(within(section).getAllByRole('listitem')).toHaveLength(PARTNERS.length)
  })
})

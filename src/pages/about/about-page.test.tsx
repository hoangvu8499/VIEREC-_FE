import { screen, within } from '@testing-library/react'

import { COMPANY, CONTACT } from '@/constants/contact'
import { ROUTES } from '@/constants/routes'
import AboutPage from '@/pages/about/about-page'
import { DIRECTORS, EXPERTS } from '@/pages/about/about-data'
import { renderRoutes } from '@/test/render-routes'

function renderAbout() {
  return renderRoutes([{ path: ROUTES.ABOUT, element: <AboutPage /> }], ROUTES.ABOUT)
}

describe('AboutPage', () => {
  it('shows the centre name and legal information from the capability profile', () => {
    renderAbout()

    expect(screen.getByRole('heading', { level: 1, name: COMPANY.NAME })).toBeInTheDocument()
    const info = screen.getByRole('complementary', { name: 'Thông tin trung tâm' })
    expect(within(info).getByText(COMPANY.ADDRESS)).toBeInTheDocument()
    expect(within(info).getByText(COMPANY.TAX_CODE)).toBeInTheDocument()
    expect(within(info).getByRole('link', { name: CONTACT.HOTLINE })).toHaveAttribute(
      'href',
      `tel:${CONTACT.HOTLINE.replaceAll(' ', '')}`,
    )
  })

  it('lists the board of directors and the expert council', () => {
    renderAbout()

    const directors = screen.getByRole('region', { name: 'Ban Giám đốc' })
    expect(within(directors).getAllByRole('listitem')).toHaveLength(DIRECTORS.length)
    const experts = screen.getByRole('region', { name: 'Hội đồng chuyên gia' })
    expect(within(experts).getAllByRole('listitem')).toHaveLength(EXPERTS.length)
  })
})

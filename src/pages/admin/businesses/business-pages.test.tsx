import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { ADMIN_ROUTES, adminBusinessPath } from '@/constants/routes'
import BusinessCreatePage from '@/pages/admin/businesses/business-create-page'
import BusinessDetailPage from '@/pages/admin/businesses/business-detail-page'
import BusinessesPage from '@/pages/admin/businesses/businesses-page'
import { businessService } from '@/services/business-service'
import {
  BUSINESS_FIXTURE,
  BUSINESS_MANAGER_FIXTURE,
  BUSINESS_MEMBER_FIXTURE,
  pageOf,
} from '@/test/fixtures'
import { renderRoutes } from '@/test/render-routes'

const label = (text: string) => new RegExp(`^${text}\\s*\\*?$`)

function renderCreate() {
  return renderRoutes(
    [
      { path: ADMIN_ROUTES.BUSINESS_CREATE, element: <BusinessCreatePage /> },
      { path: ADMIN_ROUTES.BUSINESS_DETAIL, element: <p>Trang chi tiết doanh nghiệp</p> },
    ],
    ADMIN_ROUTES.BUSINESS_CREATE,
  )
}

async function fillCreate(user: ReturnType<typeof userEvent.setup>) {
  const [business, manager] = screen.getAllByRole('group')
  if (!business || !manager) throw new Error('missing fieldsets')
  const inBusiness = within(business)
  await user.type(inBusiness.getByLabelText(label('Tên doanh nghiệp')), 'Công ty Môi trường Xanh')
  await user.type(inBusiness.getByLabelText(label('Mã số thuế')), '0101234567')
  await user.type(inBusiness.getByLabelText(label('Địa chỉ')), 'TP. Hồ Chí Minh')
  await user.type(inBusiness.getByLabelText(label('Số điện thoại liên hệ')), '0281234567')
  await user.type(inBusiness.getByLabelText(label('Email liên hệ')), 'lienhe@xanh.vn')
  const inManager = within(manager)
  await user.type(inManager.getByLabelText(label('Họ và tên đệm')), 'Trần Thị')
  await user.type(inManager.getByLabelText(label('Tên')), 'Bình')
  await user.type(inManager.getByLabelText(label('Số điện thoại')), '0912345678')
  await user.type(inManager.getByLabelText(label('Email')), 'binh@xanh.vn')
  await user.type(inManager.getByLabelText(label('Tên đăng nhập')), 'xanh.admin')
  await user.type(inManager.getByLabelText(label('Mật khẩu')), 'Abc@1234')
  await user.type(inManager.getByLabelText(label('Nhập lại mật khẩu')), 'Abc@1234')
}

describe('Quản trị doanh nghiệp', () => {
  afterEach(() => vi.restoreAllMocks())

  it('lists the businesses', async () => {
    vi.spyOn(businessService, 'search').mockResolvedValue(pageOf([BUSINESS_FIXTURE]))
    renderRoutes(
      [{ path: ADMIN_ROUTES.BUSINESSES, element: <BusinessesPage /> }],
      ADMIN_ROUTES.BUSINESSES,
    )

    expect(await screen.findByRole('link', { name: BUSINESS_FIXTURE.name })).toHaveAttribute(
      'href',
      adminBusinessPath(BUSINESS_FIXTURE.id),
    )
    const item = screen
      .getByRole('link', { name: BUSINESS_FIXTURE.name })
      .closest('li') as HTMLElement
    expect(within(item).getByText(/MST 0101234567/)).toBeInTheDocument()
    expect(within(item).getByText('Đang hoạt động')).toBeInTheDocument()
  })

  it('creates a business with its first manager', async () => {
    const user = userEvent.setup()
    const create = vi.spyOn(businessService, 'create').mockResolvedValue(BUSINESS_FIXTURE)
    renderCreate()

    await fillCreate(user)
    await user.click(screen.getByRole('button', { name: 'Tạo doanh nghiệp' }))

    expect(create).toHaveBeenCalledWith({
      name: 'Công ty Môi trường Xanh',
      taxCode: '0101234567',
      status: 'ACTIVE',
      address: 'TP. Hồ Chí Minh',
      phoneNumber: '0281234567',
      email: 'lienhe@xanh.vn',
      manager: {
        lastName: 'Trần Thị',
        firstName: 'Bình',
        phoneNumber: '0912345678',
        email: 'binh@xanh.vn',
        username: 'xanh.admin',
        password: 'Abc@1234',
      },
    })
    expect(await screen.findByText('Trang chi tiết doanh nghiệp')).toBeInTheDocument()
  })

  it('puts the server errors under the right fields', async () => {
    const user = userEvent.setup()
    vi.spyOn(businessService, 'create')
      .mockRejectedValueOnce({ status: 409, code: 'VRC-409-801', message: 'Tax code taken' })
      .mockRejectedValueOnce({ status: 409, code: 'VRC-409-101', message: 'Username taken' })
    renderCreate()

    await fillCreate(user)
    await user.click(screen.getByRole('button', { name: 'Tạo doanh nghiệp' }))
    expect(
      await screen.findAllByText('Mã số thuế này đã có doanh nghiệp khác dùng'),
    ).not.toHaveLength(0)
    expect(screen.getByLabelText(label('Mã số thuế'))).toHaveFocus()

    await user.click(screen.getByRole('button', { name: 'Tạo doanh nghiệp' }))
    expect(await screen.findAllByText('Tên đăng nhập đã được sử dụng')).not.toHaveLength(0)
    expect(screen.getByLabelText(label('Tên đăng nhập'))).toHaveFocus()
  })

  it('shows a business with its managers and learners, and adds a manager', async () => {
    const user = userEvent.setup()
    vi.spyOn(businessService, 'get').mockResolvedValue(BUSINESS_FIXTURE)
    vi.spyOn(businessService, 'managers').mockResolvedValue([BUSINESS_MANAGER_FIXTURE])
    vi.spyOn(businessService, 'members').mockResolvedValue(pageOf([BUSINESS_MEMBER_FIXTURE]))
    const addManager = vi
      .spyOn(businessService, 'addManager')
      .mockResolvedValue({ ...BUSINESS_MANAGER_FIXTURE, id: 30, username: 'xanh.hr' })
    renderRoutes(
      [{ path: ADMIN_ROUTES.BUSINESS_DETAIL, element: <BusinessDetailPage /> }],
      adminBusinessPath(BUSINESS_FIXTURE.id),
    )

    expect(
      await screen.findByRole('heading', { level: 1, name: BUSINESS_FIXTURE.name }),
    ).toBeVisible()
    expect(await screen.findByText(/@mtxanh\.admin/)).toBeInTheDocument()
    expect(await screen.findByRole('link', { name: /Lê Văn An/ })).toHaveAttribute(
      'href',
      adminBusinessPath(BUSINESS_FIXTURE.id, BUSINESS_MEMBER_FIXTURE.id),
    )

    await user.click(screen.getByRole('button', { name: 'Thêm' }))
    const dialog = screen.getByRole('dialog', { name: 'Thêm tài khoản quản lý' })
    const inDialog = within(dialog)
    await user.type(inDialog.getByLabelText(label('Họ và tên đệm')), 'Phạm')
    await user.type(inDialog.getByLabelText(label('Tên')), 'Hà')
    await user.type(inDialog.getByLabelText(label('Số điện thoại')), '0912999888')
    await user.type(inDialog.getByLabelText(label('Email')), 'ha@xanh.vn')
    await user.type(inDialog.getByLabelText(label('Tên đăng nhập')), 'xanh.hr')
    await user.type(inDialog.getByLabelText(label('Mật khẩu')), 'Abc@1234')
    await user.type(inDialog.getByLabelText(label('Nhập lại mật khẩu')), 'Abc@1234')
    await user.click(inDialog.getByRole('button', { name: 'Tạo tài khoản' }))

    expect(addManager).toHaveBeenCalledWith(BUSINESS_FIXTURE.id, {
      lastName: 'Phạm',
      firstName: 'Hà',
      phoneNumber: '0912999888',
      email: 'ha@xanh.vn',
      username: 'xanh.hr',
      password: 'Abc@1234',
    })
    expect(await screen.findByText('Đã tạo tài khoản quản lý @xanh.hr.')).toBeInTheDocument()
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })
})

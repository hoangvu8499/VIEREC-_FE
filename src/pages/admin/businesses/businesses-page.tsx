import { Building2, Mail, Phone, Plus, ReceiptText, RotateCw, SearchX, Users } from 'lucide-react'
import { type FormEvent, useState } from 'react'
import { Link } from 'react-router'

import { Button } from '@/components/common/button'
import { ButtonLink } from '@/components/common/button-link'
import { EmptyState } from '@/components/common/empty-state'
import { Pagination } from '@/components/common/pagination'
import { SelectField } from '@/components/form/select-field'
import { TextField } from '@/components/form/text-field'
import { BUSINESS_STATUS_LABELS, BUSINESS_STATUSES } from '@/constants/business'
import { ADMIN_ROUTES, adminBusinessPath } from '@/constants/routes'
import { useDocumentTitle } from '@/hooks/use-document-title'
import { AdminPageHeader } from '@/layouts/admin/admin-page-header'
import { AdminPanel } from '@/layouts/admin/admin-panel'
import { useBusinessList, useBusinessListParams } from '@/pages/admin/businesses/use-businesses'
import type { BusinessStatus } from '@/types/business'
import { apiErrorMessage } from '@/utils/api-error-message'
import { cn } from '@/utils/cn'

import styles from './components/business.module.css'

const numberFormatter = new Intl.NumberFormat('vi-VN')

const STATUS_OPTIONS = [
  { value: '', label: 'Tất cả trạng thái' },
  ...BUSINESS_STATUSES.map((status) => ({ value: status, label: BUSINESS_STATUS_LABELS[status] })),
]

function Filters({
  keyword,
  status,
  onChange,
}: {
  keyword?: string
  status?: BusinessStatus
  onChange: (next: { keyword?: string; status?: BusinessStatus }) => void
}) {
  const [draftKeyword, setDraftKeyword] = useState(keyword ?? '')
  const [draftStatus, setDraftStatus] = useState<string>(status ?? '')

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    onChange({
      keyword: draftKeyword.trim() || undefined,
      status: (draftStatus || undefined) as BusinessStatus | undefined,
    })
  }

  return (
    <search>
      <form className={styles.filters} onSubmit={submit}>
        <TextField
          label="Tìm doanh nghiệp"
          type="search"
          placeholder="Tên hoặc mã số thuế"
          value={draftKeyword}
          onChange={(event) => setDraftKeyword(event.target.value)}
        />
        <SelectField
          label="Trạng thái"
          options={STATUS_OPTIONS}
          value={draftStatus}
          onChange={(event) => setDraftStatus(event.target.value)}
        />
        <div className={styles.filterActions}>
          <Button type="submit" variant="primary">
            Lọc
          </Button>
        </div>
      </form>
    </search>
  )
}

export default function BusinessesPage() {
  useDocumentTitle('Doanh nghiệp – Quản trị')
  const { params, update } = useBusinessListParams()
  const businesses = useBusinessList(params)
  const data = businesses.data
  const hasFilters = Boolean(params.keyword || params.status)
  const firstIndex = data ? data.page * data.size + 1 : 0
  const lastIndex = data ? firstIndex + data.content.length - 1 : 0

  return (
    <>
      <AdminPageHeader
        title="Khách hàng doanh nghiệp"
        description="Doanh nghiệp tạo tài khoản, đăng ký khoá học và theo dõi kết quả của nhân viên mình."
        action={
          <ButtonLink to={ADMIN_ROUTES.BUSINESS_CREATE} variant="accent">
            <Plus size={18} aria-hidden /> Thêm doanh nghiệp
          </ButtonLink>
        }
      />

      <AdminPanel aria-label="Danh sách doanh nghiệp">
        <Filters
          key={`${params.keyword ?? ''}|${params.status ?? ''}`}
          keyword={params.keyword}
          status={params.status}
          onChange={update}
        />

        {businesses.isPending ? (
          <p className={styles.loading} aria-busy>
            Đang tải danh sách doanh nghiệp…
          </p>
        ) : businesses.isError ? (
          <EmptyState
            icon={RotateCw}
            tone="danger"
            title="Không tải được danh sách doanh nghiệp"
            description={apiErrorMessage(businesses.error, {
              fallback: 'Đã có lỗi xảy ra. Vui lòng thử lại.',
            })}
            action={
              <Button variant="outline" onClick={() => void businesses.refetch()}>
                Thử lại
              </Button>
            }
          />
        ) : data && data.content.length > 0 ? (
          <>
            <ul className={styles.list}>
              {data.content.map((business) => (
                <li key={business.id} className={styles.item}>
                  <div className={styles.itemHead}>
                    <Link to={adminBusinessPath(business.id)} className={styles.itemName}>
                      {business.name}
                    </Link>
                    <span className={cn(styles.badge, styles[business.status])}>
                      {BUSINESS_STATUS_LABELS[business.status]}
                    </span>
                  </div>
                  <p className={styles.meta}>
                    <span>
                      <ReceiptText size={14} aria-hidden /> MST {business.taxCode}
                    </span>
                    <span>
                      <Users size={14} aria-hidden /> {numberFormatter.format(business.memberCount)}{' '}
                      học viên
                    </span>
                    <span>
                      <Phone size={14} aria-hidden /> {business.phoneNumber}
                    </span>
                    <span>
                      <Mail size={14} aria-hidden /> {business.email}
                    </span>
                  </p>
                </li>
              ))}
            </ul>
            <div className={styles.pageFooter}>
              <p className={styles.summary}>
                Hiển thị {firstIndex}–{lastIndex} trong{' '}
                <strong>{numberFormatter.format(data.totalElements)}</strong> doanh nghiệp
              </p>
              <Pagination
                page={data.page}
                totalPages={data.totalPages}
                onChange={(page) => update({ page })}
                label="Phân trang doanh nghiệp"
              />
            </div>
          </>
        ) : hasFilters ? (
          <EmptyState
            icon={SearchX}
            title="Không tìm thấy doanh nghiệp phù hợp"
            action={
              <Button
                variant="outline"
                onClick={() => update({ keyword: undefined, status: undefined })}
              >
                Xoá bộ lọc
              </Button>
            }
          />
        ) : (
          <EmptyState
            icon={Building2}
            title="Chưa có khách hàng doanh nghiệp"
            description="Tạo doanh nghiệp cùng tài khoản quản lý sau khi ký hợp đồng đào tạo."
          />
        )}
      </AdminPanel>
    </>
  )
}

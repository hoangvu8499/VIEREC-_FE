import { Building2, CalendarPlus, RotateCw, SearchX, UserPlus, Users } from 'lucide-react'
import { useState } from 'react'
import { useLocation } from 'react-router'

import { Alert } from '@/components/common/alert'
import { Button } from '@/components/common/button'
import { ButtonLink } from '@/components/common/button-link'
import { EmptyState } from '@/components/common/empty-state'
import { Pagination } from '@/components/common/pagination'
import { BusinessMemberList } from '@/components/shared/business-member-list'
import { MemberSearch } from '@/components/shared/member-search'
import { BUSINESS_PAGE_SIZE } from '@/constants/business'
import { BUSINESS_ROUTES, businessMemberPath } from '@/constants/routes'
import { useDocumentTitle } from '@/hooks/use-document-title'
import { AccountPageHeader } from '@/layouts/user/account-page-header'
import { useListParams } from '@/pages/business/use-list-params'
import { businessErrorMessage, useMyBusiness, useMyMembers } from '@/pages/business/use-my-business'
import type { FlashState } from '@/types/navigation'

import styles from './business.module.css'

const numberFormatter = new Intl.NumberFormat('vi-VN')

export default function BusinessOverviewPage() {
  useDocumentTitle('Góc doanh nghiệp')
  const location = useLocation()
  const [flash] = useState((location.state as FlashState | null)?.flash)
  const business = useMyBusiness()
  const { keyword, page, update } = useListParams()
  const members = useMyMembers({ keyword, page, size: BUSINESS_PAGE_SIZE })

  if (business.isError) {
    return (
      <EmptyState
        icon={Building2}
        tone="danger"
        title="Không mở được Góc doanh nghiệp"
        description={businessErrorMessage(business.error, 'Đã có lỗi xảy ra. Vui lòng thử lại.')}
        action={
          <Button variant="outline" onClick={() => void business.refetch()}>
            Thử lại
          </Button>
        }
      />
    )
  }

  const data = members.data
  const firstIndex = data ? data.page * data.size + 1 : 0
  const lastIndex = data ? firstIndex + data.content.length - 1 : 0

  return (
    <>
      <AccountPageHeader
        title={business.data?.name ?? 'Góc doanh nghiệp'}
        description="Tạo tài khoản cho nhân viên, đăng ký khoá học và theo dõi tiến độ, kết quả của từng người."
        action={
          <div className={styles.headerActions}>
            <ButtonLink to={BUSINESS_ROUTES.MEMBER_CREATE} variant="outline">
              <UserPlus size={18} aria-hidden /> Thêm học viên
            </ButtonLink>
            <ButtonLink to={BUSINESS_ROUTES.ENROLL} variant="accent">
              <CalendarPlus size={18} aria-hidden /> Đăng ký khoá học
            </ButtonLink>
          </div>
        }
      />

      {flash && <Alert variant="success">{flash}</Alert>}

      {business.data && (
        <dl className={styles.stats}>
          <div className={styles.stat}>
            <dt>Học viên</dt>
            <dd>{numberFormatter.format(business.data.memberCount)}</dd>
          </div>
          <div className={styles.stat}>
            <dt>Mã số thuế</dt>
            <dd>{business.data.taxCode}</dd>
          </div>
          <div className={styles.stat}>
            <dt>Liên hệ</dt>
            <dd>{business.data.phoneNumber}</dd>
          </div>
        </dl>
      )}

      <section className={styles.panel} aria-label="Học viên của doanh nghiệp">
        <MemberSearch
          key={keyword ?? ''}
          keyword={keyword}
          onSearch={(next) => update({ keyword: next, page: 0 })}
        />
        {members.isPending ? (
          <p className={styles.loading} aria-busy>
            Đang tải danh sách học viên…
          </p>
        ) : members.isError ? (
          <EmptyState
            icon={RotateCw}
            tone="danger"
            title="Không tải được danh sách học viên"
            description={businessErrorMessage(members.error, 'Đã có lỗi xảy ra. Vui lòng thử lại.')}
            action={
              <Button variant="outline" onClick={() => void members.refetch()}>
                Thử lại
              </Button>
            }
          />
        ) : data && data.content.length > 0 ? (
          <>
            <BusinessMemberList
              members={data.content}
              memberHref={businessMemberPath}
              isFetching={members.isPlaceholderData}
            />
            <div className={styles.footer}>
              <p className={styles.summary}>
                Hiển thị {firstIndex}–{lastIndex} trong{' '}
                <strong>{numberFormatter.format(data.totalElements)}</strong> học viên
              </p>
              <Pagination
                page={data.page}
                totalPages={data.totalPages}
                onChange={(next) => update({ keyword, page: next })}
                label="Phân trang học viên"
              />
            </div>
          </>
        ) : keyword ? (
          <EmptyState
            icon={SearchX}
            title="Không tìm thấy học viên phù hợp"
            description="Thử từ khoá khác."
          />
        ) : (
          <EmptyState
            icon={Users}
            title="Doanh nghiệp chưa có học viên"
            description="Tạo tài khoản cho từng nhân viên, sau đó đăng ký khoá học cho họ."
            action={
              <ButtonLink to={BUSINESS_ROUTES.MEMBER_CREATE} variant="accent">
                <UserPlus size={18} aria-hidden /> Thêm học viên
              </ButtonLink>
            }
          />
        )}
      </section>
    </>
  )
}

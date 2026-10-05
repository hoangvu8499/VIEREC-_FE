import { Building2, CircleAlert, KeyRound, Pencil, UserPlus, Users } from 'lucide-react'
import { useCallback, useState } from 'react'
import { useLocation, useParams } from 'react-router'

import { Alert } from '@/components/common/alert'
import { Button } from '@/components/common/button'
import { Dialog } from '@/components/common/dialog'
import { EmptyState } from '@/components/common/empty-state'
import { Pagination } from '@/components/common/pagination'
import { BusinessMemberList } from '@/components/shared/business-member-list'
import { MemberSearch } from '@/components/shared/member-search'
import { API_ERROR_CODES } from '@/constants/api-error-codes'
import { BUSINESS_PAGE_SIZE, BUSINESS_STATUS_LABELS } from '@/constants/business'
import { ADMIN_ROUTES, adminBusinessPath } from '@/constants/routes'
import { useDocumentTitle } from '@/hooks/use-document-title'
import { AdminPageHeader } from '@/layouts/admin/admin-page-header'
import { AdminPanel } from '@/layouts/admin/admin-panel'
import { EditBusinessForm, ManagerForm } from '@/pages/admin/businesses/components/business-forms'
import {
  useBusiness,
  useBusinessManagers,
  useBusinessMembers,
} from '@/pages/admin/businesses/use-businesses'
import type { Business } from '@/types/business'
import type { FlashState } from '@/types/navigation'
import { apiErrorMessage } from '@/utils/api-error-message'
import { cn } from '@/utils/cn'
import { formatDate } from '@/utils/format-date'
import { userFullName } from '@/utils/user-full-name'

import styles from './components/business.module.css'

const numberFormatter = new Intl.NumberFormat('vi-VN')

function useBusinessIdParam(): number | undefined {
  const value = Number(useParams().businessId)
  return Number.isInteger(value) && value > 0 ? value : undefined
}

function Managers({ businessId, onAdd }: { businessId: number; onAdd: () => void }) {
  const managers = useBusinessManagers(businessId)
  return (
    <section className={styles.card} aria-labelledby="managers-title">
      <div className={styles.cardHeader}>
        <h2 id="managers-title" className={styles.cardTitle}>
          <KeyRound size={18} aria-hidden /> Tài khoản quản lý
        </h2>
        <Button variant="outline" size="sm" onClick={onAdd}>
          <UserPlus size={16} aria-hidden /> Thêm
        </Button>
      </div>
      {managers.isPending ? (
        <p className={styles.summary}>Đang tải…</p>
      ) : managers.isError ? (
        <p className={styles.summary}>Không tải được danh sách tài khoản quản lý.</p>
      ) : (
        <ul className={styles.managers}>
          {managers.data.map((manager) => (
            <li key={manager.id}>
              <strong>{userFullName(manager) || manager.username}</strong>
              <span className={styles.summary}>
                @{manager.username} · {manager.phoneNumber} · {manager.email}
              </span>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}

function Members({ business }: { business: Business }) {
  const [keyword, setKeyword] = useState<string>()
  const [page, setPage] = useState(0)
  const members = useBusinessMembers(business.id, { keyword, page, size: BUSINESS_PAGE_SIZE })
  const data = members.data

  return (
    <AdminPanel className={styles.membersPanel} aria-labelledby="members-title">
      <h2 id="members-title" className={styles.membersTitle}>
        Học viên ({numberFormatter.format(business.memberCount)})
      </h2>
      <MemberSearch
        keyword={keyword}
        onSearch={(next) => {
          setKeyword(next)
          setPage(0)
        }}
      />
      {members.isPending ? (
        <p className={styles.loading} aria-busy>
          Đang tải học viên…
        </p>
      ) : members.isError ? (
        <EmptyState
          icon={CircleAlert}
          tone="danger"
          title="Không tải được danh sách học viên"
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
            memberHref={(userId) => adminBusinessPath(business.id, userId)}
            isFetching={members.isPlaceholderData}
          />
          {data.totalPages > 1 && (
            <div className={styles.pageFooter}>
              <span className={styles.summary}>
                {numberFormatter.format(data.totalElements)} học viên
              </span>
              <Pagination
                page={data.page}
                totalPages={data.totalPages}
                onChange={setPage}
                label="Phân trang học viên"
              />
            </div>
          )}
        </>
      ) : (
        <EmptyState
          icon={Users}
          title={keyword ? 'Không tìm thấy học viên phù hợp' : 'Doanh nghiệp chưa có học viên'}
          description={
            keyword ? undefined : 'Người quản lý của doanh nghiệp tạo tài khoản cho nhân viên.'
          }
        />
      )}
    </AdminPanel>
  )
}

export default function BusinessDetailPage() {
  const businessId = useBusinessIdParam()
  const business = useBusiness(businessId)
  const location = useLocation()
  const [flash, setFlash] = useState((location.state as FlashState | null)?.flash)
  const [dialog, setDialog] = useState<'edit' | 'manager'>()
  const [busy, setBusy] = useState(false)
  useDocumentTitle(business.data ? `${business.data.name} – Quản trị` : 'Doanh nghiệp – Quản trị')

  const closeDialog = useCallback(() => {
    setDialog(undefined)
    setBusy(false)
  }, [])

  const back = { to: ADMIN_ROUTES.BUSINESSES, label: 'Danh sách doanh nghiệp' }

  if (!businessId || business.error?.code === API_ERROR_CODES.BUSINESS_NOT_FOUND) {
    return (
      <>
        <AdminPageHeader back={back} title="Không tìm thấy doanh nghiệp" />
        <EmptyState icon={Building2} title="Doanh nghiệp không tồn tại" />
      </>
    )
  }
  if (business.isError) {
    return (
      <>
        <AdminPageHeader back={back} title="Doanh nghiệp" />
        <EmptyState
          icon={CircleAlert}
          tone="danger"
          title="Không tải được doanh nghiệp"
          description={apiErrorMessage(business.error, {
            fallback: 'Đã có lỗi xảy ra. Vui lòng thử lại.',
          })}
          action={
            <Button variant="outline" onClick={() => void business.refetch()}>
              Thử lại
            </Button>
          }
        />
      </>
    )
  }
  if (!business.data) {
    return (
      <>
        <AdminPageHeader back={back} title="Doanh nghiệp" />
        <p className={styles.loading} aria-busy>
          Đang tải doanh nghiệp…
        </p>
      </>
    )
  }

  const data = business.data
  return (
    <>
      <AdminPageHeader back={back} title={data.name} description={`Mã số thuế ${data.taxCode}`} />

      {flash && <Alert variant="success">{flash}</Alert>}

      <div className={styles.layout}>
        <div className={styles.aside}>
          <section className={styles.card} aria-labelledby="business-info-title">
            <div className={styles.cardHeader}>
              <h2 id="business-info-title" className={styles.cardTitle}>
                <Building2 size={18} aria-hidden /> Thông tin
              </h2>
              <Button variant="outline" size="sm" onClick={() => setDialog('edit')}>
                <Pencil size={16} aria-hidden /> Sửa
              </Button>
            </div>
            <dl className={styles.info}>
              <div>
                <dt>Trạng thái</dt>
                <dd>
                  <span className={cn(styles.badge, styles[data.status])}>
                    {BUSINESS_STATUS_LABELS[data.status]}
                  </span>
                </dd>
              </div>
              <div>
                <dt>Địa chỉ</dt>
                <dd>{data.address}</dd>
              </div>
              <div>
                <dt>Liên hệ</dt>
                <dd>
                  {data.phoneNumber} · {data.email}
                </dd>
              </div>
              <div>
                <dt>Ngày tạo</dt>
                <dd>{formatDate(data.createdAt)}</dd>
              </div>
            </dl>
          </section>
          <Managers businessId={data.id} onAdd={() => setDialog('manager')} />
        </div>

        <Members business={data} />
      </div>

      <Dialog
        open={dialog === 'edit'}
        title="Sửa thông tin doanh nghiệp"
        busy={busy}
        onClose={closeDialog}
      >
        <EditBusinessForm
          business={data}
          onCancel={closeDialog}
          onBusyChange={setBusy}
          onSuccess={(saved) => {
            setFlash(`Đã lưu thông tin ${saved.name}.`)
            closeDialog()
          }}
        />
      </Dialog>
      <Dialog
        open={dialog === 'manager'}
        title="Thêm tài khoản quản lý"
        description={`Tài khoản đăng nhập vào Góc doanh nghiệp của ${data.name}.`}
        busy={busy}
        onClose={closeDialog}
      >
        <ManagerForm
          businessId={data.id}
          onCancel={closeDialog}
          onBusyChange={setBusy}
          onSuccess={(manager) => {
            setFlash(`Đã tạo tài khoản quản lý @${manager.username}.`)
            closeDialog()
          }}
        />
      </Dialog>
    </>
  )
}

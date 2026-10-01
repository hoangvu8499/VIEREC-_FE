import { RotateCw, SearchX, UserPlus, Users } from 'lucide-react'
import { useState } from 'react'
import { useLocation } from 'react-router'

import { Alert } from '@/components/common/alert'
import { Button } from '@/components/common/button'
import { ButtonLink } from '@/components/common/button-link'
import { ConfirmDialog } from '@/components/common/confirm-dialog'
import { EmptyState } from '@/components/common/empty-state'
import { Pagination } from '@/components/common/pagination'
import { ADMIN_ROUTES } from '@/constants/routes'
import { useDocumentTitle } from '@/hooks/use-document-title'
import { AdminPageHeader } from '@/layouts/admin/admin-page-header'
import { AdminPanel } from '@/layouts/admin/admin-panel'
import { UserFilters } from '@/pages/admin/users/components/user-filters'
import { UserTable } from '@/pages/admin/users/components/user-table'
import {
  useDeleteUser,
  userActionErrorMessage,
  useUserList,
  useUserListParams,
} from '@/pages/admin/users/use-users'
import { canManageUser } from '@/pages/admin/users/user-permissions'
import { useAuthStore } from '@/stores/auth-store'
import type { FlashState } from '@/types/navigation'
import type { User } from '@/types/user'
import { apiErrorMessage } from '@/utils/api-error-message'
import { userFullName } from '@/utils/user-full-name'

import styles from './components/user-list.module.css'

const numberFormatter = new Intl.NumberFormat('vi-VN')

export default function UsersPage() {
  useDocumentTitle('Người dùng – Quản trị')
  const location = useLocation()
  const actor = useAuthStore((state) => state.user)
  const { params, setPage, setFilters } = useUserListParams()
  const users = useUserList(params)
  const deleteUser = useDeleteUser()
  const [toDelete, setToDelete] = useState<User>()
  const [flash, setFlash] = useState((location.state as FlashState | null)?.flash)

  const data = users.data
  const hasFilters = Boolean(params.keyword || params.status)
  const firstIndex = data ? data.page * data.size + 1 : 0
  const lastIndex = data ? firstIndex + data.content.length - 1 : 0

  const closeDialog = () => {
    setToDelete(undefined)
    deleteUser.reset()
  }

  return (
    <>
      <AdminPageHeader
        title="Quản lý người dùng"
        description="Tài khoản học viên và quản trị viên: tạo mới, cập nhật, khoá và gán vai trò."
        action={
          <ButtonLink to={ADMIN_ROUTES.USER_CREATE} variant="accent">
            <UserPlus size={18} aria-hidden /> Thêm tài khoản
          </ButtonLink>
        }
      />

      {flash && (
        <Alert variant="success" className={styles.flash}>
          {flash}
        </Alert>
      )}

      <AdminPanel aria-label="Danh sách tài khoản">
        <UserFilters
          key={`${params.keyword ?? ''}|${params.status ?? ''}`}
          keyword={params.keyword}
          status={params.status}
          onChange={setFilters}
        />

        {users.isPending ? (
          <p className={styles.loading} aria-busy>
            Đang tải danh sách tài khoản…
          </p>
        ) : users.isError ? (
          <EmptyState
            icon={RotateCw}
            tone="danger"
            title="Không tải được danh sách tài khoản"
            description={apiErrorMessage(users.error, {
              fallback: 'Đã có lỗi xảy ra. Vui lòng thử lại.',
            })}
            action={
              <Button variant="outline" onClick={() => void users.refetch()}>
                Thử lại
              </Button>
            }
          />
        ) : data && data.content.length > 0 ? (
          <>
            <UserTable
              users={data.content}
              isFetching={users.isPlaceholderData}
              currentUserId={actor?.id}
              canManage={(user) => canManageUser(actor, user)}
              onDelete={setToDelete}
            />
            <div className={styles.footer}>
              <p className={styles.summary}>
                Hiển thị {firstIndex}–{lastIndex} trong{' '}
                <strong>{numberFormatter.format(data.totalElements)}</strong> tài khoản
              </p>
              <Pagination
                page={data.page}
                totalPages={data.totalPages}
                onChange={setPage}
                label="Phân trang tài khoản"
              />
            </div>
          </>
        ) : hasFilters ? (
          <EmptyState
            icon={SearchX}
            title="Không tìm thấy tài khoản phù hợp"
            description="Thử từ khoá khác hoặc bỏ bộ lọc trạng thái."
            action={
              <Button
                variant="outline"
                onClick={() => setFilters({ keyword: undefined, status: undefined })}
              >
                Xoá bộ lọc
              </Button>
            }
          />
        ) : (
          <EmptyState icon={Users} title="Chưa có tài khoản nào" />
        )}
      </AdminPanel>

      <ConfirmDialog
        open={Boolean(toDelete)}
        title="Xoá tài khoản?"
        description={
          toDelete && (
            <>
              Tài khoản <strong>{userFullName(toDelete) || toDelete.username}</strong> (@
              {toDelete.username}) sẽ bị vô hiệu hoá và không đăng nhập được nữa.
            </>
          )
        }
        confirmLabel="Xoá tài khoản"
        loading={deleteUser.isPending}
        error={
          deleteUser.isError
            ? userActionErrorMessage(deleteUser.error, 'Không xoá được. Vui lòng thử lại.')
            : undefined
        }
        onConfirm={() => {
          if (!toDelete) return
          const name = userFullName(toDelete) || toDelete.username
          deleteUser.mutate(toDelete, {
            onSuccess: () => {
              setFlash(`Đã xoá tài khoản ${name}.`)
              closeDialog()
              if (data && data.content.length === 1 && data.page > 0) setPage(data.page - 1)
            },
          })
        }}
        onCancel={closeDialog}
      />
    </>
  )
}

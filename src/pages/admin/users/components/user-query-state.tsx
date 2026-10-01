import type { UseQueryResult } from '@tanstack/react-query'
import { CircleAlert, RotateCw } from 'lucide-react'
import type { ReactNode } from 'react'

import { Button } from '@/components/common/button'
import { ButtonLink } from '@/components/common/button-link'
import { EmptyState } from '@/components/common/empty-state'
import { API_ERROR_CODES } from '@/constants/api-error-codes'
import { ADMIN_ROUTES } from '@/constants/routes'
import { AdminPanel } from '@/layouts/admin/admin-panel'
import { USER_GONE } from '@/pages/admin/users/use-users'
import type { ApiError } from '@/types/api'
import type { User } from '@/types/user'
import { apiErrorMessage } from '@/utils/api-error-message'

import styles from './user-detail.module.css'

interface UserQueryStateProps {
  /** `undefined` khi id trên URL không hợp lệ. */
  query: UseQueryResult<User, ApiError> | undefined
  children: (user: User) => ReactNode
}

/** Đang tải / không tồn tại / lỗi của `useUserDetail`; có dữ liệu thì render `children`. */
export function UserQueryState({ query, children }: UserQueryStateProps) {
  if (!query || (query.isError && query.error.code === API_ERROR_CODES.USER_NOT_FOUND)) {
    return (
      <AdminPanel>
        <EmptyState
          icon={CircleAlert}
          tone="danger"
          title={query ? USER_GONE : 'Đường dẫn tài khoản không hợp lệ'}
          description="Hãy chọn tài khoản từ danh sách."
          action={
            <ButtonLink to={ADMIN_ROUTES.USERS} variant="outline">
              Về danh sách người dùng
            </ButtonLink>
          }
        />
      </AdminPanel>
    )
  }
  if (query.isPending) {
    return (
      <AdminPanel>
        <p className={styles.loading} aria-busy>
          Đang tải tài khoản…
        </p>
      </AdminPanel>
    )
  }
  if (query.isError) {
    return (
      <AdminPanel>
        <EmptyState
          icon={RotateCw}
          tone="danger"
          title="Không tải được tài khoản"
          description={apiErrorMessage(query.error, {
            fallback: 'Đã có lỗi xảy ra. Vui lòng thử lại.',
          })}
          action={
            <Button variant="outline" onClick={() => void query.refetch()}>
              Thử lại
            </Button>
          }
        />
      </AdminPanel>
    )
  }
  return children(query.data)
}

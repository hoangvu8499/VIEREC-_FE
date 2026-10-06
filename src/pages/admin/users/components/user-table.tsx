import { Eye, Pencil, Trash2 } from 'lucide-react'
import { Link } from 'react-router'

import { IconButton } from '@/components/common/icon-button'
import { adminUserPath } from '@/constants/routes'
import { RoleBadges, UserStatusBadge } from '@/pages/admin/users/components/user-badges'
import type { User } from '@/types/user'
import { cn } from '@/utils/cn'
import { formatDate } from '@/utils/format-date'
import { learnerOrganization } from '@/utils/learner-organization'
import { isAdmin } from '@/utils/user-roles'
import { userFullName } from '@/utils/user-full-name'

import styles from './user-list.module.css'

interface UserTableProps {
  users: User[]
  isFetching?: boolean
  /** Người đang đăng nhập — không tự xoá mình. */
  currentUserId?: number
  /** Người thao tác không phải SUPER_ADMIN thì không sửa / xoá được SUPER_ADMIN (giao diện). */
  canManage: (user: User) => boolean
  onDelete: (user: User) => void
}

/** Bảng tài khoản; dưới 1280px mỗi dòng thành một thẻ. */
export function UserTable({
  users,
  isFetching,
  currentUserId,
  canManage,
  onDelete,
}: UserTableProps) {
  return (
    <div className={cn(styles.tableWrap, isFetching && styles.fetching)} aria-busy={isFetching}>
      <table className={styles.table}>
        <caption className="sr-only">Danh sách tài khoản</caption>
        <thead>
          <tr>
            <th scope="col">Tài khoản</th>
            <th scope="col">Liên hệ</th>
            <th scope="col">Vai trò</th>
            <th scope="col">Trạng thái</th>
            <th scope="col">Ngày tạo</th>
            <th scope="col" className={styles.actionsHead}>
              Thao tác
            </th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => {
            const name = userFullName(user) || user.username
            const isSelf = user.id === currentUserId
            const manageable = canManage(user)
            return (
              <tr key={user.id}>
                <th scope="row" className={styles.userCell}>
                  <span className={styles.avatar} aria-hidden>
                    {(user.firstName.trim().split(/\s+/).at(-1) || user.username)
                      .charAt(0)
                      .toUpperCase()}
                  </span>
                  <span className={styles.userText}>
                    <Link to={adminUserPath('USER_DETAIL', user.id)} className={styles.userName}>
                      {name}
                    </Link>
                    <span className={styles.subtle}>
                      @{user.username}
                      {isSelf && <span className={styles.you}> · Bạn</span>}
                    </span>
                    {!isAdmin(user) && (
                      <span className={styles.subtle}>
                        Đơn vị: {learnerOrganization(user.businessName)}
                      </span>
                    )}
                  </span>
                </th>
                <td data-label="Liên hệ" className={styles.stackCell}>
                  <span className={styles.ellipsis}>{user.email}</span>
                  <span className={styles.subtle}>{user.phoneNumber}</span>
                </td>
                <td data-label="Vai trò">
                  <RoleBadges roles={user.roles} />
                </td>
                <td data-label="Trạng thái">
                  <UserStatusBadge status={user.status} />
                </td>
                <td data-label="Ngày tạo" className={styles.subtle}>
                  {formatDate(user.createdAt)}
                </td>
                <td className={styles.actionsCell}>
                  <div className={styles.actions}>
                    <Link
                      to={adminUserPath('USER_DETAIL', user.id)}
                      className={styles.actionButton}
                      aria-label={`Xem tài khoản ${name}`}
                      title="Xem chi tiết"
                    >
                      <Eye size={18} aria-hidden />
                    </Link>
                    {manageable && (
                      <Link
                        to={adminUserPath('USER_EDIT', user.id)}
                        className={styles.actionButton}
                        aria-label={`Sửa tài khoản ${name}`}
                        title="Sửa"
                      >
                        <Pencil size={18} aria-hidden />
                      </Link>
                    )}
                    {manageable && !isSelf && (
                      <IconButton
                        className={cn(styles.actionButton, styles.danger)}
                        label={`Xoá tài khoản ${name}`}
                        title="Xoá"
                        onClick={() => onDelete(user)}
                      >
                        <Trash2 size={18} aria-hidden />
                      </IconButton>
                    )}
                  </div>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

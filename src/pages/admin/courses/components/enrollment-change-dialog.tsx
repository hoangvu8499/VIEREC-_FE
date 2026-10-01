import { BadgeCheck, CircleCheck, Undo2, X, type LucideIcon } from 'lucide-react'
import type { ReactNode } from 'react'

import { ConfirmDialog } from '@/components/common/confirm-dialog'
import { EnrollmentPayments } from '@/pages/admin/courses/components/enrollment-payments'
import {
  ENROLLMENT_ACTIONS,
  enrollmentAdminErrorMessage,
  type EnrollmentAction,
  useUpdateEnrollmentStatus,
} from '@/pages/admin/courses/use-course-enrollments'
import type { Enrollment } from '@/types/course'

/** Thao tác đang chờ admin xác nhận trong hộp thoại. */
export type EnrollmentChange = { enrollment: Enrollment; action: EnrollmentAction }

const ACTION_COPY: Record<
  EnrollmentAction,
  {
    title: string
    confirmLabel: string
    tone: 'primary' | 'danger'
    icon: LucideIcon
    description: (enrollment: Enrollment) => ReactNode
    success: (enrollment: Enrollment) => string
  }
> = {
  approve: {
    title: 'Duyệt học viên vào học?',
    confirmLabel: 'Duyệt vào học',
    tone: 'primary',
    icon: BadgeCheck,
    description: (enrollment) => (
      <>
        Đối chiếu khoản chuyển của <strong>{enrollment.fullName}</strong> cho khoá{' '}
        <strong>{enrollment.courseName}</strong> trước khi duyệt. Học viên sẽ xem được video và tải
        tài liệu của khoá ngay sau đó.
        <EnrollmentPayments enrollment={enrollment} />
      </>
    ),
    success: (enrollment) =>
      `Đã duyệt ${enrollment.fullName} vào học khoá “${enrollment.courseName}”.`,
  },
  reject: {
    title: 'Từ chối yêu cầu đăng ký?',
    confirmLabel: 'Từ chối',
    tone: 'danger',
    icon: X,
    description: (enrollment) => (
      <>
        Yêu cầu học khoá <strong>{enrollment.courseName}</strong> của{' '}
        <strong>{enrollment.fullName}</strong> chuyển sang “Đã huỷ”. Nếu học viên đã chuyển tiền,
        hãy liên hệ để hoàn tiền.
      </>
    ),
    success: (enrollment) => `Đã từ chối yêu cầu của ${enrollment.fullName}.`,
  },
  complete: {
    title: 'Xác nhận hoàn thành?',
    confirmLabel: 'Xác nhận hoàn thành',
    tone: 'primary',
    icon: CircleCheck,
    description: (enrollment) => (
      <>
        Xác nhận <strong>{enrollment.fullName}</strong> đã hoàn thành khoá học. Sau đó bạn có thể
        cấp chứng chỉ.
      </>
    ),
    success: (enrollment) => `Đã xác nhận ${enrollment.fullName} hoàn thành khoá học.`,
  },
  reopen: {
    title: 'Chuyển về trạng thái đang học?',
    confirmLabel: 'Chuyển về đang học',
    tone: 'danger',
    icon: Undo2,
    description: (enrollment) => (
      <>
        <strong>{enrollment.fullName}</strong> sẽ trở lại trạng thái đang học (ngày hoàn thành bị
        xoá). Không áp dụng được nếu đã cấp chứng chỉ.
      </>
    ),
    success: (enrollment) => `Đã chuyển ${enrollment.fullName} về trạng thái đang học.`,
  },
}

interface EnrollmentChangeDialogProps {
  change: EnrollmentChange | undefined
  onClose: () => void
  /** Đổi trạng thái xong, kèm câu thông báo thành công. */
  onDone: (message: string) => void
}

/** Xác nhận duyệt / từ chối / hoàn thành / mở lại một lượt đăng ký rồi gọi API. */
export function EnrollmentChangeDialog({ change, onClose, onDone }: EnrollmentChangeDialogProps) {
  const updateStatus = useUpdateEnrollmentStatus()
  const copy = change && ACTION_COPY[change.action]

  const close = () => {
    updateStatus.reset()
    onClose()
  }

  return (
    <ConfirmDialog
      open={Boolean(change)}
      tone={copy?.tone}
      icon={copy?.icon}
      title={copy?.title ?? ''}
      description={change && copy?.description(change.enrollment)}
      confirmLabel={copy?.confirmLabel ?? ''}
      loading={updateStatus.isPending}
      error={
        updateStatus.isError
          ? enrollmentAdminErrorMessage(
              updateStatus.error,
              'Chưa cập nhật được trạng thái. Vui lòng thử lại.',
            )
          : undefined
      }
      onConfirm={() => {
        if (!change || !copy) return
        const { enrollment, action } = change
        updateStatus.mutate(
          { enrollment, status: ENROLLMENT_ACTIONS[action] },
          {
            onSuccess: () => {
              onDone(copy.success(enrollment))
              close()
            },
          },
        )
      }}
      onCancel={close}
    />
  )
}

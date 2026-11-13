import { FileSpreadsheet, MapPinned, Plus, RotateCw, SearchX } from 'lucide-react'
import { useCallback, useState } from 'react'

import { Alert } from '@/components/common/alert'
import { Button } from '@/components/common/button'
import { ConfirmDialog } from '@/components/common/confirm-dialog'
import { Dialog } from '@/components/common/dialog'
import { EmptyState } from '@/components/common/empty-state'
import { Pagination } from '@/components/common/pagination'
import { useDocumentTitle } from '@/hooks/use-document-title'
import { AdminPageHeader } from '@/layouts/admin/admin-page-header'
import { AdminPanel } from '@/layouts/admin/admin-panel'
import { KeywordSearch } from '@/pages/admin/courses/components/keyword-search'
import { SupportPointForm } from '@/pages/admin/support-points/components/support-point-form'
import { SupportPointImportDialog } from '@/pages/admin/support-points/components/support-point-import-dialog'
import { SupportPointTable } from '@/pages/admin/support-points/components/support-point-table'
import {
  deleteSupportPointErrorMessage,
  useDeleteSupportPoint,
  useSupportPointList,
  useSupportPointListParams,
} from '@/pages/admin/support-points/use-support-points'
import type { SupportPointDetail } from '@/types/support-point'
import { apiErrorMessage } from '@/utils/api-error-message'

import styles from './components/support-points.module.css'

const numberFormatter = new Intl.NumberFormat('vi-VN')

/** `undefined`: hộp thoại đóng; `null`: thêm mới; một điểm: sửa điểm đó. */
type Editing = SupportPointDetail | null | undefined

export default function SupportPointsPage() {
  useDocumentTitle('Điểm hỗ trợ sự cố – Quản trị')
  const { params, update } = useSupportPointListParams()
  const points = useSupportPointList(params)
  const deletePoint = useDeleteSupportPoint()
  const [editing, setEditing] = useState<Editing>()
  const [formBusy, setFormBusy] = useState(false)
  const [importOpen, setImportOpen] = useState(false)
  const [toDelete, setToDelete] = useState<SupportPointDetail>()
  const [flash, setFlash] = useState<string>()

  const data = points.data
  const firstIndex = data ? data.page * data.size + 1 : 0
  const lastIndex = data ? firstIndex + data.content.length - 1 : 0

  const closeForm = useCallback(() => {
    setEditing(undefined)
    setFormBusy(false)
  }, [])

  const closeDelete = () => {
    setToDelete(undefined)
    deletePoint.reset()
  }

  return (
    <>
      <AdminPageHeader
        title="Điểm hỗ trợ sự cố"
        description="Mạng lưới đơn vị xử lý sự cố môi trường mà học viên tìm thấy ở trang Tìm đơn vị gần nhất."
        action={
          <div className={styles.headerActions}>
            <Button variant="outline" onClick={() => setImportOpen(true)}>
              <FileSpreadsheet size={18} aria-hidden /> Import Excel
            </Button>
            <Button variant="accent" onClick={() => setEditing(null)}>
              <Plus size={18} aria-hidden /> Thêm điểm hỗ trợ
            </Button>
          </div>
        }
      />

      {flash && (
        <Alert variant="success" className={styles.flash}>
          {flash}
        </Alert>
      )}

      <AdminPanel aria-label="Danh sách điểm hỗ trợ">
        <KeywordSearch
          key={params.keyword ?? ''}
          label="Tìm điểm hỗ trợ"
          placeholder="Tên đơn vị, tỉnh, quận / huyện, địa chỉ hoặc số điện thoại"
          keyword={params.keyword}
          onChange={(keyword) => update({ keyword, page: 0 })}
        />

        {points.isPending ? (
          <p className={styles.loading} aria-busy>
            Đang tải danh sách điểm hỗ trợ…
          </p>
        ) : points.isError ? (
          <EmptyState
            icon={RotateCw}
            tone="danger"
            title="Không tải được danh sách điểm hỗ trợ"
            description={apiErrorMessage(points.error, {
              fallback: 'Đã có lỗi xảy ra. Vui lòng thử lại.',
              byStatus: { 403: 'Bạn không có quyền quản lý điểm hỗ trợ.' },
            })}
            action={
              <Button variant="outline" onClick={() => void points.refetch()}>
                Thử lại
              </Button>
            }
          />
        ) : data && data.content.length > 0 ? (
          <>
            <SupportPointTable
              points={data.content}
              isFetching={points.isPlaceholderData}
              onEdit={setEditing}
              onDelete={setToDelete}
            />
            <div className={styles.footer}>
              <p className={styles.summary}>
                Hiển thị {firstIndex}–{lastIndex} trong{' '}
                <strong>{numberFormatter.format(data.totalElements)}</strong> điểm hỗ trợ
              </p>
              <Pagination
                page={data.page}
                totalPages={data.totalPages}
                onChange={(page) => update({ keyword: params.keyword, page })}
                label="Phân trang điểm hỗ trợ"
              />
            </div>
          </>
        ) : params.keyword ? (
          <EmptyState
            icon={SearchX}
            title="Không tìm thấy điểm hỗ trợ phù hợp"
            description="Thử từ khoá khác."
            action={
              <Button variant="outline" onClick={() => update({ page: 0 })}>
                Xoá lọc
              </Button>
            }
          />
        ) : (
          <EmptyState
            icon={MapPinned}
            title="Chưa có điểm hỗ trợ nào"
            description="Thêm từng điểm, hoặc import cả danh sách từ file Excel."
            action={
              <div className={styles.headerActions}>
                <Button variant="accent" onClick={() => setEditing(null)}>
                  <Plus size={18} aria-hidden /> Thêm điểm hỗ trợ
                </Button>
                <Button variant="outline" onClick={() => setImportOpen(true)}>
                  <FileSpreadsheet size={18} aria-hidden /> Import Excel
                </Button>
              </div>
            }
          />
        )}
      </AdminPanel>

      <Dialog
        open={editing !== undefined}
        title={editing ? 'Sửa điểm hỗ trợ' : 'Thêm điểm hỗ trợ'}
        busy={formBusy}
        onClose={closeForm}
      >
        <SupportPointForm
          // Đổi điểm đang sửa → form mới với giá trị của điểm đó.
          key={editing?.id ?? 'new'}
          point={editing ?? undefined}
          onBusyChange={setFormBusy}
          onCancel={closeForm}
          onSaved={(saved) => {
            setFlash(
              editing ? `Đã lưu thay đổi của ${saved.name}.` : `Đã thêm điểm hỗ trợ ${saved.name}.`,
            )
            closeForm()
          }}
        />
      </Dialog>

      <SupportPointImportDialog
        open={importOpen}
        onClose={() => setImportOpen(false)}
        onImported={(result) => {
          setFlash(
            `Đã thêm ${numberFormatter.format(result.importedCount)} điểm hỗ trợ từ file Excel.`,
          )
          update({ page: 0 })
        }}
      />

      <ConfirmDialog
        open={Boolean(toDelete)}
        title="Xoá điểm hỗ trợ?"
        description={
          toDelete && (
            <>
              <strong>{toDelete.name}</strong> ({toDelete.district}, {toDelete.province}) sẽ không
              còn hiện ở trang Tìm đơn vị gần nhất.
            </>
          )
        }
        confirmLabel="Xoá điểm hỗ trợ"
        loading={deletePoint.isPending}
        error={deletePoint.isError ? deleteSupportPointErrorMessage(deletePoint.error) : undefined}
        onConfirm={() => {
          if (!toDelete) return
          const name = toDelete.name
          deletePoint.mutate(toDelete, {
            onSuccess: () => {
              setFlash(`Đã xoá điểm hỗ trợ ${name}.`)
              closeDelete()
              if (data && data.content.length === 1 && data.page > 0) {
                update({ keyword: params.keyword, page: data.page - 1 })
              }
            },
          })
        }}
        onCancel={closeDelete}
      />
    </>
  )
}

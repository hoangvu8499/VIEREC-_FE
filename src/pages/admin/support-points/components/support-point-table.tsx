import { MapPin, Pencil, Trash2 } from 'lucide-react'

import { IconButton } from '@/components/common/icon-button'
import type { SupportPointDetail } from '@/types/support-point'
import { cn } from '@/utils/cn'

import styles from './support-points.module.css'

const coordinateFormatter = new Intl.NumberFormat('en-US', { maximumFractionDigits: 6 })

/** Mở vị trí trên Google Maps để kiểm tra toạ độ. */
function mapUrl(point: SupportPointDetail): string {
  return `https://www.google.com/maps?q=${point.latitude},${point.longitude}`
}

interface SupportPointTableProps {
  points: SupportPointDetail[]
  isFetching?: boolean
  onEdit: (point: SupportPointDetail) => void
  onDelete: (point: SupportPointDetail) => void
}

/** Bảng điểm hỗ trợ; màn hẹp mỗi dòng thành một thẻ. */
export function SupportPointTable({
  points,
  isFetching,
  onEdit,
  onDelete,
}: SupportPointTableProps) {
  return (
    <div className={cn(styles.tableWrap, isFetching && styles.fetching)} aria-busy={isFetching}>
      <table className={styles.table}>
        <caption className="sr-only">Danh sách điểm hỗ trợ sự cố</caption>
        <thead>
          <tr>
            <th scope="col">Đơn vị</th>
            <th scope="col">Khu vực</th>
            <th scope="col">Số điện thoại</th>
            <th scope="col">Toạ độ</th>
            <th scope="col" className={styles.actionsHead}>
              Thao tác
            </th>
          </tr>
        </thead>
        <tbody>
          {points.map((point) => (
            <tr key={point.id}>
              <th scope="row" className={styles.nameCell}>
                <span className={styles.name}>{point.name}</span>
                {point.address && <span className={styles.subtle}>{point.address}</span>}
              </th>
              <td data-label="Khu vực">
                {point.district}, {point.province}
              </td>
              <td data-label="Điện thoại">
                <a href={`tel:${point.phoneNumber.replace(/[^\d+]/g, '')}`}>{point.phoneNumber}</a>
              </td>
              <td data-label="Toạ độ">
                <a
                  href={mapUrl(point)}
                  target="_blank"
                  rel="noreferrer"
                  className={styles.mapLink}
                  title="Xem trên Google Maps"
                >
                  <MapPin size={14} aria-hidden />
                  {coordinateFormatter.format(point.latitude)},{' '}
                  {coordinateFormatter.format(point.longitude)}
                </a>
              </td>
              <td className={styles.actionsCell} aria-label="Thao tác">
                <div className={styles.actions}>
                  <IconButton
                    className={styles.actionButton}
                    label={`Sửa ${point.name}`}
                    title="Sửa"
                    onClick={() => onEdit(point)}
                  >
                    <Pencil size={18} aria-hidden />
                  </IconButton>
                  <IconButton
                    className={cn(styles.actionButton, styles.danger)}
                    label={`Xoá ${point.name}`}
                    title="Xoá"
                    onClick={() => onDelete(point)}
                  >
                    <Trash2 size={18} aria-hidden />
                  </IconButton>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

import { MapPin, Navigation, Phone } from 'lucide-react'

import { Button } from '@/components/common/button'
import type { SupportPoint, SupportPointSearchOrigin } from '@/types/support-point'
import { cn } from '@/utils/cn'

import styles from './responder-list.module.css'

const distanceFormatter = new Intl.NumberFormat('vi-VN', { maximumFractionDigits: 2 })

/** `0905123456` → `0905 123 456` cho dễ đọc. */
function formatPhone(phone: string): string {
  return /^\d{10}$/.test(phone) ? phone.replace(/^(\d{4})(\d{3})(\d{3})$/, '$1 $2 $3') : phone
}

/** Google Maps chỉ đường từ vị trí tìm tới đơn vị (mở app bản đồ trên điện thoại). */
function directionsUrl(origin: SupportPointSearchOrigin, point: SupportPoint): string {
  const params = new URLSearchParams({
    api: '1',
    origin: `${origin.latitude},${origin.longitude}`,
    destination: `${point.latitude},${point.longitude}`,
  })
  return `https://www.google.com/maps/dir/?${params.toString()}`
}

interface ResponderListProps {
  origin: SupportPointSearchOrigin
  points: SupportPoint[]
  selectedId?: number
  onSelect: (id: number) => void
}

/** Đơn vị gần nhất trước: gọi ngay, chỉ đường, xem trên bản đồ. */
export function ResponderList({ origin, points, selectedId, onSelect }: ResponderListProps) {
  return (
    <ol className={styles.list} aria-label="Đơn vị xử lý sự cố gần nhất">
      {points.map((point, index) => (
        <li key={point.id}>
          <article
            className={cn(styles.card, point.id === selectedId && styles.selected)}
            aria-labelledby={`responder-${point.id}`}
          >
            <div className={styles.head}>
              <span className={styles.rank} aria-hidden>
                {index + 1}
              </span>
              <div className={styles.titleBlock}>
                <h3 id={`responder-${point.id}`} className={styles.name}>
                  {point.name}
                </h3>
                <p className={styles.place}>
                  {point.address ? `${point.address}, ` : ''}
                  {point.district}, {point.province}
                </p>
              </div>
              <span className={styles.distance}>
                {distanceFormatter.format(point.distanceKm)} km
              </span>
            </div>
            <div className={styles.actions}>
              <a
                className={styles.call}
                href={`tel:${point.phoneNumber}`}
                aria-label={`Gọi ${point.name}: ${point.phoneNumber}`}
              >
                <Phone size={16} aria-hidden /> {formatPhone(point.phoneNumber)}
              </a>
              <a
                className={styles.link}
                href={directionsUrl(origin, point)}
                target="_blank"
                rel="noreferrer"
                aria-label={`Chỉ đường tới ${point.name} (mở Google Maps)`}
              >
                <Navigation size={16} aria-hidden /> Chỉ đường
              </a>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onSelect(point.id)}
                aria-label={`Xem ${point.name} trên bản đồ`}
                aria-pressed={point.id === selectedId}
              >
                <MapPin size={16} aria-hidden /> Trên bản đồ
              </Button>
            </div>
          </article>
        </li>
      ))}
    </ol>
  )
}

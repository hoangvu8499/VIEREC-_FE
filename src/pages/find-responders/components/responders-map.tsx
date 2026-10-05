import 'leaflet/dist/leaflet.css'

import L from 'leaflet'
import { type RefObject, useEffect, useRef } from 'react'
import { Circle, MapContainer, Marker, Popup, TileLayer, useMap } from 'react-leaflet'

import type { SupportPoint, SupportPointSearchOrigin } from '@/types/support-point'

import styles from './responders-map.module.css'

const distanceFormatter = new Intl.NumberFormat('vi-VN', { maximumFractionDigits: 2 })

/** Ghim SVG tô bằng `currentColor` → màu lấy từ class (biến CSS), không hard-code. */
function pinIcon(className: string) {
  return L.divIcon({
    className,
    html:
      '<svg width="28" height="42" viewBox="0 0 25 41" aria-hidden="true">' +
      '<path d="M12.5 0C5.6 0 0 5.6 0 12.5c0 9.2 9.3 21.9 11.6 24.9a1.13 1.13 0 0 0 1.8 0' +
      'C15.7 34.4 25 21.7 25 12.5 25 5.6 19.4 0 12.5 0z" fill="currentColor" stroke="#fff" stroke-width="1.5"/>' +
      '<circle cx="12.5" cy="13" r="5" fill="#fff"/></svg>',
    iconSize: [28, 42],
    iconAnchor: [14, 42],
    popupAnchor: [0, -36],
  })
}

const originIcon = pinIcon(`${styles.pin} ${styles.originPin}`)
const unitIcon = pinIcon(`${styles.pin} ${styles.unitPin}`)

export interface RespondersMapProps {
  origin: SupportPointSearchOrigin
  radiusKm: number
  points: SupportPoint[]
  /** Đơn vị được chọn ở danh sách: bay tới và mở thông tin. */
  selectedId?: number
}

/** Zoom vừa vòng bán kính; chọn một đơn vị thì bay tới đó. */
function MapViewport({
  origin,
  radiusKm,
  selected,
  markers,
}: {
  origin: SupportPointSearchOrigin
  radiusKm: number
  selected?: SupportPoint
  markers: RefObject<Map<number, L.Marker>>
}) {
  const map = useMap()

  useEffect(() => {
    const center = L.latLng(origin.latitude, origin.longitude)
    map.fitBounds(center.toBounds(radiusKm * 2000), { padding: [24, 24] })
  }, [map, origin.latitude, origin.longitude, radiusKm])

  useEffect(() => {
    if (!selected) return
    map.flyTo([selected.latitude, selected.longitude], Math.max(map.getZoom(), 15))
    markers.current.get(selected.id)?.openPopup()
  }, [map, selected, markers])

  return null
}

export default function RespondersMap({
  origin,
  radiusKm,
  points,
  selectedId,
}: RespondersMapProps) {
  const markers = useRef(new Map<number, L.Marker>())
  const selected = points.find((point) => point.id === selectedId)

  return (
    <MapContainer
      className={styles.map}
      center={[origin.latitude, origin.longitude]}
      zoom={14}
      scrollWheelZoom={false}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
      />
      <MapViewport origin={origin} radiusKm={radiusKm} selected={selected} markers={markers} />
      <Circle
        center={[origin.latitude, origin.longitude]}
        radius={radiusKm * 1000}
        pathOptions={{ className: styles.radius }}
      />
      <Marker position={[origin.latitude, origin.longitude]} icon={originIcon}>
        <Popup>
          <strong>Vị trí tìm kiếm</strong>
          {origin.label && <p className={styles.popupText}>{origin.label}</p>}
        </Popup>
      </Marker>
      {points.map((point) => (
        <Marker
          key={point.id}
          position={[point.latitude, point.longitude]}
          icon={unitIcon}
          ref={(marker) => {
            if (marker) markers.current.set(point.id, marker)
            else markers.current.delete(point.id)
          }}
        >
          <Popup>
            <strong>{point.name}</strong>
            <p className={styles.popupText}>
              {point.district}, {point.province}
            </p>
            <p className={styles.popupText}>
              <a href={`tel:${point.phoneNumber}`}>{point.phoneNumber}</a> · cách{' '}
              {distanceFormatter.format(point.distanceKm)} km
            </p>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  )
}

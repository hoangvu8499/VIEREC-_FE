import { LocateFixed, MapPinned, MapPinOff, RotateCw, Search } from 'lucide-react'
import { lazy, Suspense, useState } from 'react'

import { Alert } from '@/components/common/alert'
import { Button } from '@/components/common/button'
import { Container } from '@/components/common/container'
import { EmptyState } from '@/components/common/empty-state'
import { SelectField } from '@/components/form/select-field'
import { TextField } from '@/components/form/text-field'
import { useDocumentTitle } from '@/hooks/use-document-title'
import { ResponderList } from '@/pages/find-responders/components/responder-list'
import {
  ADDRESS_MAX_LENGTH,
  nearbyErrorMessage,
  RADIUS_OPTIONS,
  useCurrentPosition,
  useNearbySupportPoints,
  useResponderSearchParams,
} from '@/pages/find-responders/use-find-responders'
import type { NearbySupportPoints } from '@/types/support-point'

import styles from './find-responders-page.module.css'

// Leaflet (~150 KB) chỉ tải khi có kết quả.
const RespondersMap = lazy(() => import('@/pages/find-responders/components/responders-map'))

const RADIUS_SELECT_OPTIONS = RADIUS_OPTIONS.map((radius) => ({
  value: String(radius),
  label: `${radius} km`,
}))

const numberFormatter = new Intl.NumberFormat('vi-VN')

function Results({
  data,
  onWiden,
}: {
  data: NearbySupportPoints
  onWiden?: (radiusKm: number) => void
}) {
  const [selectedId, setSelectedId] = useState<number>()
  const place = data.origin.label ?? 'vị trí của bạn'
  const wider = RADIUS_OPTIONS.find((radius) => radius > data.radiusKm)

  return (
    <section className={styles.results} aria-labelledby="responders-result-title">
      <h2 id="responders-result-title" className={styles.resultTitle}>
        {data.results.length > 0
          ? `${numberFormatter.format(data.results.length)} đơn vị trong bán kính ${data.radiusKm} km`
          : `Không có đơn vị nào trong bán kính ${data.radiusKm} km`}
      </h2>
      <p className={styles.resultPlace}>Quanh {place}</p>

      <div className={styles.resultGrid}>
        <div className={styles.mapBox}>
          <Suspense
            fallback={
              <p className={styles.mapLoading} aria-busy>
                Đang tải bản đồ…
              </p>
            }
          >
            <RespondersMap
              origin={data.origin}
              radiusKm={data.radiusKm}
              points={data.results}
              selectedId={selectedId}
            />
          </Suspense>
        </div>

        <div className={styles.listBox}>
          {data.results.length > 0 ? (
            <ResponderList
              origin={data.origin}
              points={data.results}
              selectedId={selectedId}
              onSelect={setSelectedId}
            />
          ) : (
            <EmptyState
              icon={MapPinOff}
              title="Chưa có đơn vị xử lý ở gần"
              description={
                wider
                  ? `Thử mở rộng bán kính tìm kiếm lên ${wider} km.`
                  : 'Thử nhập một địa chỉ khác hoặc liên hệ tổng đài khẩn cấp.'
              }
              action={
                wider &&
                onWiden && (
                  <Button variant="outline" onClick={() => onWiden(wider)}>
                    Tìm trong {wider} km
                  </Button>
                )
              }
            />
          )}
        </div>
      </div>
    </section>
  )
}

/** Tìm đơn vị xử lý sự cố quanh một địa chỉ hoặc vị trí hiện tại (cần đăng nhập). */
export default function FindRespondersPage() {
  useDocumentTitle('Tìm đơn vị xử lý sự cố')
  const { search, address, radiusKm, searchAddress, searchCoordinates, setRadius } =
    useResponderSearchParams()
  const nearby = useNearbySupportPoints(search)
  const position = useCurrentPosition(searchCoordinates)
  const [draft, setDraft] = useState(address ?? '')
  const [draftError, setDraftError] = useState<string>()

  return (
    <div className={styles.page}>
      <section className={styles.hero} aria-labelledby="responders-title">
        <Container className={styles.heroInner}>
          <span className={styles.heroIcon} aria-hidden>
            <MapPinned size={30} />
          </span>
          <h1 id="responders-title" className={styles.title}>
            Tìm đơn vị xử lý sự cố
          </h1>
          <p className={styles.subtitle}>
            Nhập nơi xảy ra sự cố hoặc dùng vị trí hiện tại để tìm đơn vị xử lý gần nhất, gọi ngay
            hoặc xem đường đi.
          </p>
        </Container>
      </section>

      <Container className={styles.content}>
        <search className={styles.search}>
          <form
            className={styles.searchForm}
            noValidate
            onSubmit={(event) => {
              event.preventDefault()
              const next = draft.trim()
              if (!next) {
                setDraftError('Vui lòng nhập địa chỉ nơi xảy ra sự cố.')
                return
              }
              setDraftError(undefined)
              setDraft(next)
              searchAddress(next)
            }}
          >
            <TextField
              label="Địa chỉ nơi xảy ra sự cố"
              placeholder="Vd. Ngũ Hành Sơn, Đà Nẵng"
              autoComplete="street-address"
              maxLength={ADDRESS_MAX_LENGTH}
              value={draft}
              error={draftError}
              onChange={(event) => setDraft(event.target.value)}
            />
            <SelectField
              label="Bán kính"
              options={RADIUS_SELECT_OPTIONS}
              value={String(radiusKm)}
              onChange={(event) => setRadius(Number(event.target.value))}
            />
            <Button type="submit" variant="accent" className={styles.searchButton}>
              <Search size={18} aria-hidden /> Tìm
            </Button>
          </form>

          {position.supported && (
            <div className={styles.locate}>
              <span className={styles.or}>hoặc</span>
              <Button
                variant="outline"
                onClick={() => {
                  setDraft('')
                  setDraftError(undefined)
                  position.locate()
                }}
                disabled={position.state.status === 'locating'}
              >
                <LocateFixed size={18} aria-hidden />
                {position.state.status === 'locating'
                  ? 'Đang xác định vị trí…'
                  : 'Dùng vị trí của tôi'}
              </Button>
            </div>
          )}
          {position.state.status === 'error' && (
            <Alert variant="warning" className={styles.locateError}>
              {position.state.message}
            </Alert>
          )}
        </search>

        <Alert variant="warning" title="Sự cố khẩn cấp">
          Có người bị thương, cháy nổ hoặc rò rỉ hoá chất lan rộng: gọi ngay <strong>114</strong>{' '}
          (cứu hoả, cứu nạn) hoặc <strong>115</strong> (cấp cứu) trước khi liên hệ đơn vị xử lý.
        </Alert>

        <div aria-live="polite">
          {!search ? (
            <EmptyState
              icon={MapPinned}
              title="Bạn đang ở đâu?"
              description="Kết quả gồm tên đơn vị, số điện thoại, khoảng cách và bản đồ chỉ đường."
            />
          ) : nearby.isPending ? (
            <p className={styles.loading} aria-busy>
              Đang tìm đơn vị xử lý gần đó…
            </p>
          ) : nearby.isError ? (
            <EmptyState
              icon={MapPinOff}
              tone="danger"
              title="Không tìm được đơn vị xử lý"
              description={nearbyErrorMessage(nearby.error)}
              action={
                <Button variant="outline" onClick={() => void nearby.refetch()}>
                  <RotateCw size={16} aria-hidden /> Thử lại
                </Button>
              }
            />
          ) : (
            <Results
              // Tìm chỗ khác thì bỏ đơn vị đang chọn.
              key={JSON.stringify(search)}
              data={nearby.data}
              onWiden={setRadius}
            />
          )}
        </div>
      </Container>
    </div>
  )
}

import { ChevronLeft, ChevronRight, CircleAlert, LoaderCircle } from 'lucide-react'
import { getDocument, PDFWorker, type PDFDocumentProxy } from 'pdfjs-dist/legacy/build/pdf.mjs'
// `?worker`: Vite đóng gói worker thành file `.js` (nginx trên VPS không biết MIME của `.mjs`, mà
// `nosniff` thì chặn worker sai MIME). oxlint không hiểu hậu tố này.
// oxlint-disable-next-line import/default
import PdfWorker from 'pdfjs-dist/legacy/build/pdf.worker.min.mjs?worker'
import { useEffect, useRef, useState } from 'react'

import { Button } from '@/components/common/button'

import styles from './pdf-viewer.module.css'

let sharedWorker: PDFWorker | undefined

/**
 * Một worker dùng chung cho mọi tài liệu, tạo khi mở tài liệu đầu tiên. Truyền vào `getDocument` thay vì
 * `GlobalWorkerOptions.workerPort`: huỷ tài liệu (đóng hộp thoại, React StrictMode chạy effect 2 lần) khi
 * đó không huỷ worker, tài liệu mở ngay sau vẫn dùng được.
 */
function pdfWorker(): PDFWorker {
  sharedWorker ??= PDFWorker.create({ port: new PdfWorker() })
  return sharedWorker
}

/** Trang không rộng hơn mức này cho dễ đọc trên màn hình lớn. */
const MAX_PAGE_WIDTH = 900

interface PdfViewerProps {
  /** URL đầy đủ của file PDF (cần cookie đăng nhập). */
  url: string
}

/**
 * Xem PDF ngay trong trang, mỗi lần một trang: nút Trang trước / Trang sau, phím ← →.
 * Bản legacy của pdf.js: chạy được cả trình duyệt cũ trên điện thoại của học viên.
 */
export function PdfViewer({ url }: PdfViewerProps) {
  const [pdf, setPdf] = useState<PDFDocumentProxy>()
  const [failed, setFailed] = useState(false)
  const [page, setPage] = useState(1)
  const [rendering, setRendering] = useState(false)
  const [width, setWidth] = useState(0)
  const stageRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    let cancelled = false
    let task: ReturnType<typeof getDocument> | undefined
    // Mở trong microtask: lỗi khi tạo worker cũng đi vào nhánh lỗi, không làm sập trang.
    Promise.resolve()
      .then(() => {
        task = getDocument({ url, withCredentials: true, worker: pdfWorker() })
        if (cancelled) void task.destroy()
        return task.promise
      })
      .then(
        (document) => !cancelled && setPdf(document),
        () => !cancelled && setFailed(true),
      )
    return () => {
      cancelled = true
      void task?.destroy()
    }
  }, [url])

  // Vẽ lại theo bề rộng khung (xoay điện thoại, đổi cỡ cửa sổ).
  useEffect(() => {
    const stage = stageRef.current
    if (!stage) return
    const update = () => setWidth(Math.min(stage.clientWidth, MAX_PAGE_WIDTH))
    update()
    if (typeof ResizeObserver === 'undefined') return
    const observer = new ResizeObserver(update)
    observer.observe(stage)
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!pdf || !canvas || width <= 0) return
    let cancelled = false
    let cancelRender = () => {}
    setRendering(true)
    pdf
      .getPage(page)
      .then((pdfPage) => {
        if (cancelled) return
        const scale = width / pdfPage.getViewport({ scale: 1 }).width
        const pixelRatio = window.devicePixelRatio || 1
        const viewport = pdfPage.getViewport({ scale: scale * pixelRatio })
        canvas.width = Math.floor(viewport.width)
        canvas.height = Math.floor(viewport.height)
        canvas.style.width = `${Math.floor(viewport.width / pixelRatio)}px`
        const task = pdfPage.render({ canvas, viewport })
        cancelRender = () => task.cancel()
        return task.promise
      })
      .then(
        () => !cancelled && setRendering(false),
        (error: unknown) => {
          // Đổi trang khi trang cũ đang vẽ: pdf.js huỷ lượt vẽ đó, không phải lỗi.
          if (cancelled || (error instanceof Error && error.name === 'RenderingCancelledException'))
            return
          setFailed(true)
        },
      )
    stageRef.current?.scrollTo?.({ top: 0 })
    return () => {
      cancelled = true
      cancelRender()
    }
  }, [pdf, page, width])

  const pageCount = pdf?.numPages ?? 0
  const goTo = (target: number) => setPage(Math.min(Math.max(target, 1), pageCount))

  useEffect(() => {
    if (pageCount === 0) return
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'ArrowLeft') setPage((current) => Math.max(current - 1, 1))
      if (event.key === 'ArrowRight') setPage((current) => Math.min(current + 1, pageCount))
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [pageCount])

  return (
    <div className={styles.viewer}>
      <div ref={stageRef} className={styles.stage}>
        {failed ? (
          <p className={styles.status} role="alert">
            <CircleAlert size={20} aria-hidden /> Không mở được tài liệu. Vui lòng tải về để xem.
          </p>
        ) : (
          !pdf && (
            <p className={styles.status} aria-busy>
              <LoaderCircle className={styles.spinner} size={20} aria-hidden /> Đang mở tài liệu…
            </p>
          )
        )}
        <canvas
          ref={canvasRef}
          className={styles.page}
          hidden={!pdf || failed}
          aria-label={`Trang ${page}`}
          aria-busy={rendering || undefined}
        />
      </div>

      {pageCount > 0 && !failed && (
        <nav className={styles.toolbar} aria-label="Lật trang tài liệu">
          <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => goTo(page - 1)}>
            <ChevronLeft size={18} aria-hidden /> Trang trước
          </Button>
          <p className={styles.pageInfo} aria-live="polite">
            Trang {page}/{pageCount}
          </p>
          <Button
            variant="outline"
            size="sm"
            disabled={page >= pageCount}
            onClick={() => goTo(page + 1)}
          >
            Trang sau <ChevronRight size={18} aria-hidden />
          </Button>
        </nav>
      )}
    </div>
  )
}

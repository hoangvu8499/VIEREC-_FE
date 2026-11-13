import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { getDocument } from 'pdfjs-dist/legacy/build/pdf.mjs'

import { PdfViewer } from '@/components/shared/pdf-viewer'

vi.mock('pdfjs-dist/legacy/build/pdf.mjs', () => ({
  PDFWorker: { create: vi.fn<() => object>(() => ({})) },
  getDocument: vi.fn<(...args: unknown[]) => unknown>(),
}))
// jsdom không có Worker.
vi.mock('pdfjs-dist/legacy/build/pdf.worker.min.mjs?worker', () => ({
  default: vi.fn<() => void>(),
}))

const URL = 'http://localhost/api/v1/files/1'

/** PDF giả có `numPages` trang; ghi lại các trang đã vẽ. */
function mockPdf(numPages: number) {
  const rendered: number[] = []
  const pdf = {
    numPages,
    getPage: (page: number) =>
      Promise.resolve({
        getViewport: ({ scale }: { scale: number }) => ({
          width: 600 * scale,
          height: 800 * scale,
        }),
        render: () => {
          rendered.push(page)
          return { promise: Promise.resolve(), cancel: () => {} }
        },
      }),
  }
  vi.mocked(getDocument).mockReturnValue({
    promise: Promise.resolve(pdf),
    destroy: () => Promise.resolve(),
  } as unknown as ReturnType<typeof getDocument>)
  return rendered
}

describe('PdfViewer', () => {
  beforeEach(() => {
    // jsdom không đo layout: cho khung rộng 600px để có bề rộng vẽ trang.
    vi.spyOn(HTMLElement.prototype, 'clientWidth', 'get').mockReturnValue(600)
  })

  afterEach(() => vi.restoreAllMocks())

  it('turns pages with the buttons and the arrow keys', async () => {
    const user = userEvent.setup()
    const rendered = mockPdf(3)
    render(<PdfViewer url={URL} />)

    expect(await screen.findByText('Trang 1/3')).toBeInTheDocument()
    expect(getDocument).toHaveBeenCalledWith(
      expect.objectContaining({ url: URL, withCredentials: true }),
    )
    const previous = screen.getByRole('button', { name: /Trang trước/ })
    const next = screen.getByRole('button', { name: /Trang sau/ })
    expect(previous).toBeDisabled()

    await user.click(next)
    expect(screen.getByText('Trang 2/3')).toBeInTheDocument()
    await user.keyboard('{ArrowRight}')
    expect(screen.getByText('Trang 3/3')).toBeInTheDocument()
    expect(next).toBeDisabled()
    await user.keyboard('{ArrowRight}')
    expect(screen.getByText('Trang 3/3')).toBeInTheDocument()

    await user.keyboard('{ArrowLeft}')
    await user.click(previous)
    expect(screen.getByText('Trang 1/3')).toBeInTheDocument()
    expect(rendered).toEqual(expect.arrayContaining([1, 2, 3]))
  })

  it('asks to download the file when it cannot be opened', async () => {
    vi.mocked(getDocument).mockReturnValue({
      promise: Promise.reject(new Error('broken')),
      destroy: () => Promise.resolve(),
    } as unknown as ReturnType<typeof getDocument>)
    render(<PdfViewer url={URL} />)

    expect(await screen.findByRole('alert')).toHaveTextContent('Vui lòng tải về để xem')
    expect(screen.queryByRole('navigation')).not.toBeInTheDocument()
  })
})

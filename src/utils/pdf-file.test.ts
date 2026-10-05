import { fileDownloadUrl, printPdf } from '@/utils/pdf-file'

describe('pdf-file', () => {
  afterEach(() => {
    vi.restoreAllMocks()
    document.querySelectorAll('iframe').forEach((frame) => frame.remove())
  })

  it('asks the server for an attachment', () => {
    expect(fileDownloadUrl('/api/v1/files/42')).toBe(
      `${window.location.origin}/api/v1/files/42?download=true`,
    )
  })

  it('prints the PDF from a hidden frame', async () => {
    const printing = printPdf('/api/v1/files/42')
    const frame = document.querySelector('iframe') as HTMLIFrameElement
    expect(frame.src).toBe(`${window.location.origin}/api/v1/files/42`)
    const print = vi.spyOn(frame.contentWindow as Window, 'print').mockImplementation(() => {})

    frame.dispatchEvent(new Event('load'))
    await printing
    expect(print).toHaveBeenCalled()
  })

  it('opens the PDF in a new tab when the frame cannot be printed', async () => {
    const open = vi.spyOn(window, 'open').mockReturnValue(null)
    const printing = printPdf('/api/v1/files/42')
    const frame = document.querySelector('iframe') as HTMLIFrameElement
    vi.spyOn(frame.contentWindow as Window, 'print').mockImplementation(() => {
      throw new DOMException('Blocked a frame with origin', 'SecurityError')
    })

    frame.dispatchEvent(new Event('load'))
    await printing
    expect(open).toHaveBeenCalledWith(
      `${window.location.origin}/api/v1/files/42`,
      '_blank',
      'noopener',
    )
  })
})

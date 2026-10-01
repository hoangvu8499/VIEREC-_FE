import { formatFileSize } from '@/utils/format-file-size'

describe('formatFileSize', () => {
  it.each([
    [0, '0 B'],
    [512, '512 B'],
    [1536, '1,5 KB'],
    [50 * 1024 * 1024, '50 MB'],
    [500 * 1024 * 1024, '500 MB'],
    [3 * 1024 ** 3, '3 GB'],
  ])('%i bytes → %s', (bytes, expected) => {
    expect(formatFileSize(bytes)).toBe(expected)
  })
})

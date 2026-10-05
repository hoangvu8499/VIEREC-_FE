import { useSearchParams } from 'react-router'

/** Tìm kiếm và trang của một danh sách trên URL: `?q=...&trang=2` (trang tính từ 1). */
export function useListParams() {
  const [searchParams, setSearchParams] = useSearchParams()
  const keyword = searchParams.get('q') ?? undefined
  const page = Math.max(0, Number(searchParams.get('trang') ?? 1) - 1) || 0
  const update = (next: { keyword?: string; page: number }) => {
    const params = new URLSearchParams()
    if (next.keyword) params.set('q', next.keyword)
    if (next.page > 0) params.set('trang', String(next.page + 1))
    setSearchParams(params)
  }
  return { keyword, page, update }
}

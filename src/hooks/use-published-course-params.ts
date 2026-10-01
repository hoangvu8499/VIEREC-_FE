import { useSearchParams } from 'react-router'

/** Tham số trên URL (`?q=pccc&trang=2`), trang đếm từ 1. */
const PARAM = { PAGE: 'trang', KEYWORD: 'q' } as const

export function usePublishedCourseParams() {
  const [searchParams, setSearchParams] = useSearchParams()
  const pageParam = Number(searchParams.get(PARAM.PAGE))
  const page = Number.isInteger(pageParam) && pageParam > 1 ? pageParam - 1 : 0
  const keyword = searchParams.get(PARAM.KEYWORD)?.trim() || undefined

  const update = (next: { page?: number; keyword?: string }) => {
    const search = new URLSearchParams()
    const nextKeyword = 'keyword' in next ? next.keyword : keyword
    const nextPage = next.page ?? 0
    if (nextKeyword) search.set(PARAM.KEYWORD, nextKeyword)
    if (nextPage) search.set(PARAM.PAGE, String(nextPage + 1))
    setSearchParams(search)
  }

  return {
    page,
    keyword,
    setPage: (nextPage: number) => update({ page: nextPage }),
    /** Đổi từ khoá thì về trang đầu. */
    setKeyword: (nextKeyword: string | undefined) => update({ keyword: nextKeyword }),
  }
}

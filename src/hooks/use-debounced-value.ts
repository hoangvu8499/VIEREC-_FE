import { useEffect, useState } from 'react'

/** Giá trị chỉ cập nhật sau khi `value` đứng yên `delay` ms (vd. ô tìm kiếm gọi API). */
export function useDebouncedValue<T>(value: T, delay = 300): T {
  const [debounced, setDebounced] = useState(value)

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay)
    return () => clearTimeout(timer)
  }, [value, delay])

  return debounced
}

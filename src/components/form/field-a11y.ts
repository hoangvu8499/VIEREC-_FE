/** Thuộc tính a11y cho input nằm trong `FormField` (khớp id của hint/error mà FormField render). */
export function fieldA11y(id: string, { error, hint }: { error?: string; hint?: string }) {
  const describedBy = error ? `${id}-error` : hint ? `${id}-hint` : undefined

  return {
    'aria-invalid': error ? true : undefined,
    'aria-describedby': describedBy,
  } as const
}

export const archive_page_size = 4

export interface Page<T> {
  entries: T[]
  page: number
  page_count: number
  total: number
}

export function page_number(value: string | undefined) {
  if (value === undefined) return 1
  if (!/^[1-9]\d*$/.test(value)) return undefined
  return Number(value)
}

export function paginate<T>(
  entries: T[],
  page: number,
): Page<T> | undefined {
  const page_count = Math.max(
    1,
    Math.ceil(entries.length / archive_page_size),
  )
  if (page < 1 || page > page_count) return undefined

  const start = (page - 1) * archive_page_size
  return {
    entries: entries.slice(start, start + archive_page_size),
    page,
    page_count,
    total: entries.length,
  }
}

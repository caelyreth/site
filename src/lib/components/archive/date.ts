const formatters = {
  long: new Intl.DateTimeFormat('zh-CN', {
    day: 'numeric',
    month: 'long',
    timeZone: 'UTC',
    year: 'numeric',
  }),
  short: new Intl.DateTimeFormat('zh-CN', {
    day: 'numeric',
    month: 'short',
    timeZone: 'UTC',
    year: 'numeric',
  }),
}

export function format_published_date(
  value: string,
  format: keyof typeof formatters = 'short',
) {
  return formatters[format].format(new Date(`${value}T00:00:00Z`))
}

const xml_entities: Record<string, string> = {
  '&': '&amp;',
  "'": '&apos;',
  '"': '&quot;',
  '<': '&lt;',
  '>': '&gt;',
}

export function escape_xml(value: string) {
  return value.replace(/[&<>"']/g, (character) => xml_entities[character])
}

export function feed_iso_date(date: string) {
  return `${date}T00:00:00.000Z`
}

export function feed_rfc822_date(date: string) {
  return new Date(feed_iso_date(date)).toUTCString()
}

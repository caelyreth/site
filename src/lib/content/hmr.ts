export const content_update_event = 'site:content-update'

export interface ContentUpdate {
  content_id: string
}

export function content_dependency(content_id: string) {
  return `content:${content_id}`
}

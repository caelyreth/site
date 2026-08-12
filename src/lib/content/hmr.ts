export const content_update_event = 'site:content-update'

export type ContentUpdate = Readonly<{
  content_id: string
}>

export function content_dependency(content_id: string) {
  return `content:${content_id}`
}

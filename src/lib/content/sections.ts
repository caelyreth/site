export const content_sections = ['articles', 'essays', 'maps'] as const

export type ContentSection = (typeof content_sections)[number]

const content_section_labels: Record<ContentSection, string> = {
  articles: 'Articles',
  essays: 'Essays',
  maps: 'Maps',
}

export function content_section_label(section: ContentSection) {
  return content_section_labels[section]
}

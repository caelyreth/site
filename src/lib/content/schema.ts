import type { MarkdownDocument } from 'comark'
import * as v from 'valibot'

export const content_fonts = ['sans', 'serif'] as const

const content_font_schema = v.optional(v.picklist(content_fonts), 'sans')

export const content_key_pattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/

const document_fields = {
  description: v.optional(v.string()),
  font: content_font_schema,
  title: v.string(),
}

const navigation_item_schema = v.strictObject({
  href: v.string(),
  label: v.string(),
})

const menu_item_schema = v.strictObject({
  code: v.string(),
  detail: v.string(),
  href: v.optional(v.string()),
  note: v.string(),
  title: v.string(),
})

const social_link_schema = v.strictObject({
  aria_label: v.string(),
  external: v.boolean(),
  href: v.string(),
  icon: v.string(),
  label: v.string(),
})

const observatory_schema = v.strictObject({
  about_label: v.string(),
  cabin_label: v.string(),
  entry_label: v.string(),
  social_label: v.string(),
  social_links: v.array(social_link_schema),
  surface_label: v.string(),
  vfd_readout: v.string(),
  vfd_refresh_readouts: v.pipe(v.array(v.string()), v.minLength(1)),
  vfd_title: v.string(),
})

const comments_schema = v.strictObject({
  category: v.string(),
  category_id: v.string(),
  description: v.string(),
  emit_metadata: v.picklist(['0', '1']),
  input_position: v.picklist(['top', 'bottom']),
  language: v.string(),
  mapping: v.picklist([
    'url',
    'title',
    'og:title',
    'specific',
    'number',
    'pathname',
  ]),
  reactions_enabled: v.picklist(['0', '1']),
  repo: v.string(),
  repo_id: v.string(),
  strict: v.picklist(['0', '1']),
  title: v.string(),
})

const indexed_document_fields = {
  ...document_fields,
  summary: v.string(),
}

const index_document_fields = {
  ...document_fields,
  description: v.string(),
  kind: v.string(),
}

export const home_frontmatter_schema = v.strictObject({
  ...document_fields,
  observatory: observatory_schema,
})

export const page_frontmatter_schema = v.strictObject(document_fields)

const friend_schema = v.strictObject({
  avatar_url: v.string(),
  description: v.string(),
  link: v.string(),
  name: v.string(),
})

export const friends_frontmatter_schema = v.strictObject({
  ...document_fields,
  friends: v.array(friend_schema),
})

export const entry_index_frontmatter_schema = v.strictObject({
  ...index_document_fields,
  back_label: v.string(),
  meta_label: v.string(),
})

export const constellation_index_frontmatter_schema = v.strictObject({
  ...index_document_fields,
  back_label: v.string(),
  detail_label: v.string(),
  entry_count_label: v.string(),
  entries_label: v.string(),
  entries_navigation_label: v.string(),
  related_label: v.string(),
  related_navigation_label: v.string(),
})

export const site_config_schema = v.strictObject({
  comments: comments_schema,
  description: v.string(),
  footer: v.strictObject({
    archive_detail: v.string(),
    archive_label: v.string(),
    copyright: v.string(),
    index_label: v.string(),
    icp_href: v.string(),
    icp_label: v.string(),
    label: v.string(),
    license_href: v.string(),
    license_label: v.string(),
    navigation: v.array(navigation_item_schema),
    qr_label: v.string(),
    atom_href: v.string(),
    atom_label: v.string(),
    rss_href: v.string(),
    rss_label: v.string(),
    sitemap_href: v.string(),
    sitemap_label: v.string(),
    signal: v.strictObject({
      label: v.string(),
      pause_label: v.string(),
      resume_label: v.string(),
      status: v.string(),
    }),
    signature: v.string(),
    statement: v.string(),
    title: v.string(),
  }),
  menu: v.strictObject({
    entries: v.pipe(v.array(menu_item_schema), v.length(7)),
    field_note: v.string(),
    ornaments: v.pipe(v.array(v.string()), v.length(16)),
  }),
  pagination: v.strictObject({
    label: v.string(),
    navigation_label: v.string(),
    next_aria_label: v.string(),
    next_label: v.string(),
    previous_aria_label: v.string(),
    previous_label: v.string(),
  }),
  seo: v.strictObject({
    locale: v.string(),
    page_description: v.string(),
    title_separator: v.string(),
  }),
  theme: v.strictObject({
    label: v.string(),
  }),
  title: v.string(),
})

export const entry_frontmatter_schema = v.strictObject({
  ...indexed_document_fields,
  published: v.pipe(v.string(), v.isoDate()),
  updated: v.optional(v.pipe(v.string(), v.isoDate())),
})

export const constellation_frontmatter_schema = v.strictObject(
  indexed_document_fields,
)

export type ContentFont = v.InferOutput<typeof content_font_schema>
export type HomeFrontmatter = v.InferOutput<typeof home_frontmatter_schema>
export type PageFrontmatter = v.InferOutput<typeof page_frontmatter_schema>
export type Friend = v.InferOutput<typeof friend_schema>
export type FriendsFrontmatter = v.InferOutput<
  typeof friends_frontmatter_schema
>
export type EntryIndexFrontmatter = v.InferOutput<
  typeof entry_index_frontmatter_schema
>
export type ConstellationIndexFrontmatter = v.InferOutput<
  typeof constellation_index_frontmatter_schema
>
export type SiteConfig = v.InferOutput<typeof site_config_schema>
export type EntryFrontmatter = v.InferOutput<
  typeof entry_frontmatter_schema
>
export type ConstellationFrontmatter = v.InferOutput<
  typeof constellation_frontmatter_schema
>

export type HomeDocument = MarkdownDocument<
  Record<string, unknown>,
  HomeFrontmatter
>

export type PageDocument = MarkdownDocument<
  Record<string, unknown>,
  PageFrontmatter
>

export type FriendsDocument = MarkdownDocument<
  Record<string, unknown>,
  FriendsFrontmatter
>

export type EntryIndexDocument = MarkdownDocument<
  Record<string, unknown>,
  EntryIndexFrontmatter
>

export type ConstellationIndexDocument = MarkdownDocument<
  Record<string, unknown>,
  ConstellationIndexFrontmatter
>

export type EntryDocument = MarkdownDocument<
  Record<string, unknown>,
  EntryFrontmatter
>

export type ConstellationDocument = MarkdownDocument<
  Record<string, unknown>,
  ConstellationFrontmatter
>

export interface ContentEntry<Frontmatter> {
  frontmatter: Frontmatter
  id: string
  path: string
}

export interface ContentDocument<Frontmatter> {
  document: MarkdownDocument<Record<string, unknown>, Frontmatter>
  id: string
  path: string
}

export interface ContentPage<T> {
  entries: T[]
  page: number
  page_count: number
  total: number
}

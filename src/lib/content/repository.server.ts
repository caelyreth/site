/* oxlint-disable typescript/prefer-readonly-parameter-types -- Content IDs are primitive route parameters. */
import { select_presentation } from '$lib/presentation/registry.server'

import { parse_content } from './parse.server'
import type { ContentDocument, ContentPage } from './types'

const content_sources = import.meta.glob('../../../content/**/*.md', {
  eager: true,
  import: 'default',
  query: '?raw',
}) as Record<string, string>

const document_cache = new Map<string, Promise<ContentDocument>>()
const page_cache = new Map<string, Promise<ContentPage>>()
const content_id_pattern = /^[a-z0-9]+(?:[/-][a-z0-9]+)*$/

function source_path_for(content_id: string) {
  if (!content_id_pattern.test(content_id)) {
    throw new Error(`Invalid content id "${content_id}".`)
  }
  return `../../../content/${content_id}.md`
}

export function content_ids() {
  return Object.keys(content_sources)
    .map((path) =>
      path.replace('../../../content/', '').replace(/\.md$/, ''),
    )
    .sort()
}

export function has_content(content_id: string) {
  return (
    content_id_pattern.test(content_id) &&
    `../../../content/${content_id}.md` in content_sources
  )
}

export function load_content(content_id: string): Promise<ContentDocument> {
  const source_path = source_path_for(content_id)
  const source = content_sources[source_path]
  if (source === undefined) {
    throw new Error(
      `Unknown content document "${content_id}". Available documents: ${content_ids().join(', ') || 'none'}.`,
    )
  }

  let document = document_cache.get(content_id)
  if (!document) {
    document = parse_content(source, `content/${content_id}.md`)
    document_cache.set(content_id, document)
  }
  return document
}

export function load_content_page(
  content_id: string,
): Promise<ContentPage> {
  let page = page_cache.get(content_id)
  if (!page) {
    page = load_content(content_id).then((document) => ({
      document,
      presentation: select_presentation(document.frontmatter),
    }))
    page_cache.set(content_id, page)
  }
  return page
}

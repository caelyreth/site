import * as v from 'valibot'

import { parse_markdown } from './parse.server'
import type { ContentDocument, ContentEntry, ContentPage } from './schema'
import { content_key_pattern } from './schema'

type Source = () => Promise<string>

const content_root = '../../../content/'
const sources = import.meta.glob<string>('../../../content/**/*.md', {
  import: 'default',
  query: '?raw',
})

function validate_frontmatter<Frontmatter extends Record<string, unknown>>(
  value: unknown,
  path: string,
  schema: v.GenericSchema<unknown, Frontmatter>,
) {
  const result = v.safeParse(schema, value)
  if (result.success) return result.output
  throw new Error(`${path}: ${v.summarize(result.issues)}`)
}

function validate_content_id(id: string) {
  const segments = id.split('/')
  if (
    !segments.length ||
    segments.some((segment) => !content_key_pattern.test(segment))
  ) {
    throw new Error(`Invalid content id "${id}".`)
  }
}

function content_path(id: string) {
  validate_content_id(id)
  return `${content_root}${id}.md`
}

function collection_ids(collection: string) {
  const prefix = `${content_root}${collection}/`
  return Object.keys(sources)
    .flatMap((path) => {
      if (!path.startsWith(prefix)) return []
      const id = path.slice(prefix.length, -'.md'.length)
      if (!content_key_pattern.test(id)) {
        throw new Error(`Invalid content id "${id}" in "${path}".`)
      }
      return [id]
    })
    .sort()
}

async function parse_content<Frontmatter extends Record<string, unknown>>(
  source: Source,
  path: string,
  schema: v.GenericSchema<unknown, Frontmatter>,
) {
  const document = await parse_markdown(await source())
  return {
    ...document,
    frontmatter: validate_frontmatter(document.frontmatter, path, schema),
  }
}

export async function read_content<
  Frontmatter extends Record<string, unknown>,
>(
  id: string,
  schema: v.GenericSchema<unknown, Frontmatter>,
): Promise<ContentDocument<Frontmatter> | undefined> {
  const path = content_path(id)
  const source: Source | undefined = sources[path]
  if (!source) return undefined

  const display_path = `content/${id}.md`
  return {
    document: await parse_content(source, display_path, schema),
    id,
    path: display_path,
  }
}

export function content_query<Frontmatter extends Record<string, unknown>>(
  collection: string,
  schema: v.GenericSchema<unknown, Frontmatter>,
) {
  if (!content_key_pattern.test(collection)) {
    throw new Error(`Invalid content collection "${collection}".`)
  }

  function keys() {
    return collection_ids(collection)
  }

  async function document(
    id: string,
  ): Promise<ContentDocument<Frontmatter> | undefined> {
    if (!content_key_pattern.test(id)) {
      throw new Error(`Invalid content id "${id}".`)
    }

    const found = await read_content(`${collection}/${id}`, schema)
    if (!found) return undefined
    return {
      document: found.document,
      id,
      path: found.path,
    }
  }

  async function entry(
    id: string,
  ): Promise<ContentEntry<Frontmatter> | undefined> {
    const found = await document(id)
    if (!found) return undefined
    return {
      frontmatter: found.document.frontmatter,
      id,
      path: found.path,
    }
  }

  async function entries() {
    const found = await Promise.all(keys().map(entry))
    return found.filter(
      (entry): entry is ContentEntry<Frontmatter> => entry !== undefined,
    )
  }

  return { document, entries, entry, keys }
}

export const page_size = 7

export function page_number(value: string | undefined) {
  if (value === undefined) return 1
  if (!/^[1-9]\d*$/.test(value)) return undefined
  return Number(value)
}

export function page_count(total: number) {
  return Math.max(1, Math.ceil(total / page_size))
}

export function paginate<T>(
  entries: T[],
  page: number,
): ContentPage<T> | undefined {
  const total_pages = page_count(entries.length)
  if (page < 1 || page > total_pages) return undefined

  const start = (page - 1) * page_size
  return {
    entries: entries.slice(start, start + page_size),
    page,
    page_count: total_pages,
    total: entries.length,
  }
}

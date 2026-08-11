/* oxlint-disable typescript/prefer-readonly-parameter-types -- Frontmatter validation reads parser-owned records. */
import { parseMarkdown } from 'comark'

import {
  page_frontmatter_fields,
  type ContentDocument,
  type ContentOptions,
} from './types'

const key_pattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/

function is_record(value: unknown): value is Record<string, unknown> {
  return (
    typeof value === 'object' && value !== null && !Array.isArray(value)
  )
}

function optional_key(
  value: unknown,
  field: 'graphics' | 'footer',
  source_path: string,
) {
  if (value === undefined) return undefined
  if (typeof value === 'string' && key_pattern.test(value)) return value
  throw new Error(
    `${source_path}: frontmatter.${field} must be lowercase kebab-case.`,
  )
}

function optional_options(
  value: unknown,
  field: 'graphics_options' | 'footer_options',
  source_path: string,
): ContentOptions | undefined {
  if (value === undefined) return undefined
  if (is_record(value)) return value
  throw new Error(
    `${source_path}: frontmatter.${field} must be a YAML object.`,
  )
}

function required_title(frontmatter: unknown, source_path: string) {
  if (is_record(frontmatter) && typeof frontmatter.title === 'string') {
    return frontmatter.title
  }
  throw new Error(`${source_path}: frontmatter.title must be a string.`)
}

function reject_unknown_fields(
  frontmatter: Readonly<Record<string, unknown>>,
  source_path: string,
) {
  const known_fields = new Set<string>(page_frontmatter_fields)
  const unknown_fields = Object.keys(frontmatter).filter(
    (field) => !known_fields.has(field),
  )
  if (unknown_fields.length === 0) return

  throw new Error(
    `${source_path}: unknown frontmatter field${unknown_fields.length === 1 ? '' : 's'} ${unknown_fields.map((field) => `"${field}"`).join(', ')}.`,
  )
}

function optional_description(
  frontmatter: Readonly<Record<string, unknown>>,
  source_path: string,
) {
  const { description } = frontmatter
  if (description === undefined || typeof description === 'string') {
    return description
  }
  throw new Error(
    `${source_path}: frontmatter.description must be a string.`,
  )
}

function validated_frontmatter(frontmatter: unknown, source_path: string) {
  const title = required_title(frontmatter, source_path)
  const record = frontmatter as Record<string, unknown>
  reject_unknown_fields(record, source_path)
  return {
    description: optional_description(record, source_path),
    footer: optional_key(record.footer, 'footer', source_path),
    footer_options: optional_options(
      record.footer_options,
      'footer_options',
      source_path,
    ),
    graphics: optional_key(record.graphics, 'graphics', source_path),
    graphics_options: optional_options(
      record.graphics_options,
      'graphics_options',
      source_path,
    ),
    title,
  }
}

export async function parse_content(
  source: string,
  source_path: string,
): Promise<ContentDocument> {
  const document = await parseMarkdown(source)

  return {
    ...document,
    frontmatter: validated_frontmatter(document.frontmatter, source_path),
  }
}

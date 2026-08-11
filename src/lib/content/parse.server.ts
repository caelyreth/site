/* oxlint-disable typescript/prefer-readonly-parameter-types -- Zod schemas and Comark nodes are used read-only, but their library types are mutable. */
import { parseMarkdown, type Node } from 'comark'
import { z } from 'zod'

import type { ContentDocument } from './schema'

const content_sources = import.meta.glob('../../../content/**/*.md', {
  import: 'default',
  query: '?raw',
}) as Record<string, () => Promise<string>>

const block_schemas = import.meta.glob('./blocks/*.schema.ts', {
  eager: true,
  import: 'default',
}) as Record<string, z.ZodType>

async function source_for(content_id: string) {
  const source_path = `content/${content_id}.md`
  const load_source = content_sources[`../../../${source_path}`]
  if (load_source === undefined) {
    throw new Error(`Unknown content document "${source_path}".`)
  }

  return { source: await load_source(), source_path }
}

function validate_attributes(
  tag: unknown,
  attributes: unknown,
  source_path: string,
) {
  if (typeof tag !== 'string') return
  const schema = block_schemas[`./blocks/${tag}.schema.ts`]
  if (!schema) return

  const result = schema.safeParse(attributes)
  if (!result.success) {
    throw new Error(
      `${source_path}: invalid ${tag} props: ${z.prettifyError(result.error)}`,
    )
  }
}

function validate_node(node: Node, source_path: string) {
  if (typeof node === 'string' || !Array.isArray(node)) return
  const [tag, attributes = {}, ...children] = node
  validate_attributes(tag, attributes, source_path)
  for (const child of children) validate_node(child, source_path)
}

function validate_blocks(nodes: readonly Node[], source_path: string) {
  for (const node of nodes) validate_node(node, source_path)
}

function parse_frontmatter<Frontmatter extends Record<string, unknown>>(
  value: unknown,
  source_path: string,
  schema: Readonly<z.ZodType<Frontmatter>>,
) {
  const result = schema.safeParse(value)
  if (result.success) return result.data
  throw new Error(`${source_path}: ${z.prettifyError(result.error)}`)
}

export async function parse_content<
  Frontmatter extends Record<string, unknown>,
>(
  content_id: string,
  frontmatter_schema: Readonly<z.ZodType<Frontmatter>>,
): Promise<ContentDocument<Frontmatter>> {
  const { source, source_path } = await source_for(content_id)
  const document = await parseMarkdown(source)
  validate_blocks(document.nodes, source_path)

  return {
    ...document,
    frontmatter: parse_frontmatter(
      document.frontmatter,
      source_path,
      frontmatter_schema,
    ),
  }
}

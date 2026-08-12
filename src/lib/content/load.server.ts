import { createMarkdownParser, type Node } from 'comark'
import * as v from 'valibot'

import type { ContentDocument } from './schema'

const content_sources = import.meta.glob('../../../content/**/*.md', {
  import: 'default',
  query: '?raw',
}) as Record<string, () => Promise<string>>

const component_schemas = import.meta.glob('./components/*.schema.ts', {
  eager: true,
  import: 'default',
}) as Record<string, v.GenericSchema>

const parse_markdown = createMarkdownParser()

function source_for(content_id: string) {
  const source_path = `content/${content_id}.md`
  const load_source = content_sources[`../../../${source_path}`]
  if (!load_source) {
    throw new Error(`Unknown content document "${source_path}".`)
  }

  return { source_path, load_source }
}

function validate_attributes(
  tag: string,
  attributes: Record<string, unknown>,
  source_path: string,
) {
  const schema = component_schemas[`./components/${tag}.schema.ts`]
  if (!schema) return

  const result = v.safeParse(schema, attributes)
  if (!result.success) {
    throw new Error(
      `${source_path}: invalid ${tag} props: ${v.summarize(result.issues)}`,
    )
  }
}

function validate_node(node: Node, source_path: string) {
  if (typeof node === 'string' || node[0] === null) return

  const [tag, attributes, ...children] = node
  validate_attributes(tag, attributes, source_path)
  for (const child of children) validate_node(child, source_path)
}

function validate_components(nodes: readonly Node[], source_path: string) {
  for (const node of nodes) validate_node(node, source_path)
}

function parse_frontmatter<Frontmatter extends Record<string, unknown>>(
  value: unknown,
  source_path: string,
  schema: v.GenericSchema<unknown, Frontmatter>,
) {
  const result = v.safeParse(schema, value)
  if (result.success) return result.output
  throw new Error(`${source_path}: ${v.summarize(result.issues)}`)
}

export async function load_content<
  Frontmatter extends Record<string, unknown>,
>(
  content_id: string,
  frontmatter_schema: v.GenericSchema<unknown, Frontmatter>,
): Promise<ContentDocument<Frontmatter>> {
  const { source_path, load_source } = source_for(content_id)
  const document = await parse_markdown(await load_source())
  validate_components(document.nodes, source_path)

  return {
    ...document,
    frontmatter: parse_frontmatter(
      document.frontmatter,
      source_path,
      frontmatter_schema,
    ),
  }
}

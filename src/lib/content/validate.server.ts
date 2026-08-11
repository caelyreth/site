import type { Node } from 'comark'
import { z } from 'zod'

/* oxlint-disable typescript/prefer-readonly-parameter-types -- Parsed AST nodes are immutable by convention. */

const schemas = import.meta.glob('./blocks/*.schema.ts', {
  eager: true,
  import: 'default',
}) as Record<string, z.ZodType>

function schema_for(tag: string) {
  return schemas[`./blocks/${tag}.schema.ts`]
}

function validate_attributes(
  tag: unknown,
  attributes: unknown,
  source_path: string,
) {
  if (typeof tag !== 'string') return
  const schema = schema_for(tag)
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

export function validate_content_components(
  nodes: readonly Node[],
  source_path: string,
) {
  for (const node of nodes) validate_node(node, source_path)
}

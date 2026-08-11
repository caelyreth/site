import { describe, expect, it } from 'vitest'

import { parse_content } from './parse.server'
import { home_frontmatter_schema } from './schema'

function attributes_for(
  nodes: readonly unknown[],
  tag: string,
): readonly Readonly<Record<string, unknown>>[] {
  return nodes.flatMap((node) => {
    if (!Array.isArray(node)) return []
    const attributes: Readonly<Record<string, unknown>> =
      typeof node[1] === 'object' && node[1] !== null
        ? (node[1] as Record<string, unknown>)
        : {}
    const children = node.slice(2)
    return [
      ...(node[0] === tag ? [attributes] : []),
      ...attributes_for(children, tag),
    ]
  })
}

describe('parse_content', () => {
  it('loads content documents by ID', async () => {
    const document = await parse_content('home', home_frontmatter_schema)

    expect(document.frontmatter.title).toBe('Caelyreth')
  })

  it('preserves default alert types on blockquotes', async () => {
    const document = await parse_content('home', home_frontmatter_schema)

    expect(
      attributes_for(document.nodes, 'blockquote').map(({ as }) => as),
    ).toEqual(
      expect.arrayContaining([
        'note',
        'tip',
        'important',
        'warning',
        'caution',
      ]),
    )
  })

  it('reports the resolved content path for unknown IDs', async () => {
    await expect(
      parse_content('missing', home_frontmatter_schema),
    ).rejects.toThrow('Unknown content document "content/missing.md".')
  })
})

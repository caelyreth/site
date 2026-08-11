import { describe, expect, it } from 'vitest'

import { parse_content } from './parse.server'
import { home_frontmatter_schema } from './schema'

function tags_in(nodes: readonly unknown[]): string[] {
  return nodes.flatMap((node) => {
    if (!Array.isArray(node) || typeof node[0] !== 'string') return []
    return [node[0], ...tags_in(node.slice(2))]
  })
}

describe('parse_content', () => {
  it('loads content documents by ID', async () => {
    const document = await parse_content('home', home_frontmatter_schema)

    expect(document.frontmatter.title).toBe('Caelyreth')
  })

  it('promotes default alerts to their renderer tags', async () => {
    const document = await parse_content('home', home_frontmatter_schema)

    expect(tags_in(document.nodes)).toEqual(
      expect.arrayContaining([
        'alert-note',
        'alert-tip',
        'alert-important',
        'alert-warning',
        'alert-caution',
      ]),
    )
  })

  it('reports the resolved content path for unknown IDs', async () => {
    await expect(
      parse_content('missing', home_frontmatter_schema),
    ).rejects.toThrow('Unknown content document "content/missing.md".')
  })
})

import { describe, expect, it } from 'vitest'

import { parse_content } from './parse.server'
import { home_frontmatter_schema } from './schema'

describe('parse_content', () => {
  it('loads content documents by ID', async () => {
    const document = await parse_content('home', home_frontmatter_schema)

    expect(document.frontmatter.title).toBe('Caelyreth')
  })

  it('reports the resolved content path for unknown IDs', async () => {
    await expect(
      parse_content('missing', home_frontmatter_schema),
    ).rejects.toThrow('Unknown content document "content/missing.md".')
  })
})

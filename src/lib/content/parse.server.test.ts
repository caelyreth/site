import { describe, expect, it } from 'vitest'

import { parse_content } from './parse.server'

describe('parse_content', () => {
  it('rejects unknown frontmatter fields', async () => {
    await expect(
      parse_content(
        '---\ntitle: Test\nunknown: value\n---',
        'content/test.md',
      ),
    ).rejects.toThrow('Unrecognized key')
  })

  it('validates discovered Comark component props', async () => {
    await expect(
      parse_content(
        [
          '---',
          'title: Test',
          '---',
          '',
          '::station-directory',
          '',
          '```yaml [props]',
          'entries:',
          '  - title: Missing detail',
          '```',
          '',
          '::',
        ].join('\n'),
        'content/test.md',
      ),
    ).rejects.toThrow('invalid station-directory props')
  })
})

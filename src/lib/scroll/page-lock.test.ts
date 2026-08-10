/* oxlint-disable typescript/prefer-readonly-parameter-types -- test double implements DOMTokenList methods. */
import { describe, expect, it } from 'vitest'

import { lock_page_scroll } from './page-lock'

function create_root() {
  const classes = new Set<string>()
  return {
    classList: {
      add(...class_names: string[]) {
        for (const class_name of class_names) classes.add(class_name)
      },
      remove(...class_names: string[]) {
        for (const class_name of class_names) classes.delete(class_name)
      },
    },
    classes,
    clientWidth: 980,
    style: { paddingRight: '4px' },
  }
}

describe('page scroll lock', () => {
  it('preserves scrollbar space until every lock is released', () => {
    const root = create_root()
    const viewport = { innerWidth: 1000 }
    const first_release = lock_page_scroll(root, viewport)
    const second_release = lock_page_scroll(root, viewport)

    expect(root.classes).toContain('page-scroll-locked')
    expect(root.style.paddingRight).toBe('20px')

    first_release()
    expect(root.classes).toContain('page-scroll-locked')

    second_release()
    expect(root.classes).not.toContain('page-scroll-locked')
    expect(root.style.paddingRight).toBe('4px')
  })
})

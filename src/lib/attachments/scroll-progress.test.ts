/* oxlint-disable typescript/prefer-readonly-parameter-types -- test doubles implement DOM callback signatures. */
import { afterEach, describe, expect, it, vi } from 'vitest'

import { scroll_progress } from './scroll-progress'

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('scroll progress attachment', () => {
  it('updates through one scheduled fallback frame and cleans up listeners', () => {
    let scheduled_frame: FrameRequestCallback | undefined
    let scroll_listener: EventListener | undefined
    const remove_listener = vi.fn()
    const on_progress = vi.fn()
    const element = {} as HTMLElement

    vi.stubGlobal('CSS', { supports: () => false })
    vi.stubGlobal('ResizeObserver', undefined)
    vi.stubGlobal(
      'requestAnimationFrame',
      (callback: FrameRequestCallback) => {
        scheduled_frame = callback
        return 1
      },
    )
    vi.stubGlobal('cancelAnimationFrame', vi.fn())
    vi.stubGlobal('window', {
      addEventListener(
        type: string,
        listener: EventListenerOrEventListenerObject,
      ) {
        if (type === 'scroll' && typeof listener === 'function') {
          scroll_listener = listener
        }
      },
      removeEventListener: remove_listener,
    })

    const detach = scroll_progress({
      fallback_only: true,
      get_progress: () => 1.4,
      on_progress,
    })(element)

    expect(on_progress).toHaveBeenLastCalledWith(1)

    scroll_listener?.(new Event('scroll'))
    scheduled_frame?.(0)
    expect(on_progress).toHaveBeenCalledTimes(2)

    detach?.()
    expect(remove_listener).toHaveBeenCalledWith(
      'scroll',
      expect.anything(),
    )
  })
})

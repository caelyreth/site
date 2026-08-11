/* oxlint-disable typescript/prefer-readonly-parameter-types -- test doubles implement DOM callback signatures. */
import { describe, expect, it } from 'vitest'

import {
  create_reduced_motion_preference,
  type ReducedMotionMediaQuery,
} from './reduced-motion'

class TestMediaQuery implements ReducedMotionMediaQuery {
  matches = false
  #listeners = new Set<EventListenerOrEventListenerObject>()

  addEventListener(
    _type: string,
    listener: EventListenerOrEventListenerObject | null,
  ) {
    if (listener) this.#listeners.add(listener)
  }

  removeEventListener(
    _type: string,
    listener: EventListenerOrEventListenerObject | null,
  ) {
    if (listener) this.#listeners.delete(listener)
  }

  set_matches(matches: boolean) {
    this.matches = matches
    for (const listener of this.#listeners) {
      if (typeof listener === 'function') {
        listener(new Event('change'))
      } else {
        listener.handleEvent(new Event('change'))
      }
    }
  }
}

describe('reduced motion preference', () => {
  it('reports and subscribes to preference changes from one media query', () => {
    const media_query = new TestMediaQuery()
    const preference = create_reduced_motion_preference(media_query)
    const values: boolean[] = []

    const unsubscribe = preference.subscribe((matches) => {
      values.push(matches)
    })
    media_query.set_matches(true)

    expect(preference.current).toBe(true)
    expect(values).toEqual([false, true])

    unsubscribe()
    media_query.set_matches(false)
    expect(values).toEqual([false, true])
  })

  it('falls back to no reduction when no browser media query is available', () => {
    const preference = create_reduced_motion_preference(undefined)

    expect(preference.current).toBe(false)
    expect(preference.subscribe(() => {})).toBeTypeOf('function')
  })
})

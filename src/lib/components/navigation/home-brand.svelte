<script lang="ts">
  import { goto } from '$app/navigation'
  import { resolve } from '$app/paths'
  import { page } from '$app/state'
  import {
    scroll_to_top,
    scroll_to_top_and_wait,
  } from '$lib/browser/scroll'
  import { compact_viewport_query } from '$lib/browser/viewport'
  import { tick } from 'svelte'

  import Brand from './header/brand.svelte'

  const home_path = resolve('/')

  function has_navigation_modifier(event: MouseEvent) {
    return event.metaKey || event.altKey || event.ctrlKey || event.shiftKey
  }

  async function return_home() {
    const away_from_home = page.url.pathname !== home_path

    if (window.matchMedia(compact_viewport_query).matches) {
      // Keep the observatory unmounted until the outgoing page has settled.
      await scroll_to_top_and_wait()
      if (away_from_home) {
        await goto(home_path, { keepFocus: true, noScroll: true })
      }
      return
    }

    if (away_from_home) {
      await goto(home_path, { keepFocus: true, noScroll: true })
      await tick()
    }

    scroll_to_top()
  }

  function handle_activate(event: MouseEvent) {
    if (event.defaultPrevented || event.button !== 0) return
    if (has_navigation_modifier(event)) return
    event.preventDefault()
    void return_home()
  }
</script>

<Brand href={home_path} on_activate={handle_activate} />

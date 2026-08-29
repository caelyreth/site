<script lang="ts">
  import { goto } from '$app/navigation'
  import { resolve } from '$app/paths'
  import { page } from '$app/state'
  import { scroll_to_top } from '$lib/browser/scroll'

  import Brand from './header/brand.svelte'

  const home_path = resolve('/')

  function has_navigation_modifier(event: MouseEvent) {
    return event.metaKey || event.altKey || event.ctrlKey || event.shiftKey
  }

  function return_home() {
    // Reset the outgoing page before the observatory mounts. Otherwise its
    // scene starts at the old scroll position and competes with the return.
    scroll_to_top()
    if (page.url.pathname !== home_path) {
      return goto(home_path, { keepFocus: true, noScroll: true })
    }
  }

  function handle_activate(event: MouseEvent) {
    if (event.defaultPrevented || event.button !== 0) return
    if (has_navigation_modifier(event)) return
    event.preventDefault()
    void return_home()
  }
</script>

<Brand href={home_path} on_activate={handle_activate} />

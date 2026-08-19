<script lang="ts">
  import { goto } from '$app/navigation'
  import { resolve } from '$app/paths'
  import { page } from '$app/state'
  import { tick } from 'svelte'

  import Brand from './header/brand.svelte'

  const home_path = resolve('/')

  function has_navigation_modifier(event: MouseEvent) {
    return event.metaKey || event.altKey || event.ctrlKey || event.shiftKey
  }

  async function return_home() {
    if (page.url.pathname !== home_path) {
      await goto(home_path, { keepFocus: true, noScroll: true })
      await tick()
    }

    window.scrollTo({ top: 0, behavior: 'auto' })
  }

  function handle_activate(event: MouseEvent) {
    if (event.defaultPrevented || event.button !== 0) return
    if (has_navigation_modifier(event)) return
    event.preventDefault()
    void return_home()
  }
</script>

<Brand href={home_path} on_activate={handle_activate} />

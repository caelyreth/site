<script lang="ts">
  import { onMount } from 'svelte'
  import type { Component } from 'svelte'

  const mobile_query = '(max-width: 40rem)'
  const load_delay = 160

  let Figure = $state<Component>()

  onMount(() => {
    const media_query = window.matchMedia(mobile_query)
    let disposed = false
    let load_timer = 0

    const clear_load_timer = () => {
      if (load_timer) window.clearTimeout(load_timer)
      load_timer = 0
    }
    const load_figure = () => {
      load_timer = 0
      if (media_query.matches || Figure) return

      void import('./plana-figure.svelte').then(({ default: figure }) => {
        if (!disposed && !media_query.matches) Figure = figure
      })
    }
    const sync_figure = () => {
      clear_load_timer()
      if (media_query.matches) {
        Figure = undefined
        return
      }

      load_timer = window.setTimeout(load_figure, load_delay)
    }

    media_query.addEventListener('change', sync_figure)
    sync_figure()

    return () => {
      disposed = true
      clear_load_timer()
      media_query.removeEventListener('change', sync_figure)
    }
  })
</script>

{#if Figure}
  <Figure />
{/if}

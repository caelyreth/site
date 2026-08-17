<script lang="ts">
  import { compact_viewport_query } from '$lib/browser/viewport'
  import { onMount } from 'svelte'

  import ScrollbarIndicator from './scrollbar-indicator.svelte'

  let scrolling_element: HTMLElement | undefined = $state()
  let show_indicator = $state(false)

  onMount(() => {
    const mobile_media = window.matchMedia(compact_viewport_query)
    const sync_indicator = () => {
      show_indicator = !mobile_media.matches
    }

    scrolling_element = document.scrollingElement as HTMLElement | undefined
    mobile_media.addEventListener('change', sync_indicator)
    sync_indicator()

    return () => mobile_media.removeEventListener('change', sync_indicator)
  })
</script>

{#if scrolling_element && show_indicator}
  <ScrollbarIndicator axis="block" target={scrolling_element} viewport />
{/if}

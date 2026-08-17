<script lang="ts">
  import { onMount } from 'svelte'

  import ScrollbarIndicator from './scrollbar-indicator.svelte'

  let scrolling_element: HTMLElement | undefined = $state()
  let show_indicator = $state(false)

  onMount(() => {
    const mobile_media = window.matchMedia('(max-width: 40rem)')
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

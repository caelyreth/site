<script lang="ts">
  import { onMount } from 'svelte'

  import ScrollbarIndicator from './scrollbar-indicator.svelte'

  let scrolling_element: HTMLElement | undefined = $state()

  onMount(() => {
    scrolling_element = document.scrollingElement as HTMLElement | undefined
  })
</script>

{#if scrolling_element}
  <ScrollbarIndicator axis="block" target={scrolling_element} viewport />
{/if}

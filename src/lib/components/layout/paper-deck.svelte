<script lang="ts">
  import type { Snippet } from 'svelte'

  import PaperEdge from './paper-edge.svelte'

  interface Props {
    children?: Snippet
    edge?: boolean
  }

  /* oxlint-disable prefer-const -- Snippet props can update with the route. */
  let { children, edge = false }: Props = $props()
</script>

<div class="paper-deck">
  <div class="deck paper-deck-body">
    {@render children?.()}
  </div>
  {#if edge}<PaperEdge guide side="bottom" />{/if}
</div>

<style>
  .paper-deck,
  .paper-deck-body {
    display: flex;
    width: 100%;
    min-width: 0;
    flex: 1;
    flex-direction: column;
  }
</style>

<script lang="ts">
  import type { Snippet } from 'svelte'

  import PaperEdge from './paper-edge.svelte'

  interface Props {
    children?: Snippet
    edge?: boolean
    top_edge?: boolean
  }

  let { children, edge = false, top_edge = false }: Props = $props()
</script>

<div class="paper-deck">
  {#if top_edge}
    <div class="paper-deck-top-edge"><PaperEdge side="top" /></div>
  {/if}
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

  .paper-deck-top-edge {
    display: none;
  }

  @media (width < 40rem) {
    .paper-deck-top-edge {
      display: block;
    }
  }
</style>

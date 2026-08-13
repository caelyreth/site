<script lang="ts">
  import type { Snippet } from 'svelte'

  import PaperEdge from './paper-edge.svelte'

  interface Props {
    children?: Snippet
    has_footer?: boolean
  }

  /* oxlint-disable prefer-const -- Snippet props can update with the route. */
  let { children, has_footer = false }: Props = $props()
</script>

<article
  class:has-paper-edge={has_footer}
  id="content"
  class="article deck"
>
  {@render children?.()}
  {#if has_footer}<PaperEdge guide side="bottom" />{/if}
</article>

<style>
  .article {
    display: flex;
    flex: 1;
    width: 100%;
    max-width: var(--frame-measure);
    margin: 0 auto;
    padding-block: clamp(3rem, 7vw, 5rem);
    padding-inline: var(--inline-gutter);
    flex-direction: column;
  }

  .article.has-paper-edge {
    clip-path: var(--paper-edge-bottom-clip);
  }
</style>

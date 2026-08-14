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

<article id="content" class="article">
  <div class="article-content deck">
    {@render children?.()}
  </div>
  {#if has_footer}<PaperEdge guide side="bottom" />{/if}
</article>

<style>
  .article {
    display: flex;
    flex: 1;
    width: 100%;
    max-width: var(--frame-measure);
    margin: 0 auto;
    flex-direction: column;
  }

  .article-content {
    display: flex;
    width: 100%;
    flex: 1;
    padding-block: clamp(1.75rem, 3vw, 2.5rem) clamp(3rem, 7vw, 5rem);
    padding-inline: var(--inline-gutter);
    flex-direction: column;
  }

  @media (max-width: 40rem) {
    .article-content {
      --article-floating-clearance: calc(
        3.5rem + env(safe-area-inset-bottom)
      );

      padding-block-end: max(3rem, var(--article-floating-clearance));
    }
  }
</style>

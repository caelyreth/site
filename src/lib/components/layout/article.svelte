<script lang="ts">
  import type { Snippet } from 'svelte'

  import PaperDeck from './paper-deck.svelte'

  interface Props {
    children?: Snippet
    has_footer?: boolean
  }

  /* oxlint-disable prefer-const -- Snippet props can update with the route. */
  let { children, has_footer = false }: Props = $props()
</script>

<article id="content" class="article">
  <PaperDeck edge={has_footer}>
    <div class="article-content">
      {@render children?.()}
    </div>
  </PaperDeck>
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
    flex: 1;
    padding-block: clamp(1.75rem, 3vw, 2.5rem) clamp(3rem, 7vw, 5rem);
    padding-inline: var(--inline-gutter);
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

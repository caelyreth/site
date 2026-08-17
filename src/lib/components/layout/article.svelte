<script lang="ts">
  import TableOfContents from '$lib/components/navigation/table-of-contents.svelte'
  import type { HeadingEntry } from '$lib/content/headings'
  import type { Snippet } from 'svelte'

  import PaperDeck from './paper-deck.svelte'

  interface Props {
    children?: Snippet
    has_footer?: boolean
    toc?: readonly HeadingEntry[]
  }

  /* oxlint-disable prefer-const -- Snippet props can update with the route. */
  let { children, has_footer = false, toc = [] }: Props = $props()
</script>

<article id="content" class="article">
  <PaperDeck edge={has_footer}>
    <div class="article-content">
      {@render children?.()}
    </div>
  </PaperDeck>
  {#if toc.length}
    <div class="article-toc">
      <TableOfContents entries={toc} />
    </div>
  {/if}
</article>

<style>
  .article {
    position: relative;
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

  .article-toc {
    position: absolute;
    inset: 0 auto 0 calc(100% + var(--content-rail-gap));
    width: 11rem;
    pointer-events: none;
  }

  .article-toc :global(.toc-rail) {
    position: sticky;
    top: 50svh;
    pointer-events: auto;
    transform: translateY(-50%);
  }

  @media (max-width: 79.99rem) {
    .article-toc {
      display: none;
    }
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

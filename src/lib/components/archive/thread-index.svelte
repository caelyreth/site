<script lang="ts">
  import type { ThreadSummary } from '$lib/content/archive'
  import type { Page } from '$lib/content/pagination'

  import IndexHeader from './index-header.svelte'
  import Pagination from './pagination.svelte'
  import ThreadStrand from './thread-strand.svelte'

  interface Props {
    threads: Page<ThreadSummary>
  }

  let { threads }: Props = $props()
</script>

<section id="content" class="thread-index">
  <IndexHeader
    title="Threads"
    description="Questions that recur across separate records, held as visible crossings rather than shelves."
  />

  <ol class="strand-field">
    {#each threads.entries as thread}
      <li><ThreadStrand {thread} /></li>
    {/each}
  </ol>

  <Pagination
    page={threads.page}
    page_count={threads.page_count}
    path="/threads"
  />
</section>

<style>
  .thread-index {
    box-sizing: border-box;
    width: min(100%, var(--frame-measure));
    margin: 0 auto;
    padding: clamp(3rem, 8vw, 6.5rem) var(--inline-gutter)
      clamp(4rem, 9vw, 7rem);
  }

  .strand-field {
    width: min(100%, 56rem);
    margin: clamp(2.5rem, 6vw, 4.5rem) 0 0 auto;
    padding: 0;
    list-style: none;
  }

  .strand-field li {
    border-bottom: 1px solid var(--color-boundary);
  }

  @media (width >= 48rem) {
    .thread-index > :global(.pagination) {
      margin-inline-start: auto;
    }
  }
</style>

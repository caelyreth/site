<script lang="ts">
  import { base } from '$app/paths'
  import Content from '$lib/components/markdown/document.svelte'
  import type {
    EssaySummary,
    ThreadDocument,
    ThreadSummary,
  } from '$lib/content/archive'
  import type { Page } from '$lib/content/pagination'

  import EntryHeader from './entry-header.svelte'
  import EssayTrajectory from './essay-trajectory.svelte'
  import Pagination from './pagination.svelte'

  interface Props {
    document: ThreadDocument
    entries: Page<EssaySummary>
    thread: ThreadSummary
  }

  let { document, entries, thread }: Props = $props()
  const back_href = `${base}/threads`.replace('//', '/')
  const thread_path = $derived(`/threads/${thread.id}`)
</script>

<article id="content" class="thread-detail">
  <EntryHeader
    {back_href}
    back_label="线索"
    meta={`${thread.entry_count} 篇关联记录`}
    summary={thread.summary}
    title={thread.title}
  >
    {#snippet children()}
      <div class="thread-intro"><Content {document} /></div>
    {/snippet}
  </EntryHeader>

  <section class="thread-records" aria-label={`${thread.title}中的记录`}>
    <h2>关联随笔</h2>
    <EssayTrajectory entries={entries.entries} show_threads={false} />
    <Pagination
      page={entries.page}
      page_count={entries.page_count}
      path={thread_path}
    />
  </section>
</article>

<style>
  .thread-detail {
    box-sizing: border-box;
    width: min(100%, var(--frame-measure));
    margin: 0 auto;
    padding: clamp(3rem, 7vw, 5.5rem) var(--inline-gutter)
      clamp(4rem, 8vw, 6rem);
  }

  :global(.archive-entry-header),
  .thread-records {
    width: min(100%, 52rem);
    margin-inline: auto;
  }

  .thread-intro {
    max-width: 41rem;
    margin-top: 1.5rem;
  }

  .thread-records {
    margin-top: clamp(3.5rem, 8vw, 6rem);
  }

  .thread-records h2 {
    margin: 0 0 1rem;
    color: var(--color-text-secondary);
    font-family: var(--font-stack-sans);
    font-size: 0.75rem;
    font-weight: 500;
    letter-spacing: 0.06em;
    line-height: 1.5;
  }

  .thread-records :global(.trajectory) {
    border-top: 1px solid var(--color-boundary);
  }
</style>

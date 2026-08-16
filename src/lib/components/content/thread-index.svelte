<script lang="ts">
  import { base } from '$app/paths'
  import type {
    ContentSummary,
    EntryFrontmatter,
  } from '$lib/content/schema'
  import { content_section_label } from '$lib/content/sections'
  import { thread_label, type ThreadSummary } from '$lib/content/threads'

  interface Props {
    threads: ThreadSummary<ContentSummary<EntryFrontmatter>>[]
  }

  const { threads }: Props = $props()

  function thread_href(thread: string) {
    return `${base}/threads/${thread}`.replace('//', '/')
  }

  function thread_sections(entries: ContentSummary<EntryFrontmatter>[]) {
    return [
      ...new Set(
        entries.map((entry) => content_section_label(entry.section)),
      ),
    ].join(' / ')
  }

  function thread_titles(entries: ContentSummary<EntryFrontmatter>[]) {
    return entries.map((entry) => entry.frontmatter.title).join(' / ')
  }
</script>

<section id="content" class="thread-index">
  <header class="thread-header">
    <p class="micro-label eyebrow">Cross-collection index</p>
    <h1 class="font-serif">Threads</h1>
    <p class="description">
      Recurring questions that cross the archive without replacing the form
      of any individual record.
    </p>
  </header>

  <div class="thread-rule" aria-hidden="true"></div>

  {#if threads.length > 0}
    <ol class="thread-list">
      {#each threads as thread}
        <li>
          <a class="thread-link" href={thread_href(thread.id)}>
            <div class="thread-meta">
              <span
                >{thread.entries.length} record{thread.entries.length === 1
                  ? ''
                  : 's'}</span
              >
              <span>{thread_sections(thread.entries)}</span>
            </div>
            <h2 class="font-serif">{thread_label(thread.id)}</h2>
            <p>{thread_titles(thread.entries)}</p>
            <span
              class="thread-arrow i-ri-arrow-right-line"
              aria-hidden="true"
            ></span>
          </a>
        </li>
      {/each}
    </ol>
  {:else}
    <div class="empty-state">
      <span class="empty-mark" aria-hidden="true">--</span>
      <p>No threads have been attached to the archive yet.</p>
    </div>
  {/if}
</section>

<style>
  .thread-index {
    box-sizing: border-box;
    width: min(100%, var(--frame-measure));
    margin: 0 auto;
    padding: clamp(3.25rem, 8vw, 7rem) var(--inline-gutter)
      clamp(4rem, 9vw, 7rem);
  }

  .thread-header {
    max-width: 42rem;
  }

  .eyebrow {
    margin: 0;
    color: var(--color-muted);
    letter-spacing: 0.14em;
  }

  h1 {
    margin: 0.875rem 0 0;
    color: var(--color-text);
    font-size: clamp(2.25rem, 6vw, 4.5rem);
    font-weight: 700;
    line-height: 0.98;
  }

  .description {
    max-width: 38rem;
    margin: 1.25rem 0 0;
    color: var(--color-text-secondary);
    font-size: 1rem;
    line-height: 1.6;
  }

  .thread-rule {
    height: 1px;
    margin-top: clamp(2.5rem, 6vw, 5rem);
    background-image: var(--paper-seam-dash);
  }

  .thread-list {
    margin: 0;
    padding: 0;
    list-style: none;
  }

  .thread-list li {
    border-bottom: 1px solid var(--color-boundary);
  }

  .thread-link {
    position: relative;
    display: block;
    padding: 1.5rem 2.5rem 1.5rem 0;
    color: var(--color-text);
    text-decoration: none;
    transition:
      color var(--dur-short) var(--ease-out),
      padding var(--dur-short) var(--ease-out),
      background-color var(--dur-short) var(--ease-out);
  }

  .thread-meta {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem 1.25rem;
    color: var(--color-muted);
    font-size: 0.625rem;
    letter-spacing: 0.08em;
    line-height: 1.3;
    text-transform: uppercase;
  }

  .thread-meta span + span::before {
    margin-right: 1.25rem;
    color: var(--color-boundary);
    content: '/';
  }

  h2 {
    margin: 0.625rem 0 0;
    color: inherit;
    font-size: clamp(1.25rem, 2.2vw, 1.75rem);
    font-weight: 700;
    line-height: 1.08;
  }

  .thread-link p {
    max-width: 48rem;
    margin: 0.625rem 0 0;
    color: var(--color-text-secondary);
    font-size: 0.8125rem;
    line-height: 1.55;
  }

  .thread-arrow {
    position: absolute;
    top: 50%;
    right: 0.25rem;
    color: var(--color-muted);
    font-size: 1rem;
    transform: translateY(-50%);
    transition:
      color var(--dur-short) var(--ease-out),
      transform var(--dur-short) var(--ease-out);
  }

  .empty-state {
    display: flex;
    min-height: 12rem;
    border-bottom: 1px solid var(--color-boundary);
    color: var(--color-muted);
    align-items: center;
    gap: 0.75rem;
  }

  .empty-state p {
    margin: 0;
    font-size: 0.8125rem;
  }

  .empty-mark {
    color: var(--color-boundary);
    font-family: var(--font-stack-mono);
    font-size: 1.25rem;
  }

  @media (hover: hover) {
    .thread-link:hover {
      padding-inline-start: 0.75rem;
      background-color: color-mix(
        in oklab,
        var(--color-prose-surface) 64%,
        transparent
      );
    }

    .thread-link:hover .thread-arrow {
      color: var(--color-text-link);
      transform: translate(0.25rem, -50%);
    }
  }

  .thread-link:focus-visible {
    outline: 2px solid var(--color-focus);
    outline-offset: -2px;
  }

  @media (max-width: 40rem) {
    .thread-index {
      padding-top: 3rem;
    }

    .thread-link {
      padding-block: 1.25rem;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .thread-link,
    .thread-arrow {
      transition: none;
    }
  }
</style>

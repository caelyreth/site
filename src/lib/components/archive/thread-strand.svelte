<script lang="ts">
  import { base } from '$app/paths'
  import type { ThreadSummary } from '$lib/content/archive'

  interface Props {
    thread: ThreadSummary
  }

  let { thread }: Props = $props()

  function thread_href(id: string) {
    return `${base}/threads/${id}`.replace('//', '/')
  }
</script>

<a class="strand" href={thread_href(thread.id)}>
  <span class="strand-head">
    <h2>{thread.title}</h2>
    <span class="strand-summary">{thread.summary}</span>
  </span>

  <span class="strand-notes">
    {#each thread.latest as essay}
      <span>{essay.title}</span>
    {/each}
  </span>
</a>

<style>
  .strand {
    display: grid;
    min-width: 0;
    padding-block: clamp(1.5rem, 4vw, 2.25rem);
    grid-template-columns: minmax(0, 1fr);
    color: var(--color-text);
    text-decoration: none;
    gap: 1.25rem;
    transition: color var(--dur-short) var(--ease-out);
  }

  .strand-head,
  .strand-notes {
    min-width: 0;
  }

  h2 {
    margin: 0;
    color: inherit;
    font-family: var(--font-stack-serif);
    font-size: clamp(1.35rem, 2.25vw, 1.85rem);
    font-weight: 700;
    letter-spacing: 0;
    line-height: 1.05;
    overflow-wrap: anywhere;
  }

  .strand-notes {
    display: grid;
    padding-inline-start: 1.25rem;
    border-inline-start: 1px solid var(--color-boundary);
    color: var(--color-muted);
    font-size: 0.75rem;
    line-height: 1.45;
    gap: 0.375rem;
  }

  .strand-notes span {
    position: relative;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .strand-notes span::before {
    position: absolute;
    top: 0.65em;
    right: 100%;
    width: 0.75rem;
    border-top: 1px solid var(--color-boundary);
    content: '';
  }

  .strand-summary {
    display: block;
    max-width: 25rem;
    margin-top: 0.65rem;
    color: var(--color-text-secondary);
    font-size: 0.8125rem;
    line-height: 1.5;
  }

  .strand:focus-visible {
    outline: 2px solid var(--color-focus);
    outline-offset: -2px;
  }

  @media (hover: hover) {
    .strand:hover {
      color: var(--color-text-link);
    }
  }

  @media (width >= 48rem) {
    .strand {
      grid-template-columns: minmax(12rem, 0.65fr) minmax(0, 1fr);
      align-items: start;
      column-gap: clamp(2rem, 5vw, 5rem);
    }

    .strand-head {
      grid-column: 1;
    }

    .strand-notes {
      grid-column: 2;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .strand {
      transition: none;
    }
  }
</style>

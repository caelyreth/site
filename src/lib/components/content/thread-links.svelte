<script lang="ts">
  import { base } from '$app/paths'
  import { thread_label } from '$lib/content/threads'

  interface Props {
    threads: string[]
  }

  const { threads }: Props = $props()

  function thread_href(thread: string) {
    return `${base}/threads/${thread}`.replace('//', '/')
  }
</script>

<nav class="thread-links" aria-label="Related threads">
  <span class="micro-label thread-label">Threads</span>
  {#each threads as thread}
    <a href={thread_href(thread)}>{thread_label(thread)}</a>
  {/each}
</nav>

<style>
  .thread-links {
    display: flex;
    margin: 1.5rem 0 0;
    color: var(--color-muted);
    flex-wrap: wrap;
    align-items: baseline;
    gap: 0.5rem 0.875rem;
  }

  .thread-label {
    color: inherit;
  }

  a {
    color: inherit;
    font-size: 0.6875rem;
    letter-spacing: 0.04em;
    line-height: 1.3;
    text-decoration-line: underline;
    text-decoration-color: var(--color-boundary);
    text-decoration-thickness: 1px;
    text-underline-offset: 0.28em;
    transition:
      color var(--dur-short) var(--ease-out),
      text-decoration-color var(--dur-short) var(--ease-out);
  }

  a:focus-visible {
    outline: 2px solid var(--color-focus);
    outline-offset: 0.25rem;
  }

  @media (hover: hover) {
    a:hover {
      color: var(--color-text-link);
      text-decoration-color: currentcolor;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    a {
      transition: none;
    }
  }
</style>

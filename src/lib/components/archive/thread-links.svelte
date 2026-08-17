<script lang="ts">
  import { base } from '$app/paths'
  import { thread_titles } from '$lib/content/thread-labels'

  interface Props {
    threads: string[]
  }

  let { threads }: Props = $props()

  function thread_href(thread: string) {
    return `${base}/threads/${thread}`.replace('//', '/')
  }

  function thread_label(thread: string) {
    return thread_titles[thread] ?? '关联线索'
  }
</script>

{#if threads.length}
  <nav class="thread-links" aria-label="关联线索">
    {#each threads as thread}
      <a href={thread_href(thread)}>{thread_label(thread)}</a>
    {/each}
  </nav>
{/if}

<style>
  .thread-links {
    display: flex;
    min-width: 0;
    margin: 0.75rem 0 0;
    flex-wrap: wrap;
    gap: 0.4rem 0.75rem;
  }

  a {
    min-width: 0;
    color: var(--color-muted);
    font-size: 0.625rem;
    letter-spacing: 0.06em;
    line-height: 1.35;
    text-decoration-color: var(--color-boundary);
    text-decoration-thickness: 1px;
    text-underline-offset: 0.28em;
    transition:
      color var(--dur-micro) var(--ease-out),
      text-decoration-color var(--dur-micro) var(--ease-out);
  }

  a:focus-visible {
    outline: 2px solid var(--color-focus);
    outline-offset: 0.2rem;
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

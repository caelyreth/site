<script lang="ts">
  import { base } from '$app/paths'

  interface Props {
    threads: string[]
  }

  let { threads }: Props = $props()

  function thread_href(thread: string) {
    return `${base}/threads/${thread}`.replace('//', '/')
  }
</script>

{#if threads.length}
  <nav class="thread-links" aria-label="Connected threads">
    {#each threads as thread}
      <a href={thread_href(thread)}>{thread.replaceAll('-', ' ')}</a>
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
    text-transform: uppercase;
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

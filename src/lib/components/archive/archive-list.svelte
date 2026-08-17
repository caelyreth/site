<script lang="ts">
  import type { Snippet } from 'svelte'

  interface Props {
    children: Snippet
  }

  let { children }: Props = $props()
</script>

<ol class="archive-list">
  {@render children()}
</ol>

<style>
  .archive-list {
    position: relative;
    margin: 0;
    padding: 0 0 0 var(--archive-content-inset);
    list-style: none;
  }

  .archive-list::before {
    position: absolute;
    top: 0;
    bottom: 0;
    left: var(--archive-axis);
    width: 1px;
    content: '';
    background: var(--color-boundary);
  }

  :global(.archive-list > li) {
    position: relative;
    min-width: 0;
    border-bottom: 1px solid var(--color-boundary);
  }

  :global(.archive-list > li)::before {
    position: absolute;
    z-index: 1;
    top: clamp(1.15rem, 2.2vw, 1.5rem);
    left: calc(var(--archive-axis) - var(--archive-content-inset) - 2px);
    box-sizing: border-box;
    width: 5px;
    height: 5px;
    border: 1px solid var(--color-muted);
    border-radius: 50%;
    content: '';
    background: var(--color-paper);
    transition:
      border-color var(--dur-micro) var(--ease-out),
      background-color var(--dur-micro) var(--ease-out);
  }

  @media (hover: hover) {
    :global(.archive-list > li:hover)::before {
      border-color: var(--color-text-link);
      background: var(--color-text-link);
    }
  }

  @media (prefers-reduced-motion: reduce) {
    :global(.archive-list > li)::before {
      transition: none;
    }
  }
</style>

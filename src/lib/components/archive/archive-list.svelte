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
    top: var(--archive-mark-offset, 1.55rem);
    left: calc(var(--archive-axis) - var(--archive-content-inset) - 3px);
    box-sizing: border-box;
    width: 6px;
    height: 6px;
    border: 1px solid var(--color-muted);
    content: '';
    background: var(--color-paper);
    transition:
      border-color var(--dur-micro) var(--ease-out),
      background-color var(--dur-micro) var(--ease-out),
      transform var(--dur-micro) var(--ease-out);
  }

  @media (hover: hover) {
    :global(.archive-list > li:hover)::before,
    :global(.archive-list > li:focus-within)::before {
      border-color: var(--color-text-link);
      background: var(--color-text-link);
      transform: scale(1.12);
    }
  }

  :global(.archive-list > li:focus-within)::before {
    border-color: var(--color-focus);
    background: var(--color-focus);
    transform: scale(1.12);
  }

  @media (prefers-reduced-motion: reduce) {
    :global(.archive-list > li)::before {
      transition: none;
    }
  }
</style>

<script lang="ts">
  import type { Snippet } from 'svelte'

  interface Props extends Record<string, unknown> {
    children?: Snippet
    summary?: string
  }

  /* oxlint-disable prefer-const -- Renderer props can update with the document. */
  let { children, summary = 'Details', ...attributes }: Props = $props()
</script>

<details {...attributes}>
  <summary>{summary}</summary>
  <div class="details-content">{@render children?.()}</div>
</details>

<style>
  details {
    margin-top: var(--prose-block-gap);
    border: 1px solid var(--color-rule);
    color: var(--color-text-secondary);
    background: var(--color-prose-surface);
  }

  summary {
    display: flex;
    min-inline-size: 0;
    padding: 0.75rem 1rem;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
    color: var(--color-text);
    cursor: pointer;
    font-family: var(--font-stack-sans);
    font-size: 0.8125rem;
    font-weight: 600;
    line-height: 1.35;
    list-style: none;
  }

  summary::-webkit-details-marker {
    display: none;
  }

  summary::after {
    flex: none;
    content: '+';
    transition: transform var(--dur-micro) var(--ease-out);
  }

  details[open] summary {
    border-bottom: 1px solid var(--color-rule);
  }

  details[open] summary::after {
    transform: rotate(45deg);
  }

  summary:focus-visible {
    outline: 2px solid var(--color-focus);
    outline-offset: -2px;
  }

  .details-content {
    padding: 0 1rem 1rem;
  }

  .details-content :global(p + p) {
    margin-top: var(--prose-nested-gap);
  }

  @media (prefers-reduced-motion: reduce) {
    summary::after {
      transition-duration: 0ms;
    }
  }
</style>

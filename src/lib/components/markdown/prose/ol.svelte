<script lang="ts">
  import type { Snippet } from 'svelte'

  interface Props extends Record<string, unknown> {
    children?: Snippet
  }

  let { children, ...attributes }: Props = $props()
</script>

<ol {...attributes}>{@render children?.()}</ol>

<style>
  ol {
    margin: var(--prose-list-margin, var(--prose-block-gap)) 0 0;
    padding-inline-start: 2rem;
    color: var(--color-text-secondary);
    font-size: var(--prose-size);
    line-height: var(--prose-leading);
    list-style: decimal;
  }

  ol > :global(li) + :global(li) {
    margin-top: var(--prose-list-gap, 0.5rem);
  }

  ol :global(ol) {
    list-style-type: lower-alpha;
  }

  ol :global(ol ol) {
    list-style-type: lower-roman;
  }

  ol > :global(li)::marker {
    color: var(--color-text-secondary);
    font-size: 0.75em;
    font-weight: 600;
    font-variant-numeric: tabular-nums;
  }
</style>

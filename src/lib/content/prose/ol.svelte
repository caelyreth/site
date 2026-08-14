<script lang="ts">
  import type { Snippet } from 'svelte'

  interface Props extends Record<string, unknown> {
    children?: Snippet
  }

  /* oxlint-disable prefer-const -- Renderer props can update with the document. */
  let { children, ...attributes }: Props = $props()
</script>

<ol {...attributes}>{@render children?.()}</ol>

<style>
  ol {
    margin: var(--prose-list-margin, var(--prose-block-gap)) 0 0;
    padding-inline-start: 1.5rem;
    color: var(--color-text-secondary);
    font-size: var(--prose-size);
    line-height: var(--prose-leading);
    list-style: decimal;
  }

  ol :global(ol) {
    list-style-type: lower-alpha;
  }

  ol :global(ol ol) {
    list-style-type: lower-roman;
  }

  ol::marker {
    color: var(--color-muted);
    font-family: var(--font-stack-sans);
    font-size: 0.875em;
    font-weight: 600;
  }
</style>

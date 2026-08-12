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
    margin: 1rem 0 0;
    padding-inline-start: 1.25rem;
    color: var(--color-text-secondary);
    font-size: var(--prose-size);
    line-height: var(--prose-leading);
    list-style: decimal;
    margin-block-start: var(--prose-list-gap, 1rem);
  }
</style>

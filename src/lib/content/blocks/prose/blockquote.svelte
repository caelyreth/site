<script lang="ts">
  import type { Snippet } from 'svelte'

  type Props = { children?: Snippet } & Record<string, unknown>

  /* oxlint-disable prefer-const -- Renderer props can update with the document. */
  let { children, ...attributes }: Props = $props()
</script>

<blockquote {...attributes}>{@render children?.()}</blockquote>

<style>
  blockquote {
    margin: 1.5rem 0 0;
    padding: 0.75rem 1rem;
    border: 1px solid var(--color-rule);
    border-inline-start: 2px solid var(--color-text-secondary);
    color: var(--color-text-secondary);
    font-size: var(--prose-size);
    line-height: var(--prose-leading);
    overflow-wrap: anywhere;
    background: var(--color-prose-surface);
  }
</style>

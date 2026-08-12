<script lang="ts">
  import type { Snippet } from 'svelte'

  interface Props extends Record<string, unknown> {
    children?: Snippet
  }

  /* oxlint-disable prefer-const -- Renderer props can update with the document. */
  let { children, ...attributes }: Props = $props()
</script>

<pre {...attributes}>{@render children?.()}</pre>

<style>
  pre {
    max-width: 100%;
    margin: 1.25rem 0 0;
    padding: 0.875rem 1rem;
    overflow-x: auto;
    border: 1px solid var(--color-rule);
    background: var(--color-prose-surface);
  }

  pre :global(code) {
    padding: 0;
    border: 0;
    color: var(--color-text);
    font-size: 0.75rem;
    line-height: 1.55;
    background: transparent;
  }
</style>

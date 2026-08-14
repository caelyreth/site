<script lang="ts">
  import type { Snippet } from 'svelte'

  interface Props extends Record<string, unknown> {
    children?: Snippet
  }

  /* oxlint-disable prefer-const -- Renderer props can update with the document. */
  let { children, ...attributes }: Props = $props()
</script>

<dt {...attributes}>{@render children?.()}</dt>

<style>
  dt {
    color: var(--color-text);
    font-family: var(--font-stack-sans);
    font-size: 0.8125rem;
    font-weight: 600;
    line-height: 1.35;
  }
</style>

<script lang="ts">
  import type { Snippet } from 'svelte'

  interface Props extends Record<string, unknown> {
    children?: Snippet
  }

  let { children, ...attributes }: Props = $props()
</script>

<p {...attributes}>{@render children?.()}</p>

<style>
  p {
    margin: 0.75rem 0 0;
    color: var(--color-text-secondary);
    font-size: var(--prose-size);
    hyphens: auto;
    line-height: var(--prose-leading);
    overflow-wrap: anywhere;
    text-wrap: pretty;
  }
</style>

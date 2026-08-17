<script lang="ts">
  import type { Snippet } from 'svelte'

  interface Props extends Record<string, unknown> {
    children?: Snippet
  }

  let { children, ...attributes }: Props = $props()
</script>

<dd {...attributes}>{@render children?.()}</dd>

<style>
  dd {
    margin: 0.25rem 0 0;
    color: var(--color-text-secondary);
    font-size: var(--prose-size);
    line-height: var(--prose-leading);
  }
</style>

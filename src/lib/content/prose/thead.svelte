<script lang="ts">
  import type { Snippet } from 'svelte'

  interface Props extends Record<string, unknown> {
    children?: Snippet
  }

  /* oxlint-disable prefer-const -- Renderer props can update with the document. */
  let { children, ...attributes }: Props = $props()
</script>

<thead {...attributes}>{@render children?.()}</thead>

<style>
  thead {
    background: color-mix(in oklab, var(--color-text) 4%, transparent);
  }
</style>

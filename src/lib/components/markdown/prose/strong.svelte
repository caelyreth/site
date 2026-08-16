<script lang="ts">
  import type { Snippet } from 'svelte'

  interface Props extends Record<string, unknown> {
    children?: Snippet
  }

  /* oxlint-disable prefer-const -- Renderer props can update with the document. */
  let { children, ...attributes }: Props = $props()
</script>

<strong {...attributes}>{@render children?.()}</strong>

<style>
  strong {
    color: var(--color-text);
    font-synthesis: none;
    font-weight: 700;
    overflow-wrap: anywhere;
  }
</style>

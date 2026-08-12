<script lang="ts">
  import type { Snippet } from 'svelte'

  interface Props extends Record<string, unknown> {
    children?: Snippet
  }

  /* oxlint-disable prefer-const -- Renderer props can update with the document. */
  let { children, ...attributes }: Props = $props()
</script>

<em {...attributes}>{@render children?.()}</em>

<style>
  em {
    color: var(--color-text);
    overflow-wrap: anywhere;
  }
</style>

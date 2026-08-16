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
    font-family: var(--font-stack-serif);
    font-style: italic;
    overflow-wrap: anywhere;
  }
</style>

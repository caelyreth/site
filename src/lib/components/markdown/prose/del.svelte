<script lang="ts">
  import type { Snippet } from 'svelte'

  interface Props extends Record<string, unknown> {
    children?: Snippet
  }

  /* oxlint-disable prefer-const -- Renderer props can update with the document. */
  let { children, ...attributes }: Props = $props()
</script>

<del {...attributes}>{@render children?.()}</del>

<style>
  del {
    text-decoration-line: line-through;
    text-decoration-color: currentcolor;
    text-decoration-thickness: 1px;
    text-underline-offset: 0.1em;
    overflow-wrap: anywhere;
  }
</style>

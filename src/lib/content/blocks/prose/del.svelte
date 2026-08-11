<script lang="ts">
  import type { Snippet } from 'svelte'

  type Props = { children?: Snippet } & Record<string, unknown>

  /* oxlint-disable prefer-const -- Renderer props can update with the document. */
  let { children, ...attributes }: Props = $props()
</script>

<del {...attributes}>{@render children?.()}</del>

<style>
  del {
    text-decoration-color: currentcolor;
    text-decoration-thickness: 1px;
    overflow-wrap: anywhere;
  }
</style>

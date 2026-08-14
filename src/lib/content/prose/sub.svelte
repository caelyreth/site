<script lang="ts">
  import type { Snippet } from 'svelte'

  interface Props extends Record<string, unknown> {
    children?: Snippet
  }

  /* oxlint-disable prefer-const -- Renderer props can update with the document. */
  let { children, ...attributes }: Props = $props()
</script>

<sub {...attributes}>{@render children?.()}</sub>

<style>
  sub {
    font-size: 0.75em;
    line-height: 0;
    vertical-align: sub;
  }
</style>

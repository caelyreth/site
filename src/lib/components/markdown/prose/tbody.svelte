<script lang="ts">
  import type { Snippet } from 'svelte'

  interface Props extends Record<string, unknown> {
    children?: Snippet
  }

  let { children, ...attributes }: Props = $props()
</script>

<tbody {...attributes}>{@render children?.()}</tbody>

<style>
  tbody :global(tr:last-child > td) {
    border-bottom: 0;
  }
</style>

<script lang="ts">
  import type { Snippet } from 'svelte'

  interface Props extends Record<string, unknown> {
    children?: Snippet
  }

  let { children, ...attributes }: Props = $props()
</script>

<tr {...attributes}>{@render children?.()}</tr>

<style>
  tr {
    vertical-align: inherit;
  }
</style>

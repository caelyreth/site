<script lang="ts">
  import type { Snippet } from 'svelte'

  interface Props extends Record<string, unknown> {
    children?: Snippet
  }

  /* oxlint-disable prefer-const -- Renderer props can update with the document. */
  let { children, ...attributes }: Props = $props()
</script>

<td {...attributes}>{@render children?.()}</td>

<style>
  td {
    padding: 0.625rem 0.875rem;
    border-bottom: 1px solid var(--color-rule);
    color: var(--color-text-secondary);
    text-align: start;
    vertical-align: top;
    overflow-wrap: normal;
  }

  td.numeric {
    text-align: end;
  }
</style>

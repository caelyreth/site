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
    padding: 0.625rem 0.875rem 0.625rem 0;
    border-bottom: 1px solid var(--color-rule);
    color: var(--color-text-secondary);
    text-align: left;
    overflow-wrap: anywhere;
  }

  @media (max-width: 38rem) {
    td {
      padding-right: 0.5rem;
    }
  }
</style>

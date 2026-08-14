<script lang="ts">
  import type { Snippet } from 'svelte'

  interface Props extends Record<string, unknown> {
    children?: Snippet
    scope?: 'col' | 'colgroup' | 'row' | 'rowgroup'
  }

  /* oxlint-disable prefer-const -- Renderer props can update with the document. */
  let { children, scope = 'col', ...attributes }: Props = $props()
</script>

<th {...attributes} {scope}>{@render children?.()}</th>

<style>
  th {
    padding: 0.625rem 0.875rem;
    border-bottom: 1px solid var(--color-rule);
    color: var(--color-text);
    font-family: var(--font-stack-sans);
    font-size: inherit;
    font-weight: 600;
    text-align: start;
    vertical-align: bottom;
    overflow-wrap: normal;
  }

  th.numeric {
    text-align: end;
  }
</style>

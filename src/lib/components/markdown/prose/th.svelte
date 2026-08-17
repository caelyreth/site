<script lang="ts">
  import type { Snippet } from 'svelte'

  interface Props extends Record<string, unknown> {
    children?: Snippet
    scope?: 'col' | 'colgroup' | 'row' | 'rowgroup'
  }

  let { children, scope = 'col', ...attributes }: Props = $props()
</script>

<th {...attributes} {scope}>{@render children?.()}</th>

<style>
  th {
    padding: 0.625rem 0.875rem;
    border-bottom: 1px solid var(--color-boundary);
    color: var(--color-text);
    font-family: var(--font-stack-sans);
    font-size: inherit;
    font-weight: 600;
    text-align: start;
    vertical-align: bottom;
    overflow-wrap: normal;
  }

  th:first-child {
    padding-inline-start: 0;
  }

  th:last-child {
    padding-inline-end: 0;
  }

  th.numeric {
    text-align: end;
  }
</style>

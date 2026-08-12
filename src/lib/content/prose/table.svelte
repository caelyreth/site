<script lang="ts">
  import type { Snippet } from 'svelte'

  type Props = { children?: Snippet } & Record<string, unknown>

  /* oxlint-disable prefer-const -- Renderer props can update with the document. */
  let { children, ...attributes }: Props = $props()
</script>

<table {...attributes}>{@render children?.()}</table>

<style>
  table {
    width: 100%;
    margin-top: 1.25rem;
    border-collapse: collapse;
    border-block: 1px solid var(--color-rule);
    color: var(--color-text-secondary);
    font-size: var(--prose-size);
    font-variant-numeric: tabular-nums;
    line-height: var(--prose-leading);
  }

  @media (max-width: 38rem) {
    table {
      font-size: 0.8125rem;
    }
  }
</style>

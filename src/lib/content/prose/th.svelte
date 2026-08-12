<script lang="ts">
  import type { Snippet } from 'svelte'

  type Props = { children?: Snippet } & Record<string, unknown>

  /* oxlint-disable prefer-const -- Renderer props can update with the document. */
  let { children, ...attributes }: Props = $props()
</script>

<th {...attributes}>{@render children?.()}</th>

<style>
  th {
    padding: 0.625rem 0.875rem 0.625rem 0;
    border-bottom: 1px solid var(--color-rule);
    color: var(--color-text);
    font-family: var(--font-stack-sans);
    font-size: inherit;
    font-weight: 600;
    text-align: left;
    overflow-wrap: anywhere;
  }

  @media (max-width: 38rem) {
    th {
      padding-right: 0.5rem;
    }
  }
</style>

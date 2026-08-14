<script lang="ts">
  import type { Snippet } from 'svelte'

  interface Props extends Record<string, unknown> {
    caption?: string
    class?: string
    children?: Snippet
  }

  /* oxlint-disable prefer-const -- Renderer props can update with the document. */
  let {
    caption,
    children,
    class: class_name,
    ...attributes
  }: Props = $props()
  const table_label = $derived(caption ? `${caption} table` : 'Data table')
</script>

<div aria-label={table_label} class="table-scroll" role="region">
  <table {...attributes} class={class_name}>
    {#if caption}<caption>{caption}</caption>{/if}
    {@render children?.()}
  </table>
</div>

<style>
  .table-scroll {
    max-inline-size: 100%;
    margin-top: var(--prose-block-gap);
    overscroll-behavior-inline: contain;
    overflow-x: auto;
    scrollbar-color: var(--color-rule) transparent;
  }

  table {
    inline-size: max-content;
    min-inline-size: 100%;
    border-collapse: separate;
    border-spacing: 0;
    border-block: 1px solid var(--color-rule);
    color: var(--color-text-secondary);
    font-size: var(--prose-size);
    font-variant-numeric: tabular-nums;
    line-height: var(--prose-leading);
  }

  caption {
    padding: 0.625rem 0 0;
    caption-side: bottom;
    color: var(--color-muted);
    font-family: var(--font-stack-sans);
    font-size: 0.75rem;
    line-height: 1.45;
    text-align: start;
  }
</style>

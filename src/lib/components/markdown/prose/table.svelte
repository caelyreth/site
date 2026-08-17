<script lang="ts">
  import ScrollbarIndicator from '$lib/components/layout/scrollbar-indicator.svelte'
  import type { Snippet } from 'svelte'

  import CopyButton from './copy-button.svelte'

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
  let table: HTMLTableElement | undefined = $state()
  let table_scroll: HTMLDivElement | undefined = $state()

  function table_text() {
    if (!table) return ''

    return Array.from(table.rows, (row) =>
      Array.from(row.cells, (cell) => cell.textContent?.trim() ?? '').join(
        '\t',
      ),
    ).join('\n')
  }
</script>

<div
  aria-label={table_label}
  bind:this={table_scroll}
  class="table-scroll"
  role="region"
>
  <table {...attributes} bind:this={table} class={class_name}>
    <caption>
      <span class="caption-row">
        {#if caption}<span class="caption-text">{caption}</span>{/if}
        <CopyButton label="Copy table" value={table_text} />
      </span>
    </caption>
    {@render children?.()}
  </table>
</div>
{#if table_scroll}
  <ScrollbarIndicator axis="inline" target={table_scroll} />
{/if}

<style>
  .table-scroll {
    max-inline-size: 100%;
    margin-top: var(--prose-block-gap);
    overscroll-behavior-inline: contain;
    overflow-x: auto;
    scrollbar-width: none;
  }

  .table-scroll::-webkit-scrollbar {
    display: none;
  }

  table {
    inline-size: max-content;
    min-inline-size: 100%;
    border-collapse: separate;
    border-spacing: 0;
    border-block: 1px solid var(--color-boundary);
    color: var(--color-text-secondary);
    font-size: var(--prose-size);
    font-variant-numeric: tabular-nums;
    line-height: var(--prose-leading);
  }

  caption {
    padding: 0.625rem 0 0;
    caption-side: bottom;
    text-align: start;
  }

  .caption-row {
    display: flex;
    gap: 0.75rem;
    align-items: center;
  }

  .caption-text {
    color: var(--color-muted);
    font-family: var(--font-stack-sans);
    font-size: 0.75rem;
    line-height: 1.45;
  }

  .caption-row :global(.copy-button) {
    margin-inline-start: auto;
  }

  @media (forced-colors: active) {
    .table-scroll {
      scrollbar-width: auto;
    }

    .table-scroll::-webkit-scrollbar {
      display: block;
    }
  }
</style>

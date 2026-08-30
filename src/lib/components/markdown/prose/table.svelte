<script lang="ts">
  import ScrollbarIndicator from '$lib/components/layout/scrollbar-indicator.svelte'
  import type { Snippet } from 'svelte'

  import CopyButton from './copy-button.svelte'

  interface Props extends Record<string, unknown> {
    caption?: string
    class?: string
    children?: Snippet
  }

  let {
    caption,
    children,
    class: class_name,
    ...attributes
  }: Props = $props()
  const table_label = $derived(caption ? `${caption}表格` : '数据表格')
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

<div class="table-block">
  <div
    aria-label={table_label}
    bind:this={table_scroll}
    class="table-scroll"
    role="region"
  >
    <table {...attributes} bind:this={table} class={class_name}>
      <caption class="sr-only">{table_label}</caption>
      {@render children?.()}
    </table>
  </div>
  <div class="table-tools">
    {#if caption}<span class="caption-text">{caption}</span>{/if}
    <CopyButton label="复制表格" value={table_text} />
  </div>
</div>
{#if table_scroll}
  <ScrollbarIndicator axis="inline" target={table_scroll} />
{/if}

<style>
  .table-block {
    max-inline-size: 100%;
    margin-top: var(--prose-block-gap);
    min-inline-size: 0;
  }

  .table-scroll {
    max-inline-size: 100%;
    min-inline-size: 0;
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

  .table-tools {
    display: flex;
    gap: 0.75rem;
    align-items: center;
    min-block-size: 2.25rem;
    padding: 0.625rem 0 0;
  }

  .caption-text {
    color: var(--color-muted);
    font-family: var(--font-stack-sans);
    font-size: 0.75rem;
    line-height: 1.45;
  }

  .table-tools :global(.copy-button) {
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

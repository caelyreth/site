<script lang="ts">
  import PaperSeam from '$lib/components/layout/paper-seam.svelte'
  import Content from '$lib/components/markdown/document.svelte'
  import type { EntryCollection } from '$lib/content/entries'
  import type {
    ConstellationIndexDocument,
    EntryIndexDocument,
  } from '$lib/content/schema'
  import type { Snippet } from 'svelte'

  import IndexHeader from './index-header.svelte'
  import Pagination from './pagination.svelte'
  import ReadingPlane from './reading-plane.svelte'

  type ArchiveIndexKind = 'constellations' | EntryCollection

  const empty_messages: Record<ArchiveIndexKind, string> = {
    constellations: '暂时没有可显示的星群。',
    records: '当前没有可供检索的记录。',
    voidknot: '当前没有可显示的文字。',
  }

  interface Props {
    children: Snippet
    document: ConstellationIndexDocument | EntryIndexDocument
    kind: ArchiveIndexKind
    page: number
    page_count: number
    path: string
    total: number
  }

  let { children, document, kind, page, page_count, path, total }: Props =
    $props()
  const empty_message = $derived(empty_messages[kind])
</script>

<ReadingPlane {kind}>
  <section id="content" class="archive-index" data-collection={kind}>
    <IndexHeader
      description={document.frontmatter.description}
      kind_label={document.frontmatter.kind}
      {page}
      {page_count}
      {total}
      title={document.frontmatter.title}
    />

    {#if document.nodes.length}
      <div class="index-prose">
        <Content {document} font={document.frontmatter.font} />
      </div>
    {/if}

    <div class="archive-seam">
      <PaperSeam />
    </div>

    {#if total}
      <Pagination placement="before" {page} {page_count} {path} />
      {@render children()}
      <Pagination placement="after" {page} {page_count} {path} />
    {:else}
      <p class="archive-empty">{empty_message}</p>
    {/if}
  </section>
</ReadingPlane>

<style>
  .archive-index {
    min-width: 0;
  }

  .archive-index[data-collection='records']
    :global(.archive-index-header h1) {
    font-size: clamp(1.65rem, 2.5vw, 2.25rem);
    font-weight: 650;
    line-height: 1.25;
  }

  .archive-index[data-collection='voidknot']
    :global(.archive-index-header h1) {
    font-size: clamp(2rem, 3.4vw, 3rem);
  }

  .archive-index[data-collection='voidknot'] .index-prose {
    max-width: 36rem;
  }

  .index-prose {
    max-width: 40rem;
    margin: 1.375rem 0 clamp(2.5rem, 6vw, 4.5rem);
  }

  .archive-seam {
    width: calc(100% + var(--inline-gutter) * 2);
    margin: clamp(2.5rem, 6vw, 4.5rem) calc(-1 * var(--inline-gutter)) 0;
  }

  .archive-empty {
    margin: clamp(1.75rem, 4vw, 2.75rem) 0 0 var(--archive-content-inset);
    color: var(--color-muted);
    font-size: 0.8125rem;
    line-height: 1.6;
  }
</style>

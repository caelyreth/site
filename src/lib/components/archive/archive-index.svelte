<script lang="ts">
  import Content from '$lib/components/markdown/document.svelte'
  import type {
    ConstellationIndexDocument,
    RecordIndexDocument,
  } from '$lib/content/schema'
  import type { Snippet } from 'svelte'

  import IndexHeader from './index-header.svelte'
  import Pagination from './pagination.svelte'
  import ReadingPlane from './reading-plane.svelte'

  interface Props {
    children: Snippet
    document: ConstellationIndexDocument | RecordIndexDocument
    kind: 'constellations' | 'records'
    page: number
    page_count: number
    path: string
  }

  let { children, document, kind, page, page_count, path }: Props = $props()
</script>

<ReadingPlane {kind}>
  <section id="content" class="archive-index">
    <IndexHeader
      description={document.frontmatter.description}
      {kind}
      kind_label={document.frontmatter.kind}
      title={document.frontmatter.title}
    />

    {#if document.nodes.length}
      <div class="index-prose">
        <Content {document} font={document.frontmatter.font} />
      </div>
    {/if}

    {@render children()}
    <Pagination {page} {page_count} {path} />
  </section>
</ReadingPlane>

<style>
  .archive-index {
    min-width: 0;
  }

  .index-prose {
    max-width: 41rem;
    margin-block: 1.5rem clamp(2rem, 5vw, 3.5rem);
  }
</style>

<script lang="ts">
  import { base } from '$app/paths'
  import Content from '$lib/components/markdown/document.svelte'
  import type {
    ConstellationSummary,
    RecordSummary,
  } from '$lib/content/relations'
  import type {
    ConstellationDocument,
    ContentPage,
  } from '$lib/content/schema'

  import EntryHeader from './entry-header.svelte'
  import Pagination from './pagination.svelte'
  import ReadingPlane from './reading-plane.svelte'
  import RecordTrajectory from './record-trajectory.svelte'

  interface Props {
    document: ConstellationDocument
    entries: ContentPage<RecordSummary>
    constellation: ConstellationSummary
  }

  let { document, entries, constellation }: Props = $props()
  const back_href = `${base}/constellations`.replace('//', '/')
  const constellation_path = $derived(`/constellations/${constellation.id}`)
</script>

<ReadingPlane kind="constellations">
  <article id="content" class="constellation-detail">
    <EntryHeader
      {back_href}
      back_label="星群"
      meta={`${constellation.entry_count} 篇关联记录`}
      summary={constellation.summary}
      title={constellation.title}
    >
      {#snippet children()}
        <div class="constellation-intro">
          <Content {document} font={document.frontmatter.font} />
        </div>
      {/snippet}
    </EntryHeader>

    <section
      class="constellation-records"
      aria-label={`${constellation.title}中的记录`}
    >
      <h2>停靠于此的记录</h2>
      <RecordTrajectory
        entries={entries.entries}
        show_constellations={false}
      />
      <Pagination
        page={entries.page}
        page_count={entries.page_count}
        path={constellation_path}
      />
    </section>
  </article>
</ReadingPlane>

<style>
  .constellation-detail {
    min-width: 0;
  }

  :global(.archive-entry-header),
  .constellation-records {
    width: 100%;
  }

  .constellation-intro {
    max-width: 41rem;
    margin-top: 1.5rem;
  }

  .constellation-records {
    margin-top: clamp(3.5rem, 8vw, 6rem);
  }

  .constellation-records h2 {
    margin: 0 0 1rem;
    color: var(--color-text-secondary);
    font-family: var(--font-stack-sans);
    font-size: 0.75rem;
    font-weight: 500;
    letter-spacing: 0.06em;
    line-height: 1.5;
  }

  .constellation-records :global(.archive-list) {
    border-top: 1px solid var(--color-boundary);
  }
</style>

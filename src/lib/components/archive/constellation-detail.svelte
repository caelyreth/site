<script lang="ts">
  import Content from '$lib/components/markdown/document.svelte'
  import { get_library_config } from '$lib/content/library'
  import type {
    ConstellationSummary,
    EntrySummary,
  } from '$lib/content/relations'
  import type {
    ConstellationDocument,
    ContentPage,
  } from '$lib/content/schema'
  import { format_template } from '$lib/content/site'
  import { site_href } from '$lib/navigation/path'

  import EntryHeader from './entry-header.svelte'
  import EntryList from './entry-list.svelte'
  import Pagination from './pagination.svelte'
  import ReadingPlane from './reading-plane.svelte'

  interface Props {
    document: ConstellationDocument
    entries: ContentPage<EntrySummary>
    constellation: ConstellationSummary
  }

  let { document, entries, constellation }: Props = $props()
  const library = get_library_config()
  const back_href = site_href('/constellations')
  const constellation_path = $derived(`/constellations/${constellation.id}`)
</script>

<ReadingPlane kind="constellations">
  <article id="content" class="constellation-detail">
    <EntryHeader
      {back_href}
      back_label={library.current.constellations.back_label}
      meta={format_template(
        library.current.constellations.entry_count_label,
        {
          count: constellation.entry_count,
        },
      )}
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
      class="constellation-entries"
      aria-label={format_template(
        library.current.constellations.entries_navigation_label,
        {
          entries: library.current.constellations.entries_label,
          title: constellation.title,
        },
      )}
    >
      <h2>{library.current.constellations.entries_label}</h2>
      {#if entries.total}
        <Pagination
          placement="before"
          page={entries.page}
          page_count={entries.page_count}
          path={constellation_path}
        />
        <EntryList
          entries={entries.entries}
          show_collection
          show_constellations={false}
        />
        <Pagination
          placement="after"
          page={entries.page}
          page_count={entries.page_count}
          path={constellation_path}
        />
      {:else}
        <p class="constellation-empty">尚无关联文字。</p>
      {/if}
    </section>
  </article>
</ReadingPlane>

<style>
  .constellation-detail {
    min-width: 0;
  }

  :global(.archive-entry-header),
  .constellation-entries {
    width: 100%;
  }

  .constellation-intro {
    max-width: 41rem;
    margin-top: 1.5rem;
  }

  .constellation-entries {
    margin-top: clamp(3.5rem, 8vw, 6rem);
  }

  .constellation-entries h2 {
    margin: 0 0 1rem;
    color: var(--color-text-secondary);
    font-family: var(--font-stack-sans);
    font-size: 0.75rem;
    font-weight: 500;
    letter-spacing: 0.06em;
    line-height: 1.5;
  }

  .constellation-entries :global(.archive-list) {
    border-top: 1px solid var(--color-boundary);
  }

  .constellation-empty {
    margin: 1.25rem 0 0;
    color: var(--color-muted);
    font-size: 0.8125rem;
    line-height: 1.6;
  }
</style>

<script lang="ts">
  import Content from '$lib/components/markdown/document.svelte'
  import { entry_path, type EntryCollection } from '$lib/content/entries'
  import { get_library_config } from '$lib/content/library'
  import type { ConstellationReference } from '$lib/content/relations'
  import type { EntryDocument } from '$lib/content/schema'
  import { site_href } from '$lib/navigation/path'

  import BackLink from './back-link.svelte'
  import ConstellationLinks from './constellation-links.svelte'
  import { format_published_date } from './date'
  import EntryHeader from './entry-header.svelte'
  import ReadingPlane from './reading-plane.svelte'

  interface Props {
    collection: EntryCollection
    constellations: ConstellationReference[]
    document: EntryDocument
  }

  let { collection, constellations, document }: Props = $props()
  const library = get_library_config()
  const collection_config = $derived(library.current.entries[collection])
  const collection_href = $derived(site_href(entry_path(collection)))
</script>

<ReadingPlane kind={collection}>
  <article id="content" class="entry-detail" data-collection={collection}>
    <EntryHeader
      back_href={collection_href}
      back_label={collection_config.title}
      {collection}
      meta={`${collection_config.meta_label} / ${format_published_date(document.frontmatter.published, 'long')}`}
      summary={document.frontmatter.summary}
      title={document.frontmatter.title}
    >
      {#snippet children()}
        <ConstellationLinks {constellations} />
      {/snippet}
    </EntryHeader>

    <div class="entry-body">
      <Content {document} font={document.frontmatter.font} />
    </div>

    <footer class="entry-footer">
      <BackLink
        href={collection_href}
        label={collection_config.back_label}
      />
    </footer>
  </article>
</ReadingPlane>

<style>
  .entry-detail {
    min-width: 0;
  }

  :global(.archive-entry-header),
  .entry-body,
  .entry-footer {
    width: 100%;
  }

  .entry-detail[data-collection='records'] .entry-body {
    margin-top: clamp(2.25rem, 5vw, 3.5rem);
  }

  .entry-detail[data-collection='voidknot'] .entry-body {
    margin-top: clamp(3.5rem, 8vw, 5.5rem);
  }

  .entry-body {
    margin-top: clamp(2.75rem, 7vw, 5rem);
  }

  .entry-footer {
    margin-top: clamp(2.75rem, 7vw, 5rem);
    padding-block: 1rem clamp(2.5rem, 6vw, 4.5rem);
    border-top: 1px solid var(--color-boundary);
  }
</style>

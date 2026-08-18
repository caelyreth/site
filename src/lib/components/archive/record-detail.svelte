<script lang="ts">
  import Content from '$lib/components/markdown/document.svelte'
  import { get_library_config } from '$lib/content/library'
  import type { ConstellationReference } from '$lib/content/relations'
  import type { RecordDocument } from '$lib/content/schema'
  import { site_href } from '$lib/navigation/path'

  import BackLink from './back-link.svelte'
  import ConstellationLinks from './constellation-links.svelte'
  import EntryHeader from './entry-header.svelte'
  import ReadingPlane from './reading-plane.svelte'

  interface Props {
    constellations: ConstellationReference[]
    document: RecordDocument
  }

  let { constellations, document }: Props = $props()
  const library = get_library_config()
  const records_href = site_href('/records')
  const date_formatter = new Intl.DateTimeFormat('zh-CN', {
    day: 'numeric',
    month: 'long',
    timeZone: 'UTC',
    year: 'numeric',
  })

  function display_date(value: string) {
    return date_formatter.format(new Date(`${value}T00:00:00Z`))
  }
</script>

<ReadingPlane kind="record">
  <article id="content" class="record-detail">
    <EntryHeader
      back_href={records_href}
      back_label={library.current.records.title}
      meta={`${library.current.records.meta_label} / ${display_date(document.frontmatter.published)}`}
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
        href={records_href}
        label={library.current.records.back_label}
      />
    </footer>
  </article>
</ReadingPlane>

<style>
  .record-detail {
    min-width: 0;
  }

  :global(.archive-entry-header),
  .entry-body,
  .entry-footer {
    width: 100%;
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

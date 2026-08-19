<script lang="ts">
  import type { EntryCollection } from '$lib/content/entries'
  import type { EntrySummary } from '$lib/content/relations'
  import type { ContentPage, EntryIndexDocument } from '$lib/content/schema'

  import ArchiveIndex from './archive-index.svelte'
  import EntryList from './entry-list.svelte'

  interface Props {
    collection: EntryCollection
    document: EntryIndexDocument
    entries: ContentPage<EntrySummary>
  }

  let { collection, document, entries }: Props = $props()
</script>

<ArchiveIndex
  {document}
  kind={collection}
  page={entries.page}
  page_count={entries.page_count}
  path={`/${collection}`}
  total={entries.total}
>
  {#snippet children()}
    <EntryList {collection} entries={entries.entries} />
  {/snippet}
</ArchiveIndex>

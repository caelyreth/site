<script lang="ts">
  import type { RecordSummary } from '$lib/content/relations'
  import type {
    ContentPage,
    RecordIndexDocument,
  } from '$lib/content/schema'

  import ArchiveIndex from './archive-index.svelte'
  import RecordTrajectory from './record-trajectory.svelte'

  interface Props {
    document: RecordIndexDocument
    records: ContentPage<RecordSummary>
  }

  let { document, records }: Props = $props()
</script>

<ArchiveIndex
  {document}
  kind="records"
  page={records.page}
  page_count={records.page_count}
  path="/records"
>
  {#snippet children()}
    <RecordTrajectory entries={records.entries} />
  {/snippet}
</ArchiveIndex>

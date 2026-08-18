<script lang="ts">
  import type { ConstellationSummary } from '$lib/content/relations'
  import type {
    ConstellationIndexDocument,
    ContentPage,
  } from '$lib/content/schema'

  import ArchiveIndex from './archive-index.svelte'
  import ArchiveList from './archive-list.svelte'
  import ConstellationStrand from './constellation-strand.svelte'

  interface Props {
    constellations: ContentPage<ConstellationSummary>
    document: ConstellationIndexDocument
  }

  let { constellations, document }: Props = $props()
</script>

<ArchiveIndex
  {document}
  kind="constellations"
  page={constellations.page}
  page_count={constellations.page_count}
  path="/constellations"
>
  {#snippet children()}
    <ArchiveList>
      {#each constellations.entries as constellation}
        <li><ConstellationStrand {constellation} /></li>
      {/each}
    </ArchiveList>
  {/snippet}
</ArchiveIndex>

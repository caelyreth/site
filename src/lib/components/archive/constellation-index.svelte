<script lang="ts">
  import type { ConstellationSummary } from '$lib/content/relations'
  import type { ContentPage } from '$lib/content/schema'

  import ArchiveList from './archive-list.svelte'
  import ConstellationStrand from './constellation-strand.svelte'
  import IndexHeader from './index-header.svelte'
  import Pagination from './pagination.svelte'
  import ReadingPlane from './reading-plane.svelte'

  interface Props {
    constellations: ContentPage<ConstellationSummary>
  }

  let { constellations }: Props = $props()
</script>

<ReadingPlane kind="constellations">
  <section id="content" class="constellation-index">
    <IndexHeader
      kind="constellations"
      title="星群"
      description="同一个问题会在不同的记录中显出不同的位置；它们不必归类，只需彼此可见。"
    />

    <ArchiveList>
      {#each constellations.entries as constellation}
        <li><ConstellationStrand {constellation} /></li>
      {/each}
    </ArchiveList>

    <Pagination
      page={constellations.page}
      page_count={constellations.page_count}
      path="/constellations"
    />
  </section>
</ReadingPlane>

<style>
  .constellation-index {
    min-width: 0;
  }
</style>

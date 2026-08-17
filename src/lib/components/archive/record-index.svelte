<script lang="ts">
  import type { RecordSummary } from '$lib/content/library'
  import type { Page } from '$lib/content/pagination'

  import IndexHeader from './index-header.svelte'
  import Pagination from './pagination.svelte'
  import ReadingPlane from './reading-plane.svelte'
  import RecordTrajectory from './record-trajectory.svelte'

  interface Props {
    records: Page<RecordSummary>
  }

  let { records }: Props = $props()
</script>

<ReadingPlane kind="records">
  <section id="content" class="record-index">
    <IndexHeader
      kind="records"
      title="记录"
      description="从中继站留存下来的文字：关于房间、工具、等待，以及尚未完全定形的念头。"
    />

    <RecordTrajectory entries={records.entries} />
    <Pagination
      page={records.page}
      page_count={records.page_count}
      path="/records"
    />
  </section>
</ReadingPlane>

<style>
  .record-index {
    min-width: 0;
  }
</style>

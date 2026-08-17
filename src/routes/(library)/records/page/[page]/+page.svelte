<script lang="ts">
  import RecordIndex from '$lib/components/archive/record-index.svelte'

  import type { PageData } from './$types'

  let { data }: { data: PageData } = $props()
</script>

<svelte:head>
  <title>记录 / 第 {data.records.page} 页 / Caelyreth</title>
</svelte:head>

<RecordIndex records={data.records} />

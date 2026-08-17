<script lang="ts">
  import RecordIndex from '$lib/components/archive/record-index.svelte'

  import type { PageData } from './$types'

  let { data }: { data: PageData } = $props()
</script>

<svelte:head>
  <title>记录 / Caelyreth</title>
  <meta name="description" content="留存在 Caelyreth 中继站的文字记录。" />
</svelte:head>

<RecordIndex records={data.records} />

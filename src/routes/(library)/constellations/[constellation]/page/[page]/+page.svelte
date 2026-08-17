<script lang="ts">
  import ConstellationDetail from '$lib/components/archive/constellation-detail.svelte'

  import type { PageData } from './$types'

  let { data }: { data: PageData } = $props()
</script>

<svelte:head>
  <title
    >{data.constellation.title} / 第 {data.entries.page} 页 / 星群 / Caelyreth</title
  >
</svelte:head>

<ConstellationDetail
  document={data.document}
  entries={data.entries}
  constellation={data.constellation}
/>

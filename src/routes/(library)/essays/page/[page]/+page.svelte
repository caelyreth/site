<script lang="ts">
  import EssayIndex from '$lib/components/archive/essay-index.svelte'

  import type { PageData } from './$types'

  let { data }: { data: PageData } = $props()
</script>

<svelte:head>
  <title>随笔 / 第 {data.essays.page} 页 / Caelyreth</title>
</svelte:head>

<EssayIndex essays={data.essays} />

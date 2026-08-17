<script lang="ts">
  import ConstellationIndex from '$lib/components/archive/constellation-index.svelte'

  import type { PageData } from './$types'

  let { data }: { data: PageData } = $props()
</script>

<svelte:head>
  <title>星群 / 第 {data.constellations.page} 页 / Caelyreth</title>
</svelte:head>

<ConstellationIndex constellations={data.constellations} />

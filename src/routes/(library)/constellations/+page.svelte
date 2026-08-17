<script lang="ts">
  import ConstellationIndex from '$lib/components/archive/constellation-index.svelte'

  import type { PageData } from './$types'

  let { data }: { data: PageData } = $props()
</script>

<svelte:head>
  <title>星群 / Caelyreth</title>
  <meta
    name="description"
    content="在 Caelyreth 中继站的记录之间彼此回响的主题。"
  />
</svelte:head>

<ConstellationIndex constellations={data.constellations} />

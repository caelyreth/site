<script lang="ts">
  import EssayIndex from '$lib/components/archive/essay-index.svelte'

  import type { PageData } from './$types'

  let { data }: { data: PageData } = $props()
</script>

<svelte:head>
  <title>Essays / Page {data.essays.page} / Caelyreth</title>
</svelte:head>

<EssayIndex essays={data.essays} />

<script lang="ts">
  import EssayIndex from '$lib/components/archive/essay-index.svelte'

  import type { PageData } from './$types'

  let { data }: { data: PageData } = $props()
</script>

<svelte:head>
  <title>Essays / Caelyreth</title>
  <meta
    name="description"
    content="Essays held at the edge of the Caelyreth relay station."
  />
</svelte:head>

<EssayIndex essays={data.essays} />

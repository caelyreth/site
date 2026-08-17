<script lang="ts">
  import EssayIndex from '$lib/components/archive/essay-index.svelte'

  import type { PageData } from './$types'

  let { data }: { data: PageData } = $props()
</script>

<svelte:head>
  <title>随笔 / Caelyreth</title>
  <meta name="description" content="写在 Caelyreth 中继站边缘的随笔。" />
</svelte:head>

<EssayIndex essays={data.essays} />

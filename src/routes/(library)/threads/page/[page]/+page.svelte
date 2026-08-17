<script lang="ts">
  import ThreadIndex from '$lib/components/archive/thread-index.svelte'

  import type { PageData } from './$types'

  let { data }: { data: PageData } = $props()
</script>

<svelte:head>
  <title>线索 / 第 {data.threads.page} 页 / Caelyreth</title>
</svelte:head>

<ThreadIndex threads={data.threads} />

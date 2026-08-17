<script lang="ts">
  import ThreadIndex from '$lib/components/archive/thread-index.svelte'

  import type { PageData } from './$types'

  let { data }: { data: PageData } = $props()
</script>

<svelte:head>
  <title>Threads / Page {data.threads.page} / Caelyreth</title>
</svelte:head>

<ThreadIndex threads={data.threads} />

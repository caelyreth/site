<script lang="ts">
  import ThreadDetail from '$lib/components/archive/thread-detail.svelte'

  import type { PageData } from './$types'

  let { data }: { data: PageData } = $props()
</script>

<svelte:head>
  <title
    >{data.thread.title} / Page {data.entries.page} / Threads / Caelyreth</title
  >
</svelte:head>

<ThreadDetail
  document={data.document}
  entries={data.entries}
  thread={data.thread}
/>

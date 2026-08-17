<script lang="ts">
  import ThreadDetail from '$lib/components/archive/thread-detail.svelte'

  import type { PageData } from './$types'

  let { data }: { data: PageData } = $props()
</script>

<svelte:head>
  <title>{data.thread.title} / 线索 / Caelyreth</title>
  <meta name="description" content={data.thread.summary} />
</svelte:head>

<ThreadDetail
  document={data.document}
  entries={data.entries}
  thread={data.thread}
/>

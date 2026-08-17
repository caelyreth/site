<script lang="ts">
  import ThreadIndex from '$lib/components/archive/thread-index.svelte'

  import type { PageData } from './$types'

  let { data }: { data: PageData } = $props()
</script>

<svelte:head>
  <title>Threads / Caelyreth</title>
  <meta
    name="description"
    content="Connections that recur across essays at the Caelyreth relay station."
  />
</svelte:head>

<ThreadIndex threads={data.threads} />

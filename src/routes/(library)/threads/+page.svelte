<script lang="ts">
  import ThreadIndex from '$lib/components/content/thread-index.svelte'

  import type { PageData } from './$types'

  /* oxlint-disable prefer-const -- Route data updates during navigation. */
  let { data }: { data: PageData } = $props()
</script>

<svelte:head>
  <title>Threads / Caelyreth</title>
  <meta
    name="description"
    content="Cross-collection threads through the Caelyreth archive."
  />
</svelte:head>

<ThreadIndex threads={data.threads} />

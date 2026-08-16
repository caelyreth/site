<script lang="ts">
  import CollectionPage from '$lib/components/content/collection-page.svelte'
  import { thread_label } from '$lib/content/threads'

  import type { PageData } from './$types'

  /* oxlint-disable prefer-const -- Route data updates during navigation. */
  let { data }: { data: PageData } = $props()
  const title = $derived(thread_label(data.thread))
</script>

<svelte:head>
  <title>{title} / Threads / Caelyreth</title>
  <meta
    name="description"
    content={`Entries connected through the ${title} thread.`}
  />
</svelte:head>

<CollectionPage
  description={`A cross-collection path through entries concerned with ${title.toLowerCase()}.`}
  entries={data.entries}
  eyebrow="Cross-collection thread"
  {title}
/>

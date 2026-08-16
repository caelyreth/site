<script lang="ts">
  import CollectionPage from '$lib/components/content/collection-page.svelte'

  import type { PageData } from './$types'

  /* oxlint-disable prefer-const -- Route data updates during navigation. */
  let { data }: { data: PageData } = $props()
</script>

<svelte:head>
  <title>Maps / Caelyreth</title>
  <meta
    name="description"
    content="Curated paths through articles, essays, and the questions between them."
  />
</svelte:head>

<CollectionPage
  description="Curated paths through articles, essays, and the questions between them."
  entries={data.entries}
  eyebrow="Curated paths"
  section="maps"
  title="Maps"
/>

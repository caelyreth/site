<script lang="ts">
  import CollectionPage from '$lib/components/content/collection-page.svelte'

  import type { PageData } from './$types'

  /* oxlint-disable prefer-const -- Route data updates during navigation. */
  let { data }: { data: PageData } = $props()
</script>

<svelte:head>
  <title>Articles / Caelyreth</title>
  <meta
    name="description"
    content="Technical articles on software, systems, and the craft of building them."
  />
</svelte:head>

<CollectionPage
  description="Technical notes on software, systems, and the craft of building them."
  entries={data.entries}
  eyebrow="Technical archive"
  section="articles"
  title="Articles"
/>

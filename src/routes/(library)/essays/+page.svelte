<script lang="ts">
  import CollectionPage from '$lib/components/content/collection-page.svelte'

  import type { PageData } from './$types'

  /* oxlint-disable prefer-const -- Route data updates during navigation. */
  let { data }: { data: PageData } = $props()
</script>

<svelte:head>
  <title>Essays / Caelyreth</title>
  <meta
    name="description"
    content="Essays on social texture, attention, place, and the shape of ordinary life."
  />
</svelte:head>

<CollectionPage
  description="Reflective writing on social texture, attention, place, and the shape of ordinary life."
  entries={data.entries}
  eyebrow="Reflective archive"
  section="essays"
  title="Essays"
/>

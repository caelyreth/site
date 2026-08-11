<script lang="ts">
  import ContentPage from '$lib/components/station/content-page.svelte'

  import type { PageData } from './$types'

  /* oxlint-disable prefer-const -- Route data updates during client navigation. */
  let { data }: { data: PageData } = $props()
</script>

<ContentPage document={data.document} />

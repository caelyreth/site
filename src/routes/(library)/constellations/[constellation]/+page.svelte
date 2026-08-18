<script lang="ts">
  import ConstellationDetail from '$lib/components/archive/constellation-detail.svelte'
  import PageMeta from '$lib/components/layout/page-meta.svelte'
  import { get_library_config } from '$lib/content/library'
  import { get_site_config, site_title } from '$lib/content/site'

  import type { PageData } from './$types'

  let { data }: { data: PageData } = $props()
  const library = get_library_config()
  const site = get_site_config()
</script>

<PageMeta
  description={data.constellation.summary}
  title={site_title(
    site.current,
    data.constellation.title,
    library.current.constellations.title,
  )}
  type="article"
/>

<ConstellationDetail
  document={data.document}
  entries={data.entries}
  constellation={data.constellation}
/>

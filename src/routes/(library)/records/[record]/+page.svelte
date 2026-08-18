<script lang="ts">
  import RecordDetail from '$lib/components/archive/record-detail.svelte'
  import PageMeta from '$lib/components/layout/page-meta.svelte'
  import { get_library_config } from '$lib/content/library'
  import { get_site_config, site_title } from '$lib/content/site'

  import type { PageData } from './$types'

  let { data }: { data: PageData } = $props()
  const library = get_library_config()
  const site = get_site_config()
</script>

<PageMeta
  description={data.document.frontmatter.summary}
  title={site_title(
    site.current,
    data.document.frontmatter.title,
    library.current.records.title,
  )}
  type="article"
/>

<RecordDetail
  constellations={data.constellations}
  document={data.document}
/>

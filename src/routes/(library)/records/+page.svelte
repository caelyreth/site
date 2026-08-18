<script lang="ts">
  import RecordIndex from '$lib/components/archive/record-index.svelte'
  import PageMeta from '$lib/components/layout/page-meta.svelte'
  import { get_site_config, site_title } from '$lib/content/site'

  import type { PageData } from './$types'

  let { data }: { data: PageData } = $props()
  const site = get_site_config()
</script>

<PageMeta
  description={data.index.frontmatter.description}
  title={site_title(site.current, data.index.frontmatter.title)}
/>

<RecordIndex document={data.index} records={data.records} />

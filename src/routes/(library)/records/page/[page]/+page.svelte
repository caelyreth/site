<script lang="ts">
  import RecordIndex from '$lib/components/archive/record-index.svelte'
  import PageMeta from '$lib/components/layout/page-meta.svelte'
  import {
    format_template,
    get_site_config,
    site_title,
  } from '$lib/content/site'

  import type { PageData } from './$types'

  let { data }: { data: PageData } = $props()
  const site = get_site_config()
  const page_label = $derived(
    format_template(site.current.pagination.label, {
      page: data.records.page,
    }),
  )
</script>

<PageMeta
  description={format_template(site.current.seo.page_description, {
    description: data.index.frontmatter.description,
    page: page_label,
  })}
  title={site_title(site.current, data.index.frontmatter.title, page_label)}
/>

<RecordIndex document={data.index} records={data.records} />

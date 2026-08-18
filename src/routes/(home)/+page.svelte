<script lang="ts">
  import PageMeta from '$lib/components/layout/page-meta.svelte'
  import Content from '$lib/components/markdown/document.svelte'

  import type { PageData } from './$types'

  let { data }: { data: PageData } = $props()
</script>

<PageMeta
  description={data.document.frontmatter.description}
  title={data.document.frontmatter.title}
/>

<Content document={data.document} font={data.document.frontmatter.font} />

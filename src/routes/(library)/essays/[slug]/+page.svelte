<script lang="ts">
  import EssayDetail from '$lib/components/archive/essay-detail.svelte'

  import type { PageData } from './$types'

  let { data }: { data: PageData } = $props()
</script>

<svelte:head>
  <title>{data.document.frontmatter.title} / Essays / Caelyreth</title>
  <meta name="description" content={data.document.frontmatter.summary} />
</svelte:head>

<EssayDetail document={data.document} />

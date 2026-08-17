<script lang="ts">
  import RecordDetail from '$lib/components/archive/record-detail.svelte'

  import type { PageData } from './$types'

  let { data }: { data: PageData } = $props()
</script>

<svelte:head>
  <title>{data.document.frontmatter.title} / 记录 / Caelyreth</title>
  <meta name="description" content={data.document.frontmatter.summary} />
</svelte:head>

<RecordDetail document={data.document} />

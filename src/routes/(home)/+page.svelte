<script lang="ts">
  import Content from '$lib/components/markdown/document.svelte'

  import type { PageData } from './$types'

  let { data }: { data: PageData } = $props()
</script>

<svelte:head>
  <title>{data.document.frontmatter.title}</title>
  {#if data.document.frontmatter.description}
    <meta
      name="description"
      content={data.document.frontmatter.description}
    />
  {/if}
</svelte:head>

<Content document={data.document} />

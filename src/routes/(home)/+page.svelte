<script lang="ts">
  import Content from '$lib/content/render.svelte'

  import type { PageData } from './$types'

  /* oxlint-disable prefer-const -- Route data updates during client navigation. */
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

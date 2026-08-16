<script lang="ts">
  import EntryView from '$lib/components/content/entry-view.svelte'

  import type { PageData } from './$types'

  /* oxlint-disable prefer-const -- Route data updates during navigation. */
  let { data }: { data: PageData } = $props()
</script>

<svelte:head>
  <title>{data.document.frontmatter.title} / Articles / Caelyreth</title>
  {#if data.document.frontmatter.description || data.document.frontmatter.summary}
    <meta
      name="description"
      content={data.document.frontmatter.summary ??
        data.document.frontmatter.description}
    />
  {/if}
</svelte:head>

<EntryView
  back_label="Articles"
  back_path="/articles"
  document={data.document}
  profile="article"
  section_label="Technical article"
/>

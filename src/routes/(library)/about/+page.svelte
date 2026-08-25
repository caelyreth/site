<script lang="ts">
  import PageMeta from '$lib/components/layout/page-meta.svelte'
  import Content from '$lib/components/markdown/document.svelte'
  import { get_site_config, site_title } from '$lib/content/site'

  import type { PageData } from './$types'

  let { data }: { data: PageData } = $props()
  const site = get_site_config()
</script>

<PageMeta
  description={data.document.frontmatter.description}
  title={site_title(site.current, data.document.frontmatter.title)}
  type="article"
/>

<article id="content" class="about-document">
  <h1 class="sr-only">{data.document.frontmatter.title}</h1>
  <Content document={data.document} font={data.document.frontmatter.font} />
</article>

<style>
  .about-document {
    box-sizing: border-box;
    width: min(100%, 48rem);
    min-height: max(100svh - var(--header-block-size), 34rem);
    margin-inline: auto;
    padding: clamp(3rem, 8vw, 6rem) var(--inline-gutter)
      clamp(4rem, 10vw, 7rem);
  }

  @media (width < 40rem) {
    .about-document {
      min-height: 100dvh;
      padding-top: clamp(4.75rem, 16svh, 7rem);
    }
  }
</style>

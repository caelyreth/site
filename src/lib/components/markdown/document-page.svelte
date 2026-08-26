<script lang="ts">
  import Giscus from '$lib/components/comments/giscus.svelte'
  import PageMeta from '$lib/components/layout/page-meta.svelte'
  import type { PageDocument } from '$lib/content/schema'
  import { get_site_config, site_title } from '$lib/content/site'

  import Content from './document.svelte'

  interface Props {
    document: PageDocument
  }

  let { document }: Props = $props()
  const site = get_site_config()
</script>

<PageMeta
  description={document.frontmatter.description}
  title={site_title(site.current, document.frontmatter.title)}
  type="article"
/>

<article id="content" class="document-page">
  <h1 class="sr-only">{document.frontmatter.title}</h1>
  <Content {document} font={document.frontmatter.font} />
  <Giscus
    config={site.current.comments}
    term={document.frontmatter.title}
  />
</article>

<style>
  .document-page {
    box-sizing: border-box;
    width: min(100%, 48rem);
    min-height: max(100svh - var(--header-block-size), 34rem);
    margin-inline: auto;
    padding: clamp(3rem, 8vw, 6rem) var(--inline-gutter)
      clamp(4rem, 10vw, 7rem);
  }

  @media (width < 40rem) {
    .document-page {
      min-height: 100dvh;
      padding-top: clamp(4.75rem, 16svh, 7rem);
    }
  }
</style>

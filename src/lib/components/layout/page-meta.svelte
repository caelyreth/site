<script lang="ts">
  import { page } from '$app/state'
  import { env } from '$env/dynamic/public'
  import { get_site_config } from '$lib/content/site'

  interface Props {
    description?: string
    title: string
    type?: 'article' | 'website'
  }

  let { description, title, type = 'website' }: Props = $props()
  const site = get_site_config()
  const meta_description = $derived(description ?? site.current.description)

  const canonical_url = $derived.by(() => {
    const origin = env.PUBLIC_SITE_ORIGIN?.trim()
    if (!origin) return undefined

    try {
      return new URL(page.url.pathname, origin).toString()
    } catch {
      return undefined
    }
  })
</script>

<svelte:head>
  <title>{title}</title>
  <meta
    name="robots"
    content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1"
  />
  <meta property="og:locale" content={site.current.seo.locale} />
  <meta property="og:site_name" content={site.current.title} />
  <meta property="og:title" content={title} />
  <meta property="og:type" content={type} />
  <meta name="twitter:card" content="summary" />
  <meta name="twitter:title" content={title} />
  <meta name="description" content={meta_description} />
  <meta property="og:description" content={meta_description} />
  <meta name="twitter:description" content={meta_description} />
  {#if canonical_url}
    <link rel="canonical" href={canonical_url} />
    <meta property="og:url" content={canonical_url} />
  {/if}
</svelte:head>

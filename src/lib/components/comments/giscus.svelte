<script lang="ts">
  import { page } from '$app/state'
  import type { SiteConfig } from '$lib/content/schema'
  import { site_href } from '$lib/navigation/path'
  import type { Repo } from '@giscus/svelte'
  import { onMount } from 'svelte'
  import { useTheme } from 'svelte-themes'

  interface Props {
    config: SiteConfig['comments']
  }

  let { config }: Props = $props()
  let container = $state<HTMLElement>()
  type GiscusComponent = typeof import('@giscus/svelte').default
  let Giscus = $state<GiscusComponent>()
  const theme = useTheme()
  const theme_url = $derived.by(() => {
    const file =
      theme.resolvedTheme === 'dark'
        ? '/giscus-dark.css'
        : '/giscus-light.css'
    return new URL(site_href(file), page.url.origin).href
  })

  onMount(() => {
    if (!container) return

    let disposed = false
    let observer: IntersectionObserver | undefined

    const load_giscus = async () => {
      if (Giscus) return
      const { default: giscus } = await import('@giscus/svelte')
      if (!disposed) Giscus = giscus
    }

    if ('IntersectionObserver' in window) {
      observer = new IntersectionObserver(
        ([entry]) => {
          if (!entry?.isIntersecting) return
          void load_giscus()
          observer?.disconnect()
        },
        { rootMargin: '640px 0px' },
      )
      observer.observe(container)
    } else {
      void load_giscus()
    }

    return () => {
      disposed = true
      observer?.disconnect()
    }
  })
</script>

<section
  aria-labelledby="comments-title"
  bind:this={container}
  class="comments"
>
  <header class="comments-header">
    <div>
      <p class="micro-label">DISCUSSION CHANNEL</p>
      <h2 id="comments-title">{config.title}</h2>
      <p class="comments-description">{config.description}</p>
    </div>
    <span aria-hidden="true" class="i-ri-chat-3-line comments-icon"></span>
  </header>

  <div class="comments-body">
    {#if Giscus}
      {#key theme_url}
        <Giscus
          category={config.category}
          categoryId={config.category_id}
          emitMetadata={config.emit_metadata}
          id="giscus-comments"
          inputPosition={config.input_position}
          lang={config.language}
          loading="lazy"
          mapping={config.mapping}
          reactionsEnabled={config.reactions_enabled}
          repo={config.repo as Repo}
          repoId={config.repo_id}
          strict={config.strict}
          term={page.url.pathname}
          theme={theme_url}
        />
      {/key}
    {:else}
      <div aria-hidden="true" class="comments-placeholder">
        <span
          aria-hidden="true"
          class="placeholder-line placeholder-line-wide"
        ></span>
        <span aria-hidden="true" class="placeholder-line"></span>
      </div>
    {/if}
  </div>
</section>

<style>
  .comments {
    --comments-rule: color-mix(
      in oklab,
      var(--color-boundary) 78%,
      transparent
    );
    --comments-surface: color-mix(
      in oklab,
      var(--color-prose-surface) 72%,
      var(--color-paper)
    );
    width: 100%;
    margin-top: clamp(3rem, 8vw, 5.5rem);
    border-block: 1px solid var(--comments-rule);
    background: var(--comments-surface);
  }

  .comments-header {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 1.5rem;
    padding: clamp(1.25rem, 3vw, 1.75rem) var(--inline-gutter)
      clamp(1rem, 2.5vw, 1.5rem);
    border-bottom: 1px solid var(--comments-rule);
  }

  .comments-header h2 {
    margin: 0.5rem 0 0;
    color: var(--color-text);
    font-family: var(--font-stack-serif);
    font-size: clamp(1.2rem, 2vw, 1.5rem);
    font-weight: 650;
    line-height: 1.25;
  }

  .comments-description {
    max-width: 34rem;
    margin: 0.5rem 0 0;
    color: var(--color-text-secondary);
    font-size: 0.875rem;
    line-height: 1.55;
  }

  .comments-icon {
    flex: none;
    width: 1.25rem;
    height: 1.25rem;
    margin-top: 0.2rem;
    color: var(--color-muted);
    font-size: 1.25rem;
  }

  .comments-body {
    min-width: 0;
    padding: clamp(1rem, 3vw, 1.75rem) var(--inline-gutter)
      clamp(1.25rem, 3vw, 2rem);
  }

  .comments-body :global(giscus-widget) {
    display: block;
    width: 100%;
  }

  .comments-placeholder {
    display: grid;
    gap: 0.75rem;
    padding-block: 1rem;
  }

  .placeholder-line {
    display: block;
    width: 54%;
    height: 0.5rem;
    background: var(--color-boundary);
    opacity: 0.7;
  }

  .placeholder-line-wide {
    width: 78%;
  }

  @media (width < 40rem) {
    .comments {
      margin-top: 3.25rem;
    }

    .comments-header {
      gap: 1rem;
    }

    .comments-body {
      padding-inline: 0.875rem;
    }
  }
</style>

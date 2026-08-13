<script lang="ts">
  import { page } from '$app/state'
  import { listen_for_content_updates } from '$lib/content/hmr.client'
  import type { PresentationSelection } from '$lib/presentation/contract'
  import { resolve_presentation } from '$lib/presentation/registry'
  import Article from '$lib/site/article.svelte'
  import Backdrop from '$lib/site/backdrop.svelte'
  import Footer from '$lib/site/footer.svelte'
  import Header from '$lib/site/header.svelte'
  import Presentation from '$lib/site/presentation.svelte'
  import { onMount } from 'svelte'

  interface SitePageData {
    presentation?: PresentationSelection
  }

  const { children } = $props()
  const presentation = $derived((page.data as SitePageData).presentation)
  const resolved_presentation = $derived(
    presentation ? resolve_presentation(presentation) : undefined,
  )
  let fallback_progress = $state(0)

  function update_presentation_progress(progress: number) {
    fallback_progress = progress
  }

  onMount(listen_for_content_updates)
</script>

<div class="site">
  <div class="scroll-chrome" style:--stage-progress={fallback_progress}>
    <Backdrop />
    <Header />
  </div>
  <main>
    {#if resolved_presentation?.background || resolved_presentation?.foreground}
      {#key page.url.pathname}
        <Presentation
          background={resolved_presentation.background?.component}
          background_options={resolved_presentation.background?.options}
          foreground={resolved_presentation.foreground?.component}
          foreground_options={resolved_presentation.foreground?.options}
          on_progress={update_presentation_progress}
          progress={fallback_progress}
        />
      {/key}
    {/if}
    <Article has_footer={resolved_presentation?.footer !== undefined}>
      {@render children()}
    </Article>
  </main>
  {#if resolved_presentation?.footer}
    {#key page.url.pathname}
      <Footer
        component={resolved_presentation.footer.component}
        options={resolved_presentation.footer.options}
      />
    {/key}
  {/if}
</div>

<style>
  .site {
    --paper-edge-depth: 0.85rem;
    --paper-seam-gap: clamp(0.375rem, 0.6vw, 0.5rem);
    --paper-seam-guide-offset: 0.875rem;
    --paper-seam-guide-inset: var(--inline-gutter);
    --paper-seam-upper-height: calc(
      var(--paper-edge-depth) + var(--paper-seam-guide-offset) + 1px
    );
    --paper-edge-top-clip: polygon(
      0 0,
      2% var(--paper-edge-depth),
      4% 0,
      6% var(--paper-edge-depth),
      8% 0,
      10% var(--paper-edge-depth),
      12% 0,
      14% var(--paper-edge-depth),
      16% 0,
      18% var(--paper-edge-depth),
      20% 0,
      22% var(--paper-edge-depth),
      24% 0,
      26% var(--paper-edge-depth),
      28% 0,
      30% var(--paper-edge-depth),
      32% 0,
      34% var(--paper-edge-depth),
      36% 0,
      38% var(--paper-edge-depth),
      40% 0,
      42% var(--paper-edge-depth),
      44% 0,
      46% var(--paper-edge-depth),
      48% 0,
      50% var(--paper-edge-depth),
      52% 0,
      54% var(--paper-edge-depth),
      56% 0,
      58% var(--paper-edge-depth),
      60% 0,
      62% var(--paper-edge-depth),
      64% 0,
      66% var(--paper-edge-depth),
      68% 0,
      70% var(--paper-edge-depth),
      72% 0,
      74% var(--paper-edge-depth),
      76% 0,
      78% var(--paper-edge-depth),
      80% 0,
      82% var(--paper-edge-depth),
      84% 0,
      86% var(--paper-edge-depth),
      88% 0,
      90% var(--paper-edge-depth),
      92% 0,
      94% var(--paper-edge-depth),
      96% 0,
      98% var(--paper-edge-depth),
      100% 0,
      100% 100%,
      0 100%
    );
    --paper-edge-bottom-clip: polygon(
      0 0,
      100% 0,
      100% calc(100% - var(--paper-edge-depth)),
      98% 100%,
      96% calc(100% - var(--paper-edge-depth)),
      94% 100%,
      92% calc(100% - var(--paper-edge-depth)),
      90% 100%,
      88% calc(100% - var(--paper-edge-depth)),
      86% 100%,
      84% calc(100% - var(--paper-edge-depth)),
      82% 100%,
      80% calc(100% - var(--paper-edge-depth)),
      78% 100%,
      76% calc(100% - var(--paper-edge-depth)),
      74% 100%,
      72% calc(100% - var(--paper-edge-depth)),
      70% 100%,
      68% calc(100% - var(--paper-edge-depth)),
      66% 100%,
      64% calc(100% - var(--paper-edge-depth)),
      62% 100%,
      60% calc(100% - var(--paper-edge-depth)),
      58% 100%,
      56% calc(100% - var(--paper-edge-depth)),
      54% 100%,
      52% calc(100% - var(--paper-edge-depth)),
      50% 100%,
      48% calc(100% - var(--paper-edge-depth)),
      46% 100%,
      44% calc(100% - var(--paper-edge-depth)),
      42% 100%,
      40% calc(100% - var(--paper-edge-depth)),
      38% 100%,
      36% calc(100% - var(--paper-edge-depth)),
      34% 100%,
      32% calc(100% - var(--paper-edge-depth)),
      30% 100%,
      28% calc(100% - var(--paper-edge-depth)),
      26% 100%,
      24% calc(100% - var(--paper-edge-depth)),
      22% 100%,
      20% calc(100% - var(--paper-edge-depth)),
      18% 100%,
      16% calc(100% - var(--paper-edge-depth)),
      14% 100%,
      12% calc(100% - var(--paper-edge-depth)),
      10% 100%,
      8% calc(100% - var(--paper-edge-depth)),
      6% 100%,
      4% calc(100% - var(--paper-edge-depth)),
      2% 100%,
      0 calc(100% - var(--paper-edge-depth))
    );
    position: relative;
    z-index: 10;
    display: flex;
    min-height: 100vh;
    flex-direction: column;
  }

  main {
    position: relative;
    display: flex;
    flex: 1;
    min-height: 100vh;
    flex-direction: column;
  }
</style>

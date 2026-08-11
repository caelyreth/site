<script lang="ts">
  import { page } from '$app/state'
  import { listen_for_content_updates } from '$lib/content/live-updates.client'
  import type { PresentationSelection } from '$lib/presentation/contract'
  import { resolve_presentation } from '$lib/presentation/registry'
  import Article from '$lib/site/article.svelte'
  import Backdrop from '$lib/site/backdrop.svelte'
  import Footer from '$lib/site/footer.svelte'
  import Header from '$lib/site/header.svelte'
  import Stage from '$lib/site/stage.svelte'
  import { onMount } from 'svelte'

  const { children } = $props()
  const presentation = $derived(
    (page.data as Readonly<{ presentation?: PresentationSelection }>)
      .presentation,
  )
  const resolved_presentation = $derived(
    presentation ? resolve_presentation(presentation) : undefined,
  )
  let fallback_progress = $state(0)

  function update_stage_progress(progress: number) {
    fallback_progress = progress
  }

  onMount(listen_for_content_updates)
</script>

<div class="site" style:--stage-fallback-progress={fallback_progress}>
  <Backdrop />
  <Header />
  <main>
    {#if resolved_presentation?.stage}
      {#key page.url.pathname}
        <Stage
          component={resolved_presentation.stage.component}
          options={resolved_presentation.stage.options}
          on_progress={update_stage_progress}
        />
      {/key}
    {/if}
    <Article>{@render children()}</Article>
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
  @property --stage-progress {
    syntax: '<number>';
    inherits: true;
    initial-value: 0;
  }

  .site {
    --stage-frame-inset: clamp(0.5rem, 1.6vw, 1.25rem);
    --stage-frame-radius: clamp(0.5rem, 1vw, 0.875rem);
    --stage-progress: var(--stage-fallback-progress, 0);
    --stage-opening: calc(1 - var(--stage-progress));
    --stage-rail-seam: 1px;
    --stage-clip-inset: calc(
      max(0px, 50vw - var(--half-measure)) * var(--stage-progress)
    );
    --stage-block-inset: calc(
      var(--stage-frame-inset) * var(--stage-opening)
    );
    --stage-inline-inset: calc(
      var(--stage-clip-inset) + var(--stage-block-inset)
    );
    --stage-top: calc(var(--header-block-size) - var(--stage-rail-seam));
    --stage-radius: calc(var(--stage-frame-radius) * var(--stage-opening));
    --stage-rule: color-mix(
      in oklab,
      var(--color-rule) calc(var(--stage-opening) * 100%),
      transparent
    );
    --stage-content-rule: color-mix(
      in oklab,
      var(--stage-rule),
      var(--color-rule) calc(var(--stage-progress) * 100%)
    );
    --dur-stage-signal: 1800ms;
    --ease-stage-signal: cubic-bezier(0.46, 0, 0.22, 1);
    position: relative;
    z-index: 10;
    display: flex;
    min-height: 100vh;
    flex-direction: column;
  }

  @supports (animation-timeline: scroll(root block)) {
    .site {
      animation: stage-progress 1ms linear both;
      animation-range: 0 100dvh;
      animation-timeline: scroll(root block);
    }
  }

  main {
    position: relative;
    display: flex;
    flex: 1;
    min-height: 100vh;
    flex-direction: column;
  }

  @keyframes stage-progress {
    to {
      --stage-progress: 1;
    }
  }
</style>

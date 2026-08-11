<script lang="ts">
  import type {
    FooterDefinition,
    ObservatoryGraphicDefinition,
    RegionOptions,
  } from '$lib/presentation/definitions'
  import type { Snippet } from 'svelte'

  import Chrome from './chrome.svelte'
  import ContentFrame from './content-frame.svelte'
  import FooterFrame from './footer-frame.svelte'
  import Header from './header.svelte'
  import ObservatoryFrame from './observatory-frame.svelte'

  type SelectedGraphic = Readonly<{
    definition: ObservatoryGraphicDefinition
    options: RegionOptions
  }>

  type SelectedFooter = Readonly<{
    definition: FooterDefinition
    options: RegionOptions
  }>

  type Props = {
    children?: Snippet
    footer?: SelectedFooter
    graphic?: SelectedGraphic
  }

  /* oxlint-disable prefer-const -- Shell regions update with route data. */
  let { children, footer, graphic }: Props = $props()
  let fallback_progress = $state(0)

  function update_fallback_progress(progress: number) {
    fallback_progress = progress
  }
</script>

<div
  class="station-experience"
  style:--observatory-fallback-progress={fallback_progress}
>
  <Chrome />
  <Header />
  <main>
    {#if graphic}
      <ObservatoryFrame
        graphic={graphic.definition}
        options={graphic.options}
        on_progress={update_fallback_progress}
      />
    {/if}
    <ContentFrame>
      {@render children?.()}
    </ContentFrame>
  </main>
  {#if footer}
    <FooterFrame footer={footer.definition} options={footer.options} />
  {/if}
</div>

<style>
  @property --observatory-progress {
    syntax: '<number>';
    inherits: true;
    initial-value: 0;
  }

  .station-experience {
    --observatory-frame-inset: clamp(0.5rem, 1.6vw, 1.25rem);
    --observatory-frame-radius: clamp(0.5rem, 1vw, 0.875rem);
    --observatory-progress: var(--observatory-fallback-progress, 0);
    --observatory-panel-opening: calc(1 - var(--observatory-progress));
    --observatory-rail-seam: 1px;
    --observatory-frame-clip-inset: calc(
      max(0px, 50vw - var(--half-measure)) * var(--observatory-progress)
    );
    --observatory-panel-block-inset: calc(
      var(--observatory-frame-inset) * var(--observatory-panel-opening)
    );
    --observatory-panel-inline-inset: calc(
      var(--observatory-frame-clip-inset) +
        var(--observatory-panel-block-inset)
    );
    --observatory-panel-top: calc(
      var(--header-block-size) - var(--observatory-rail-seam)
    );
    --observatory-panel-radius: calc(
      var(--observatory-frame-radius) * var(--observatory-panel-opening)
    );
    --observatory-panel-rule: color-mix(
      in oklab,
      var(--color-rule) calc(var(--observatory-panel-opening) * 100%),
      transparent
    );
    --observatory-content-rule: color-mix(
      in oklab,
      var(--observatory-panel-rule),
      var(--color-rule) calc(var(--observatory-progress) * 100%)
    );
    position: relative;
    z-index: 10;
    display: flex;
    min-height: 100vh;
    flex-direction: column;
  }

  @supports (animation-timeline: scroll(root block)) {
    .station-experience {
      animation: observatory-progress 1ms linear both;
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

  @keyframes observatory-progress {
    to {
      --observatory-progress: 1;
    }
  }
</style>

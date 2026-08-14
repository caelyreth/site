<script lang="ts">
  import type {
    RegionOptions,
    StageIntro,
    StageProps,
    StageSignal,
  } from '$lib/presentation/contract'
  import { scroll_progress } from '$lib/site/scroll-progress'
  import type { Component } from 'svelte'

  import Guide from './guide.svelte'

  interface Props {
    component: Component<StageProps>
    intro: StageIntro
    on_progress?: (progress: number) => void
    options: RegionOptions
    progress?: number
  }

  /* oxlint-disable prefer-const -- Stage selection can update with the route. */
  let {
    component,
    intro,
    on_progress,
    options,
    progress = 0,
  }: Props = $props()
  const StageContent = $derived(component)
  let signal = $state<StageSignal | undefined>()

  function update_signal(next_signal: StageSignal | undefined) {
    signal = next_signal
  }

  function stage_element(capture: HTMLElement) {
    const element = capture.firstElementChild
    return element instanceof HTMLElement ? element : undefined
  }

  function compact_transition_span(stage: HTMLElement) {
    const root_font_size = Number.parseFloat(
      getComputedStyle(document.documentElement).fontSize,
    )
    const minimum = 8 * root_font_size
    const maximum = 12 * root_font_size
    return Math.min(maximum, Math.max(minimum, stage.offsetHeight * 0.24))
  }

  const observe_stage_progress = scroll_progress({
    fallback_only: true,
    get_progress(capture) {
      const stage = stage_element(capture)
      if (!stage) return 0
      const travel = window.matchMedia('(max-width: 40rem)').matches
        ? compact_transition_span(stage)
        : Math.max(capture.offsetHeight - stage.offsetHeight, 1)
      return -capture.getBoundingClientRect().top / travel
    },
    observed_elements(capture) {
      const stage = stage_element(capture)
      return stage ? [stage] : []
    },
    on_progress(progress) {
      on_progress?.(progress)
    },
  })
</script>

<div
  class="stage-capture"
  style:--stage-fallback-progress={progress}
  {@attach observe_stage_progress}
>
  <section class="stage-sticky" aria-label={intro.title}>
    <div
      class:active={signal !== undefined}
      class="stage-frame"
      style:--stage-signal={signal?.color ?? 'transparent'}
    >
      <StageContent {intro} {options} on_signal={update_signal} />
      <Guide side="left" inStage reveal />
      <Guide side="right" inStage reveal />
    </div>
  </section>
</div>

<style>
  .stage-capture {
    --stage-viewport: var(--stable-viewport-block);
    --stage-scroll-span: var(--stage-transition-span);
    --stage-frame-inset: clamp(0.5rem, 1.6vw, 1.25rem);
    --stage-frame-radius: clamp(0.375rem, 0.75vw, 0.625rem);
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
    --stage-content-rule: var(--color-boundary);
    --stage-intro-inline-inset: max(
      var(--inline-gutter),
      env(safe-area-inset-left),
      env(safe-area-inset-right)
    );
    --stage-intro-bottom-inset: max(1.25rem, env(safe-area-inset-bottom));
    --dur-stage-signal: 1800ms;
    --ease-stage-signal: cubic-bezier(0.46, 0, 0.22, 1);
    height: calc(var(--stage-viewport) + var(--stage-scroll-span));
  }

  @supports (animation-timeline: scroll(root block)) {
    .stage-capture {
      animation: stage-progress 1ms linear both;
      animation-range: 0 var(--stage-scroll-span);
      animation-timeline: scroll(root block);
    }
  }

  @supports (height: 100dvh) and (height: 100lvh) {
    .stage-capture {
      --stage-intro-bottom-inset: calc(
        max(1.25rem, env(safe-area-inset-bottom)) +
          max(0px, 100lvh - 100dvh)
      );
    }
  }

  .stage-sticky {
    position: sticky;
    top: 0;
    z-index: 21;
    width: 100vw;
    height: var(--stage-viewport);
    margin-inline: calc(50% - 50vw);
    overflow: hidden;
    clip-path: inset(0 var(--stage-clip-inset) 0);
    will-change: clip-path;
  }

  .stage-frame {
    position: absolute;
    inset: var(--stage-top) var(--stage-inline-inset)
      var(--stage-block-inset);
    z-index: 1;
    overflow: hidden;
    border: 1px solid var(--stage-content-rule);
    border-radius: var(--stage-radius);
    background-color: color-mix(
      in oklab,
      var(--color-stage-surface) 88%,
      var(--color-stage-wash)
    );
    contain: layout paint;
  }

  .stage-frame::before {
    position: absolute;
    inset: 0;
    pointer-events: none;
    content: '';
    opacity: var(--noise-stage-opacity);
    background-image: var(--noise-tile);
    background-size: var(--noise-size);
  }

  .stage-frame::after {
    --frame-signal: color-mix(
      in oklab,
      var(--stage-signal) 72%,
      transparent
    );

    position: absolute;
    inset: 0;
    z-index: 10;
    pointer-events: none;
    content: '';
    border: 1px solid var(--frame-signal);
    border-radius: inherit;
    box-shadow: inset 0 0 1.25rem -0.875rem var(--frame-signal);
    filter: opacity(var(--stage-opening));
    opacity: 0;
  }

  .stage-frame.active::after {
    animation: stage-signal var(--dur-stage-signal) var(--ease-stage-signal);
  }

  @media (max-width: 40rem) {
    .stage-capture {
      --stage-frame-inset: 0px;
      --stage-frame-radius: 0px;
      --stage-top: 0px;
      height: var(--stage-viewport);
    }

    .stage-sticky {
      position: relative;
    }

    .stage-frame {
      border: 0;
    }

    .stage-frame::after {
      display: none;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .stage-frame.active::after {
      animation: none;
      opacity: 0.72;
    }
  }

  @keyframes stage-signal {
    0% {
      opacity: 0;
    }
    12% {
      opacity: 0.95;
    }
    46% {
      opacity: 0.58;
    }
    78% {
      opacity: 0.24;
    }
    to {
      opacity: 0;
    }
  }
</style>

<script lang="ts">
  import type {
    RegionOptions,
    StageProps,
    StageSignal,
  } from '$lib/presentation/contract'
  import { scroll_progress } from '$lib/site/scroll-progress'
  import type { Component } from 'svelte'

  import Guide from './guide.svelte'

  type Props = {
    component: Component<StageProps>
    on_progress?: (progress: number) => void
    options: RegionOptions
  }

  /* oxlint-disable prefer-const -- Stage selection can update with the route. */
  let { component, on_progress, options }: Props = $props()
  const StageContent = $derived(component)
  let signal = $state<StageSignal | undefined>()

  function update_signal(next_signal: StageSignal | undefined) {
    signal = next_signal
  }

  function stage_element(capture: HTMLElement) {
    const element = capture.firstElementChild
    return element instanceof HTMLElement ? element : undefined
  }

  const observe_stage_progress = scroll_progress({
    fallback_only: true,
    get_progress(capture) {
      const stage = stage_element(capture)
      if (!stage) return 0
      const travel = Math.max(capture.offsetHeight - stage.offsetHeight, 1)
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

<div class="stage-capture" {@attach observe_stage_progress}>
  <section class="stage-sticky" aria-label="Featured visual">
    <div
      class:active={signal !== undefined}
      class="stage-frame"
      style:--stage-signal={signal?.color ?? 'transparent'}
    >
      <StageContent {options} on_signal={update_signal} />
      <Guide side="left" inStage reveal />
      <Guide side="right" inStage reveal />
    </div>
  </section>
</div>

<style>
  .stage-capture {
    height: 200svh;
    height: 200dvh;
  }

  .stage-sticky {
    position: sticky;
    top: 0;
    z-index: 21;
    width: 100vw;
    height: 100svh;
    height: 100dvh;
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
    background-color: var(--color-paper-prime);
  }

  .stage-frame::before {
    position: absolute;
    inset: 0;
    pointer-events: none;
    content: '';
    opacity: 0.25;
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

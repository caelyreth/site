<script lang="ts">
  import { scroll_progress } from '$lib/attachments/scroll-progress'
  import type {
    RegionOptions,
    StageProps,
    StageSignal,
  } from '$lib/presentation/contract'
  import type { Component } from 'svelte'

  import Boundary from './boundary.svelte'

  type Props = {
    graphic: Component<StageProps>
    on_progress?: (progress: number) => void
    options: RegionOptions
  }

  /* oxlint-disable prefer-const -- Graphic selection can update with the route. */
  let { graphic, on_progress, options }: Props = $props()
  const Graphic = $derived(graphic)
  let frame_signal = $state<StageSignal | undefined>()

  function update_frame_signal(signal: StageSignal | undefined) {
    frame_signal = signal
  }

  const observe_fallback_progress = scroll_progress({
    fallback_only: true,
    get_progress(capture) {
      const scene = capture.querySelector<HTMLElement>('.scene')
      if (!scene) return 0
      const travel = Math.max(capture.offsetHeight - scene.offsetHeight, 1)
      return -capture.getBoundingClientRect().top / travel
    },
    observed_elements(capture) {
      const scene = capture.querySelector<HTMLElement>('.scene')
      return scene ? [scene] : []
    },
    on_progress(progress) {
      on_progress?.(progress)
    },
  })
</script>

<div class="capture" {@attach observe_fallback_progress}>
  <section class="scene" aria-labelledby="scene-label">
    <div
      class:active={frame_signal !== undefined}
      class="foreground"
      style:--observatory-signal={frame_signal?.color ?? 'transparent'}
    >
      <Graphic {options} on_signal={update_frame_signal} />
      <Boundary side="left" inScene reveal />
      <Boundary side="right" inScene reveal />
    </div>
  </section>
</div>

<style>
  .capture {
    height: 200svh;
    height: 200dvh;
  }

  .scene {
    position: sticky;
    top: 0;
    z-index: 21;
    width: 100vw;
    height: 100svh;
    height: 100dvh;
    margin-inline: calc(50% - 50vw);
    overflow: hidden;
    clip-path: inset(0 var(--observatory-frame-clip-inset) 0);
    will-change: clip-path;
  }

  .foreground {
    position: absolute;
    inset: var(--observatory-panel-top)
      var(--observatory-panel-inline-inset)
      var(--observatory-panel-block-inset);
    z-index: 1;
    overflow: hidden;
    border: 1px solid var(--observatory-content-rule);
    border-radius: var(--observatory-panel-radius);
    background-color: var(--color-paper-prime);
  }

  .foreground::before {
    position: absolute;
    inset: 0;
    pointer-events: none;
    content: '';
    opacity: 0.25;
    background-image: var(--noise-tile);
    background-size: var(--noise-size);
  }

  .foreground::after {
    --foreground-signal: color-mix(
      in oklab,
      var(--observatory-signal) 72%,
      transparent
    );

    position: absolute;
    inset: 0;
    z-index: 10;
    pointer-events: none;
    content: '';
    border: 1px solid var(--foreground-signal);
    border-radius: inherit;
    box-shadow: inset 0 0 1.25rem -0.875rem var(--foreground-signal);
    filter: opacity(var(--observatory-panel-opening));
    opacity: 0;
  }

  .foreground.active::after {
    animation: observatory-frame-signal var(--dur-observatory-signal)
      var(--ease-observatory-traverse);
  }

  @media (prefers-reduced-motion: reduce) {
    .foreground.active::after {
      animation: none;
      opacity: 0.72;
    }
  }

  @keyframes observatory-frame-signal {
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

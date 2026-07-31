<script lang="ts">
  import Boundary from '$lib/components/station/boundary.svelte'
  import { getStationState } from '$lib/context/station'

  import Canvas from './canvas.svelte'
  import StarField from './star-field.svelte'
  import Window from './window.svelte'

  let capture: HTMLElement | undefined
  let scrollFrame: number | undefined
  const station = getStationState()
  const windowScale = $derived(1 - station.scrollProgress * 0.2)

  function updateProgress() {
    scrollFrame = undefined
    if (!capture) return

    const travel = Math.max(capture.offsetHeight - window.innerHeight, 1)
    const nextProgress = -capture.getBoundingClientRect().top / travel
    station.scrollProgress = Math.min(1, Math.max(0, nextProgress))
  }

  function scheduleProgressUpdate() {
    if (scrollFrame !== undefined) return
    scrollFrame = requestAnimationFrame(updateProgress)
  }

  function cancelProgressUpdate() {
    if (scrollFrame === undefined) return
    cancelAnimationFrame(scrollFrame)
    scrollFrame = undefined
  }

  function observeCapture(node: HTMLElement) {
    capture = node
    cancelProgressUpdate()
    updateProgress()

    return () => {
      if (capture === node) capture = undefined
      cancelProgressUpdate()
      station.scrollProgress = 0
    }
  }
</script>

<svelte:window
  onscroll={scheduleProgressUpdate}
  onresize={scheduleProgressUpdate}
/>

<div class="capture" {@attach observeCapture}>
  <section class="scene" aria-labelledby="scene-label">
    <div class="foreground">
      <StarField />
      <Canvas />
      <Boundary side="left" inScene reveal />
      <Boundary side="right" inScene reveal />
      <span id="scene-label" class="label corner corner-left label-top"
        >Caelyreth / Observatory</span
      >
      <span class="label corner corner-right label-top"
        >Field 044 deg 12 min</span
      >
      <span class="label corner corner-left label-bottom"
        >Transmission 001</span
      >
      <a
        class="label corner corner-right label-bottom descent"
        href="#station">Descend to station</a
      >
      <div class="window-stage" style:transform={`scale(${windowScale})`}>
        <Window />
      </div>
    </div>
  </section>
</div>

<style>
  .capture {
    height: 200svh;
    height: 200dvh;
  }

  .scene {
    --scene-inline-inset: calc(
      var(--inline-gutter) + max(0px, 50vw - var(--half-measure)) *
        var(--p, 0)
    );
    position: sticky;
    top: 0;
    z-index: 21;
    width: 100vw;
    height: 100svh;
    height: 100dvh;
    margin-inline: calc(50% - 50vw);
    overflow: hidden;
  }

  .foreground {
    position: absolute;
    inset: 0;
    z-index: 1;
    display: grid;
    overflow: hidden;
    border-block: 1px solid var(--color-rule);
    background-color: var(--color-paper-prime);
    clip-path: inset(
      0 calc(max(0px, 50vw - var(--half-measure)) * var(--p, 0)) 0
    );
    place-items: center;
    will-change: clip-path;
  }

  .foreground::before {
    position: absolute;
    inset: 0;
    pointer-events: none;
    content: '';
    opacity: 0.25;
    background-image: var(--noise-tile);
    background-size: 96px;
  }

  .window-stage {
    position: relative;
    z-index: 9;
    width: min(92vw, 56rem);
    transform-origin: center;
    will-change: transform;
  }

  .window-stage :global(.window) {
    width: 100%;
  }

  .label {
    position: absolute;
    z-index: 2;
    margin: 0;
    color: var(--color-muted);
    font-size: 0.625rem;
    font-weight: 500;
    letter-spacing: 0.12em;
    line-height: 1.2;
    text-transform: uppercase;
  }

  .corner-left {
    left: var(--scene-inline-inset);
  }

  .corner-right {
    right: var(--scene-inline-inset);
    text-align: right;
  }

  .label-top {
    top: var(--header-safe-inset);
  }

  .label-bottom {
    bottom: 1.25rem;
  }

  .descent {
    color: var(--color-muted);
    text-decoration-color: var(--color-rule);
    text-underline-offset: 0.15em;
    transition:
      color var(--dur-micro) var(--ease-out),
      text-decoration-color var(--dur-micro) var(--ease-out);
  }

  @media (hover: hover) {
    .descent:hover {
      color: var(--color-accent);
      text-decoration-color: var(--color-accent);
    }
  }

  @media (max-width: 38rem) {
    .corner-right.label-top {
      display: none;
    }

    .label {
      font-size: 0.5625rem;
      letter-spacing: 0.08em;
    }
  }
</style>

<script lang="ts">
  import { onMount } from 'svelte'

  type Observation = {
    src: string
    alt: string
  }

  const {
    observations,
    pulseActive = false,
    ratios = [2.5, 4, 2, 1],
  }: {
    observations: readonly Observation[]
    pulseActive?: boolean
    ratios?: readonly [number, number, number, number]
  } = $props()

  let observationImages = $state<(HTMLImageElement | undefined)[]>([])
  let observationLoaded = $state<boolean[]>([])
  let observationRevealed = $state<boolean[]>([])
  let frameReady = $state(false)
  let nextObservation = 0
  let revealTimer: number | undefined

  const FRAME_SETTLE_DELAY = 160
  const PANEL_REVEAL_DELAY = 240

  function queueObservationReveal() {
    if (
      !frameReady ||
      revealTimer !== undefined ||
      nextObservation >= observations.length ||
      !observationLoaded[nextObservation]
    ) {
      return
    }

    revealTimer = window.setTimeout(() => {
      observationRevealed[nextObservation] = true
      nextObservation += 1
      revealTimer = undefined
      queueObservationReveal()
    }, nextObservation === 0 ? FRAME_SETTLE_DELAY : PANEL_REVEAL_DELAY)
  }

  function markObservationLoaded(index: number) {
    observationLoaded[index] = true
    queueObservationReveal()
  }

  onMount(() => {
    const frameId = requestAnimationFrame(() => {
      frameReady = true
      queueObservationReveal()
    })

    for (const [index, image] of observationImages.entries()) {
      if (image?.complete && image.naturalWidth > 0) {
        markObservationLoaded(index)
      }
    }

    return () => {
      cancelAnimationFrame(frameId)
      if (revealTimer !== undefined) window.clearTimeout(revealTimer)
    }
  })
</script>

<figure class="observation-frame" relative z-10 flex="~ col items-center" px-6>
  <div
    class="observation-strip-frame"
    class:is-pulsing={pulseActive}
    class:is-ready={frameReady}
  >
    <div
      class="observation-strip"
      style:--strip-ratio-1={`${ratios[0]}fr`}
      style:--strip-ratio-2={`${ratios[1]}fr`}
      style:--strip-ratio-3={`${ratios[2]}fr`}
      style:--strip-ratio-4={`${ratios[3]}fr`}
    >
      {#each observations as observation, index (observation.src)}
        <div class="observation-panel" class:is-revealed={observationRevealed[index]}>
          <img
            bind:this={observationImages[index]}
            src={observation.src}
            alt={observation.alt}
            fetchpriority={index === 0 ? 'high' : 'auto'}
            decoding="async"
            onload={() => markObservationLoaded(index)}
          />
        </div>
      {/each}
    </div>
    <span aria-hidden="true" class="tick tick-tl"></span>
    <span aria-hidden="true" class="tick tick-tr"></span>
    <span aria-hidden="true" class="tick tick-bl"></span>
    <span aria-hidden="true" class="tick tick-br"></span>
  </div>
  <figcaption mt-4 class="scene-label">
    Obs. 001-004 - four field studies
  </figcaption>
</figure>

<style>
/* Four field studies share one registration frame. The rank order is
   left to right: secondary, primary, tertiary, smallest. */
.observation-frame {
  z-index: 30;
  width: min(92vw, 56rem);
  transform: scale(calc(1 - var(--p, 0) * 0.2));
  transform-origin: center;
}
.scene-label {
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.18em;
  color: var(--space-ink-2);
}
.observation-strip-frame {
  position: relative;
  width: 100%;
  transform: scale(1);
  transform-origin: center;
  transition: transform var(--dur-long) var(--ease-in-out);
}
.observation-strip-frame.is-pulsing {
  transform: scale(0.94);
  will-change: transform;
}
.observation-strip {
  position: relative;
  display: grid;
  grid-template-columns:
    var(--strip-ratio-1) var(--strip-ratio-2) var(--strip-ratio-3)
    var(--strip-ratio-4);
  gap: clamp(0.5rem, 1.5vw, 1rem);
  width: 100%;
  aspect-ratio: 7 / 3.7;
  overflow: hidden;
  background: transparent;
  contain: layout paint;
  transition: grid-template-columns var(--dur-long) var(--ease-in-out);
}
.observation-panel > img {
  display: block;
  width: 100%;
  height: 100%;
  min-width: 0;
  object-fit: cover;
  object-position: center;
}
.observation-panel {
  min-width: 0;
  overflow: hidden;
  opacity: 0;
  transition: opacity 180ms var(--ease-out);
}
.observation-panel > img {
  transform: translate3d(-102%, 0, 0);
  will-change: transform;
  transition: transform 640ms var(--ease-in-out);
}
.observation-panel.is-revealed {
  opacity: 1;
}
.observation-panel.is-revealed > img {
  transform: translate3d(0, 0, 0);
}

/* registration ticks at the frame corners */
.tick {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 12px;
  height: 12px;
  border: 0 solid var(--space-line);
  opacity: 0;
  transform: scale(0.3);
  transition:
    top var(--dur-long) var(--ease-out),
    left var(--dur-long) var(--ease-out),
    opacity var(--dur-short) var(--ease-out),
    transform var(--dur-long) var(--ease-out);
}
.tick-tl {
  border-top-width: 1px;
  border-left-width: 1px;
  transform-origin: bottom right;
}
.tick-tr {
  border-top-width: 1px;
  border-right-width: 1px;
  transform-origin: bottom left;
}
.tick-bl {
  border-bottom-width: 1px;
  border-left-width: 1px;
  transform-origin: top right;
}
.tick-br {
  border-bottom-width: 1px;
  border-right-width: 1px;
  transform-origin: top left;
}
.observation-strip-frame.is-ready .tick {
  opacity: 1;
  transform: scale(1);
}
.observation-strip-frame.is-ready .tick-tl {
  top: -6px;
  left: -6px;
}
.observation-strip-frame.is-ready .tick-tr {
  top: -6px;
  left: calc(100% - 6px);
}
.observation-strip-frame.is-ready .tick-bl {
  top: calc(100% - 6px);
  left: -6px;
}
.observation-strip-frame.is-ready .tick-br {
  top: calc(100% - 6px);
  left: calc(100% - 6px);
}

@media (prefers-reduced-motion: reduce) {
  .observation-strip-frame,
  .observation-strip {
    transition: none;
  }
}
</style>

<script lang="ts">
  import { onMount } from 'svelte'

  type Observation = {
    src: string
    alt: string
  }

  const { observations }: { observations: readonly Observation[] } = $props()

  let observationImages = $state<(HTMLImageElement | undefined)[]>([])
  let observationLoaded = $state<boolean[]>([])
  let observationRevealed = $state<boolean[]>([])
  let frameReady = $state(false)
  let nextObservation = 0
  let revealTimer: number | undefined

  const FRAME_SETTLE_DELAY = 220
  const PANEL_REVEAL_DELAY = 300

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
  <div class="observation-strip-frame" class:is-ready={frameReady}>
    <div class="observation-strip">
      {#each observations as observation, index (observation.src)}
        <img
          bind:this={observationImages[index]}
          src={observation.src}
          alt={observation.alt}
          fetchpriority={index === 1 ? 'high' : 'auto'}
          decoding="async"
          class="observation-panel"
          class:is-revealed={observationRevealed[index]}
          onload={() => markObservationLoaded(index)}
        />
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

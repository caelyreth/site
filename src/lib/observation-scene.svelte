<script lang="ts">
  import { onMount } from 'svelte'
  import ObservationWindow from '$lib/observation-window.svelte'
  import SceneDebris from '$lib/scene-debris.svelte'
  import StationBoundary from '$lib/station-boundary.svelte'

  const observations = [
    {
      src: '/observation_1.webp',
      alt: 'Pale blue and white vertical impasto painting',
    },
    {
      src: '/observation_2.webp',
      alt: 'Deep blue abstract painting with cloud-like bands',
    },
    {
      src: '/observation_3.webp',
      alt: 'Black and white gestural brushwork painting',
    },
    {
      src: '/observation_4.webp',
      alt: 'Layered teal, black, and ochre abstract painting',
    },
  ]

  let sceneElement = $state<HTMLElement>()
  // Start the primary scene as visible. The observer corrects this immediately
  // after mount without delaying the field's first visible pulse.
  let sceneVisible = $state(true)
  let motionActive = $state(false)

  onMount(() => {
    const updateMotionState = () => {
      motionActive = sceneVisible && document.visibilityState === 'visible'
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        sceneVisible = entry.isIntersecting
        updateMotionState()
      },
      { threshold: 0 },
    )

    updateMotionState()
    if (sceneElement) observer.observe(sceneElement)
    document.addEventListener('visibilitychange', updateMotionState)

    return () => {
      observer.disconnect()
      document.removeEventListener('visibilitychange', updateMotionState)
    }
  })
</script>

<div class="capture">
  <section
    bind:this={sceneElement}
    class="scene full-bleed"
  >
      <div class="scene-foreground" flex="~ items-center justify-center">
        <div aria-hidden="true" class="scene-surface"></div>
      <SceneDebris {motionActive} />
      <StationBoundary side="left" inScene />
      <StationBoundary side="right" inScene />

      <span class="scene-label scene-corner scene-corner-left" absolute top-20>
        Caelyreth — observation window
      </span>
      <span class="scene-label scene-corner scene-corner-right" absolute top-20>
        Field 044° 12′
      </span>
      <span class="scene-label scene-corner scene-corner-left" absolute bottom-5>
        Transmission 001
      </span>
      <a
        href="#station"
        class="scene-label scene-corner scene-corner-right"
        absolute
        bottom-5
      >
        Descend to the station ↓
      </a>

      <ObservationWindow {observations} />
    </div>
  </section>
</div>

<style>
/* Hallmark · pre-emit critique: P5 H5 E5 S5 R4 V5
 * macrostructure: Map / Diagram · theme: custom · motion: experimental
 * botanical signal field, kept behind the four-study observation focal layer
 */
.capture {
  height: calc(100vh + var(--capture-progress) * 100vh);
  height: calc(100dvh + var(--capture-progress) * 100dvh);
}

/* The observation window follows the active station shift while keeping
   its local geometry tokens separate from the deck. */
.scene {
  --space-bg: var(--color-paper-2);
  --space-ink: var(--color-ink);
  --space-ink-2: var(--color-muted);
  --space-line: color-mix(in oklab, var(--color-ink) 55%, transparent);
  --cube-hi: oklch(94% 0 0);
  --cube-mid: oklch(76% 0 0);
  --cube-lo: oklch(58% 0 0);
  --star-tile: url('data:image/png;base64,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');

  position: sticky;
  top: 0;
  z-index: 21;
  height: 100vh;
  height: 100dvh;
  overflow: hidden;
  color: var(--space-ink);
}

/* Surface and field share one clip, exposing the station hatch as the opening
   docks into the deck rather than leaving a full-viewport dark slab above it. */
.scene-surface {
  position: absolute;
  inset: 0;
  z-index: 0;
  pointer-events: none;
  background-color: color-mix(
    in oklab,
    var(--space-bg),
    var(--color-paper) calc(var(--p, 0) * 100%)
  );
}
.scene-surface::before {
  content: '';
  position: absolute;
  inset: 0;
  pointer-events: none;
  opacity: calc(var(--p, 0) * 0.4);
  background-image: var(--noise-tile);
  background-size: 96px;
}
.scene-foreground {
  position: absolute;
  inset: 0;
  z-index: 1;
  clip-path: inset(
    0 calc(max(0px, 50vw - var(--station-half-measure)) * var(--p, 0)) 0
  );
}
:global(.dark) .scene {
  --space-bg: oklch(12% 0 0);
  --space-ink: oklch(88% 0 0);
  --space-ink-2: oklch(60% 0 0);
  --space-line: oklch(88% 0 0 / 55%);
  --cube-hi: oklch(82% 0 0);
  --cube-mid: oklch(58% 0 0);
  --cube-lo: oklch(38% 0 0);
}
/* machine labels inside the window */
.scene-label {
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.18em;
  color: var(--space-ink-2);
}
.scene-corner {
  z-index: 2;
}
.scene-corner-left {
  left: calc(
    1.5rem + max(0px, 50vw - var(--station-half-measure)) * var(--p, 0)
  );
}
.scene-corner-right {
  right: calc(
    1.5rem + max(0px, 50vw - var(--station-half-measure)) * var(--p, 0)
  );
}
/* full-viewport-width escape from the deck column */
.full-bleed {
  width: 100vw;
  margin-left: calc(50% - 50vw);
}

</style>

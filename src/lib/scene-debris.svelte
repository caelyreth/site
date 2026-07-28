<script lang="ts">
  import IsoCube from '$lib/iso-cube.svelte'
  import NetworkField from '$lib/network-field.svelte'

  const {
    motionActive,
    onPulseChange,
  }: {
    motionActive: boolean
    onPulseChange: (active: boolean) => void
  } = $props()
</script>

<div class="scene-debris">
  <div aria-hidden="true" class="field-texture field-texture-far"></div>
  <div aria-hidden="true" class="field-texture field-texture-near"></div>
  <div class="constellation-layer">
    <NetworkField {motionActive} {onPulseChange} />
  </div>

  <div class="scene-artifacts">
    <span
      class="scene-side-label v-text hidden sm:block"
      absolute
      right-3
      style="top: 50%"
    >
      Rainbook program
    </span>
    <div
      absolute
      w-20
      class="scene-solid hidden -rotate-8 sm:block"
      style="top: 5%; left: 22%"
    >
      <span class="scene-artifact"><IsoCube /></span>
    </div>
    <div
      absolute
      w-12
      class="scene-solid hidden rotate-10 sm:block"
      style="top: 12%; right: 22%"
    >
      <span class="scene-artifact"><IsoCube /></span>
    </div>
    <div
      absolute
      w-9
      class="scene-solid hidden -scale-x-100 sm:block"
      style="top: 60%; left: 16%"
    >
      <span class="scene-artifact"><IsoCube /></span>
    </div>
    <div
      absolute
      w-8
      class="scene-solid hidden rotate-6 blur-[1.5px] sm:block"
      style="bottom: 8%; right: 24%"
    >
      <span class="scene-artifact"><IsoCube /></span>
    </div>
    <div
      absolute
      w-20
      class="scene-solid hidden rotate-3 blur-[2.5px] md:block"
      style="bottom: 10%; left: 62%"
    >
      <span class="scene-artifact"><IsoCube /></span>
    </div>

    <div
      absolute
      w-20
      class="hidden -rotate-12 sm:block"
      style="top: 38%; right: 5%"
    >
      <span class="scene-artifact"><IsoCube wire /></span>
    </div>
    <div
      absolute
      w-10
      class="hidden rotate-6 sm:block"
      style="top: 26%; left: 3%"
    >
      <span class="scene-artifact"><IsoCube wire /></span>
    </div>
    <div
      absolute
      w-8
      class="hidden -rotate-4 md:block"
      style="bottom: 6%; left: 38%"
    >
      <span class="scene-artifact"><IsoCube wire /></span>
    </div>

    <div
      aria-hidden="true"
      class="orbit hidden sm:block"
      absolute
      size-36
      style="bottom: 16%; left: 8%"
    ></div>
    <div
      aria-hidden="true"
      class="orbit hidden md:block"
      absolute
      size-20
      style="top: 24%; right: 30%"
    ></div>

    <div
      aria-hidden="true"
      class="pixels hidden md:block"
      absolute
      style="top: 10%; left: 14%"
    ></div>
    <div
      aria-hidden="true"
      class="pixels hidden sm:block"
      absolute
      style="bottom: 12%; left: 9%"
    ></div>
    <div
      aria-hidden="true"
      class="pixels hidden md:block"
      absolute
      style="top: 18%; right: 7%"
    ></div>
    <span
      aria-hidden="true"
      class="marker"
      absolute
      style="top: 28%; left: 28%"
    ></span>
    <span
      aria-hidden="true"
      class="marker hidden sm:block"
      absolute
      style="top: 34%; right: 20%"
    ></span>
    <span
      aria-hidden="true"
      class="marker hidden md:block"
      absolute
      style="bottom: 30%; right: 26%"
    ></span>
    <span
      aria-hidden="true"
      class="marker hidden sm:block"
      absolute
      style="top: 47%; right: 18%; background: var(--color-accent)"
    ></span>

    <div
      aria-hidden="true"
      class="stripe-block hidden sm:block"
      absolute
      style="right: 14%; bottom: 24%"
    ></div>
    <div
      aria-hidden="true"
      class="stripe-block sm hidden md:block"
      absolute
      style="left: 7%; top: 42%"
    ></div>
  </div>
</div>

<style>
  /* Hallmark · pre-emit critique: P5 H5 E5 S5 R4 V5
 * macrostructure: Map / Diagram · theme: custom · enrichment: signal field
 * A GPU field and small floating artifacts support, never compete with, the studies.
 */
  /* The debris field dissolves and recedes through the opening capture;
   the framed observation stays. */
  .scene-debris {
    position: absolute;
    inset: 0;
    z-index: 1;
    isolation: isolate;
    opacity: max(0, calc(1 - var(--p, 0) * 1.3));
    transform: scale(calc(1 - var(--p, 0) * 0.08));
    transform-origin: center;
  }

  /* Keep each visual family in its own stacking context. The catalogue can
   illuminate the texture without ever drawing across the physical debris. */
  .field-texture,
  .constellation-layer,
  .scene-artifacts {
    position: absolute;
    inset: 0;
    pointer-events: none;
  }
  .field-texture {
    z-index: 0;
    background-image: var(--star-tile);
    filter: invert(1);
  }
  .field-texture-near {
    background-size: 256px;
    opacity: 0.24;
  }
  .field-texture-far {
    background-size: 384px;
    opacity: 0.11;
  }
  .constellation-layer {
    z-index: 1;
  }
  .scene-artifacts {
    z-index: 2;
  }
  :global(.dark) .field-texture {
    filter: none;
  }
  :global(.dark) .field-texture-near {
    opacity: 0.48;
  }
  :global(.dark) .field-texture-far {
    opacity: 0.22;
  }

  .scene-solid {
    z-index: 1;
    opacity: 0.42;
  }
  :global(.dark) .scene-solid {
    opacity: 0.48;
  }
  .scene-artifact {
    display: block;
    width: 100%;
  }

  /* These labels sit in the debris layer, outside the scene's scoped caption
   rules. Keep them at the same muted machine-label level as the frame text. */
  .scene-side-label {
    z-index: 2;
    color: var(--space-ink-2);
    font-size: 0.625rem;
    font-weight: 500;
    letter-spacing: 0.14em;
    line-height: 1;
    opacity: 0.82;
    text-transform: uppercase;
  }

  /* pixel clusters — small checkerboards of light */
  .pixels {
    z-index: 1;
    width: 24px;
    height: 16px;
    opacity: 0.42;
    background: repeating-conic-gradient(
        var(--space-ink) 0% 25%,
        transparent 0% 50%
      )
      0 0 / 8px 8px;
  }

  /* diagonal stripe block */
  .stripe-block {
    z-index: 1;
    width: 54px;
    height: 54px;
    background: repeating-linear-gradient(
      -45deg,
      var(--space-ink) 0 2px,
      transparent 2px 8px
    );
    opacity: 0.75;
  }

  /* single square marker */
  .marker {
    z-index: 1;
    width: 6px;
    height: 6px;
    background: var(--space-ink);
  }

  /* dashed orbit ring for the window scene */
  .orbit {
    z-index: 1;
    border: 1px dashed var(--space-line);
    border-radius: 9999px;
  }
  .stripe-block.sm {
    width: 34px;
    height: 34px;
  }

  .v-text {
    writing-mode: vertical-rl;
    transform: translateY(-50%);
  }
</style>

<script lang="ts">
  import type { SkyMapRollerMotionStatus } from '$lib/graphics/observatory/sky-map-field'
  import { onMount } from 'svelte'

  import FieldLog from './field-log.svelte'
  import Roller from './roller.svelte'

  type WindowProps = {
    active?: boolean
    compact?: boolean
    onLoadComplete?: () => void
    returning?: boolean
    rollerMotion: SkyMapRollerMotionStatus
    rollerVisible: boolean
    scaleDuration?: number
    signalColor: string
    typingPaused: boolean
  }

  const shutters = [
    { code: 'AP-01', readout: 'NW 07' },
    { code: 'AP-02', readout: 'EL 19' },
    { code: 'AP-03', readout: 'RA 32' },
  ] as const

  /* oxlint-disable prefer-const -- props react to the live spread state. */
  let {
    active = false,
    compact = false,
    onLoadComplete,
    returning = false,
    rollerMotion,
    rollerVisible,
    scaleDuration = 1000,
    signalColor,
    typingPaused,
  }: WindowProps = $props()

  let loadComplete = false

  function completeLoad() {
    if (loadComplete) return
    loadComplete = true
    onLoadComplete?.()
  }

  function handleFrameAnimationEnd(event: AnimationEvent) {
    if (
      event.target !== event.currentTarget ||
      event.animationName !== 'window-expand'
    ) {
      return
    }
    completeLoad()
  }

  onMount(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      completeLoad()
      return
    }

    const fallback = window.setTimeout(completeLoad, 1_600)
    return () => window.clearTimeout(fallback)
  })
</script>

<figure
  aria-hidden="true"
  class:active
  class:compact
  class:returning
  class="window"
  style:--window-scale-duration={`${scaleDuration}ms`}
  style:--shutter-signal={signalColor}
>
  <div class="frame" onanimationend={handleFrameAnimationEnd}>
    <div class="strips">
      {#each shutters as shutter (shutter.code)}
        {#if shutter.code === 'AP-02'}
          <FieldLog
            {active}
            paused={typingPaused}
            {signalColor}
            visible={rollerVisible}
          />
        {:else}
          <section class="strip">
            <span class="shutter-meta">{shutter.code}</span>
            <span class="shutter-readout">{shutter.readout}</span>
          </section>
        {/if}
      {/each}
      <Roller
        {active}
        motion={rollerMotion}
        {rollerVisible}
        {signalColor}
      />
    </div>
    <span class="tick tick-top-left"></span>
    <span class="tick tick-top-right"></span>
    <span class="tick tick-bottom-left"></span>
    <span class="tick tick-bottom-right"></span>
  </div>
</figure>

<style>
  .window {
    --strip-fill: color-mix(in oklab, var(--color-ink) 2%, transparent);
    width: 100%;
    margin: 0;
    pointer-events: none;
    transform-origin: center;
    will-change: transform;
    transition: transform var(--window-scale-duration)
      cubic-bezier(0.46, 0, 0.22, 1);
  }

  .window.compact {
    transform: scale(0.82);
  }

  .window.returning {
    transition-timing-function: cubic-bezier(0.4, 0, 0.18, 1);
  }

  .frame {
    position: relative;
    animation: window-expand 640ms var(--ease-in-out-medium) 880ms both;
  }

  .strips {
    display: grid;
    width: 100%;
    aspect-ratio: 7 / 3.7;
    gap: clamp(0.5rem, 1.5vw, 1rem);
    grid-template-columns: 2.5fr 4fr 2fr 1fr;
  }

  .strip {
    position: relative;
    min-width: 0;
    overflow: hidden;
    border-inline: 1px solid
      color-mix(in oklab, var(--color-rule) 72%, transparent);
    clip-path: inset(0 100% 0 0);
    background-color: var(--strip-fill);
    animation: strip-reveal 640ms var(--ease-in-out) both;
    transition:
      border-color 600ms cubic-bezier(0.4, 0, 0.2, 1),
      background-color 600ms cubic-bezier(0.4, 0, 0.2, 1);
  }

  .strip:nth-child(2) {
    animation-delay: 120ms;
  }

  .strip:nth-child(3) {
    animation-delay: 240ms;
  }

  .strip::before,
  .strip::after {
    position: absolute;
    pointer-events: none;
    content: '';
  }

  .strip::before {
    inset: 0.7rem 0.35rem;
    border-block: 1px solid
      color-mix(in oklab, var(--color-rule) 58%, transparent);
  }

  .strip::after {
    top: 0.7rem;
    bottom: 0.7rem;
    left: 50%;
    width: 1px;
    background: color-mix(in oklab, var(--color-rule) 58%, transparent);
  }

  .shutter-meta,
  .shutter-readout {
    position: absolute;
    z-index: 1;
    color: var(--color-muted);
    font-size: clamp(0.375rem, 0.5vw, 0.5rem);
    font-variant-numeric: tabular-nums;
    letter-spacing: 0.08em;
    line-height: 1;
    transition: color 480ms cubic-bezier(0.4, 0, 0.2, 1);
  }

  .shutter-meta {
    top: 0.28rem;
    left: 0.35rem;
  }

  .shutter-readout {
    right: 0.35rem;
    bottom: 0.28rem;
    text-align: right;
  }

  .window.active .strip {
    border-color: color-mix(
      in oklab,
      var(--shutter-signal) 54%,
      var(--color-rule)
    );
    background-color: color-mix(
      in oklab,
      var(--shutter-signal) 5%,
      var(--strip-fill)
    );
  }

  .window.active .shutter-meta,
  .window.active .shutter-readout {
    color: color-mix(
      in oklab,
      var(--shutter-signal) 74%,
      var(--color-muted)
    );
  }

  .tick {
    position: absolute;
    width: 0.75rem;
    height: 0.75rem;
    border: 0 solid color-mix(in oklab, var(--color-rule) 72%, transparent);
  }

  .tick-top-left {
    top: -0.375rem;
    left: -0.375rem;
    border-top-width: 1px;
    border-left-width: 1px;
  }

  .tick-top-right {
    top: -0.375rem;
    right: -0.375rem;
    border-top-width: 1px;
    border-right-width: 1px;
  }

  .tick-bottom-left {
    bottom: -0.375rem;
    left: -0.375rem;
    border-bottom-width: 1px;
    border-left-width: 1px;
  }

  .tick-bottom-right {
    right: -0.375rem;
    bottom: -0.375rem;
    border-right-width: 1px;
    border-bottom-width: 1px;
  }

  @media (max-width: 38rem) {
    .strip::before {
      inset: 0.35rem 0.18rem;
    }

    .strip::after {
      top: 0.35rem;
      bottom: 0.35rem;
    }

    .shutter-meta,
    .shutter-readout {
      display: none;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .frame,
    .strip {
      animation: none;
    }

    .strip {
      clip-path: none;
    }

    .strip,
    .window,
    .shutter-meta,
    .shutter-readout {
      transition: none;
    }
  }

  @keyframes strip-reveal {
    to {
      clip-path: inset(0);
    }
  }

  @keyframes window-expand {
    from {
      transform: scale(0.42);
    }
  }
</style>

<script lang="ts">
  import type { SkyMapRouteMotionStatus } from '$lib/presentation/stages/observatory/runtime/types'
  import { reduced_motion } from '$lib/site/reduced-motion'
  import { onMount } from 'svelte'

  import './aperture-strip.css'
  import FieldLog from './field-log.svelte'
  import Roller from './roller.svelte'

  type WindowProps = {
    active?: boolean
    compact?: boolean
    on_load_complete?: () => void
    returning?: boolean
    roller_motion: SkyMapRouteMotionStatus
    roller_visible: boolean
    scale_duration?: number
    typing_paused: boolean
  }

  /* oxlint-disable prefer-const -- props react to the live spread state. */
  let {
    active: is_active = false,
    compact: is_compact = false,
    on_load_complete,
    returning: is_returning = false,
    roller_motion,
    roller_visible,
    scale_duration = 1000,
    typing_paused,
  }: WindowProps = $props()

  let load_complete = false

  function complete_load() {
    if (load_complete) return
    load_complete = true
    on_load_complete?.()
  }

  function handle_frame_animation_end(event: AnimationEvent) {
    if (
      event.target !== event.currentTarget ||
      event.animationName !== 'window-expand'
    ) {
      return
    }
    complete_load()
  }

  onMount(() => {
    if (reduced_motion.current) {
      complete_load()
      return
    }

    const fallback_timer = window.setTimeout(complete_load, 1_600)
    return () => window.clearTimeout(fallback_timer)
  })
</script>

<figure
  aria-hidden="true"
  class:active={is_active}
  class:compact={is_compact}
  class:returning={is_returning}
  class="window"
  style:--window-scale-duration={`${scale_duration}ms`}
>
  <div class="frame" onanimationend={handle_frame_animation_end}>
    <div class="strips">
      <section
        class:active={is_active}
        class="aperture-strip shutter-strip"
      >
        <span class="aperture-strip__meta">AP-01</span>
        <span class="aperture-strip__readout">NW 07</span>
      </section>
      <FieldLog
        active={is_active}
        paused={typing_paused}
        visible={roller_visible}
      />
      <section
        class:active={is_active}
        class="aperture-strip shutter-strip"
      >
        <span class="aperture-strip__meta">AP-03</span>
        <span class="aperture-strip__readout">RA 32</span>
      </section>
      <Roller active={is_active} motion={roller_motion} {roller_visible} />
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
    transition: transform var(--window-scale-duration) var(--ease-traverse);
  }

  .window.compact {
    transform: scale(0.82);
  }

  .window.returning {
    transition-timing-function: var(--ease-return);
  }

  .frame {
    position: relative;
    animation: window-expand var(--dur-reveal) var(--ease-in-out-medium)
      880ms both;
  }

  .strips {
    display: grid;
    width: 100%;
    aspect-ratio: 7 / 3.7;
    gap: clamp(0.5rem, 1.5vw, 1rem);
    grid-template-columns: 2.5fr 4fr 2fr 1fr;
  }

  .shutter-strip:nth-child(3) {
    --strip-reveal-delay: 240ms;
  }

  .shutter-strip::after {
    position: absolute;
    pointer-events: none;
    content: '';
  }

  .shutter-strip::after {
    top: 0.7rem;
    bottom: 0.7rem;
    left: 50%;
    width: 1px;
    background: color-mix(in oklab, var(--color-rule) 58%, transparent);
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
    .shutter-strip {
      --strip-frame-inset: 0.35rem 0.18rem;
    }

    .shutter-strip::after {
      top: 0.35rem;
      bottom: 0.35rem;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .frame {
      animation: none;
    }

    .window {
      transition: none;
    }
  }

  @keyframes window-expand {
    from {
      transform: scale(0.42);
    }
  }
</style>

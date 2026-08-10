<script lang="ts">
  import { scroll_progress } from '$lib/attachments/scroll-progress'
  import Boundary from '$lib/components/station/boundary.svelte'
  import { preload_sky_map_engine } from '$lib/graphics/observatory/load-engine'
  import {
    SIGNAL_STATUS_LABELS,
    TRANSMISSION_COLORS,
  } from '$lib/graphics/observatory/signal-colors'
  import type {
    SkyMapEngineEvent,
    SkyMapRollerMotionStatus,
    SkyMapViewStatus,
  } from '$lib/graphics/observatory/types'
  import {
    text_refresh_in,
    text_refresh_out,
  } from '$lib/motion/text-refresh'
  import { onMount } from 'svelte'
  import { useTheme as use_theme } from 'svelte-themes'
  import { flip } from 'svelte/animate'
  import { fly } from 'svelte/transition'

  import Canvas from './canvas.svelte'
  import Window from './window.svelte'

  type SceneProps = {
    on_progress?: (progress: number) => void
  }

  const { on_progress }: SceneProps = $props()

  type WindowPhase = 'expanded' | 'contracting' | 'returning'
  type PulseVisualEvent = Extract<
    SkyMapEngineEvent,
    {
      type:
        | 'foreground_contract_start'
        | 'foreground_return_start'
        | 'roller_motion'
        | 'view_change'
    }
  >
  type ObservatoryVisualState = {
    shutters_loaded: boolean
    field: 'hidden' | 'visible'
    pulse: {
      active: boolean
      phase: WindowPhase
      typing_paused: boolean
      roller_motion: SkyMapRollerMotionStatus
      scale_duration: number
      signal_color_index: number
    }
  }

  let transmission_sequence = $state(1)
  let transmissions = $state<
    Array<{ color_index: number; sequence: number }>
  >([])
  const visual = $state<ObservatoryVisualState>({
    shutters_loaded: false,
    field: 'hidden',
    pulse: {
      active: false,
      phase: 'expanded',
      typing_paused: false,
      roller_motion: { direction: 1, duration: 0, sequence: 0 },
      scale_duration: 1000,
      signal_color_index: 0,
    },
  })
  let view_status = $state<SkyMapViewStatus>({
    declination: 42,
    right_ascension: 322,
    scale: 0.48,
  })
  const theme = use_theme()
  const transmission_colors = $derived(
    theme.resolvedTheme === 'dark'
      ? TRANSMISSION_COLORS.dark
      : TRANSMISSION_COLORS.light,
  )

  onMount(() => {
    // Download the lazy renderer while the shutter animation is running.
    void preload_sky_map_engine().catch(() => {})
  })

  // MARK: - sky map events

  function handle_canvas_event(event: SkyMapEngineEvent) {
    if (event.type === 'destination_arrival') {
      visual.pulse.typing_paused = false
      return
    }
    if (event.type === 'spread_start') {
      begin_spread(event.status)
      return
    }
    if (event.type === 'spread_end') {
      end_spread()
      return
    }
    handle_pulse_update(event)
  }

  function begin_spread({
    color_index,
    roller_direction,
  }: Extract<SkyMapEngineEvent, { type: 'spread_start' }>['status']) {
    visual.pulse.active = true
    visual.pulse.phase = 'expanded'
    visual.pulse.typing_paused = true
    visual.pulse.signal_color_index = color_index
    visual.pulse.roller_motion.direction = roller_direction
    transmissions = [
      { color_index, sequence: transmission_sequence },
      ...transmissions,
    ].slice(0, 3)
    transmission_sequence += 1
  }

  function end_spread() {
    visual.pulse.active = false
    visual.pulse.phase = 'expanded'
    visual.pulse.typing_paused = false
  }

  function handle_pulse_update(event: PulseVisualEvent) {
    if (event.type === 'foreground_contract_start') {
      visual.pulse.scale_duration = event.status.duration
      visual.pulse.phase = 'contracting'
      return
    }
    if (event.type === 'foreground_return_start') {
      visual.pulse.scale_duration = event.status.duration
      visual.pulse.phase = 'returning'
      return
    }
    if (event.type === 'roller_motion') {
      visual.pulse.roller_motion = event.status
      return
    }
    if (event.type === 'view_change') {
      view_status = event.status
    }
  }

  function reveal_sky_map() {
    visual.shutters_loaded = true
    visual.field = 'visible'
  }

  function transmission_color(color_index: number) {
    return transmission_colors[color_index] ?? transmission_colors[0]
  }

  function transmission_label(color_index: number) {
    return SIGNAL_STATUS_LABELS[color_index] ?? SIGNAL_STATUS_LABELS[0]
  }

  function format_coordinate(value: number, signed = false) {
    const absolute = Math.abs(value)
    let degrees = Math.floor(absolute)
    let minutes = Math.round((absolute - degrees) * 60)
    if (minutes === 60) {
      degrees += 1
      minutes = 0
    }
    const sign = signed ? (value >= 0 ? '+' : '-') : ''
    return `${sign}${String(degrees).padStart(3, '0')}D ${String(minutes).padStart(2, '0')}M`
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
      class:active={visual.pulse.active}
      class="foreground"
      style:--observatory-signal={transmission_color(
        visual.pulse.signal_color_index,
      )}
    >
      {#if visual.shutters_loaded}
        <Canvas on_event={handle_canvas_event} />
      {/if}
      <div class="window-stage">
        <Window
          active={visual.pulse.active}
          compact={visual.pulse.phase === 'contracting'}
          on_load_complete={reveal_sky_map}
          returning={visual.pulse.phase === 'returning'}
          roller_motion={visual.pulse.roller_motion}
          roller_visible={visual.field === 'visible'}
          scale_duration={visual.pulse.scale_duration}
          typing_paused={visual.pulse.typing_paused}
        />
      </div>
      <Boundary side="left" inScene reveal />
      <Boundary side="right" inScene reveal />
      <span id="scene-label" class="label corner corner-left label-top"
        >Caelyreth / Observatory</span
      >
      <span
        class:spreading={visual.pulse.active}
        class="label corner corner-right label-top view-status"
        ><span class="view-status-key">RA</span>
        {format_coordinate(view_status.right_ascension)} /
        <span class="view-status-key">DEC</span>
        {format_coordinate(view_status.declination, true)} /
        <span class="view-status-key">Z</span>
        {view_status.scale.toFixed(2)}</span
      >
      <div
        aria-hidden="true"
        class="label corner corner-left label-bottom transmission-log"
      >
        {#if transmissions.length === 0}
          <span class="transmission transmission-empty"
            ><span class="transmission-name">No log</span><span
              class="transmission-sequence">000</span
            ></span
          >
        {:else}
          {#each transmissions as transmission, index (transmission.sequence)}
            <span
              animate:flip={{ duration: 360 }}
              class="transmission"
              in:fly={text_refresh_in}
              out:fly={text_refresh_out}
              style:--transmission-color={transmission_color(
                transmission.color_index,
              )}
              style:--transmission-opacity={1 - index * 0.3}
              ><span class="transmission-name"
                >{transmission_label(transmission.color_index)}</span
              ><span class="transmission-sequence"
                >{String(transmission.sequence).padStart(3, '0')}</span
              ></span
            >
          {/each}
        {/if}
      </div>
      <a
        class="label corner corner-right label-bottom descent"
        href="#station">Descend to station</a
      >
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
        var(--observatory-progress)
    );
    position: sticky;
    top: 0;
    z-index: 21;
    width: 100vw;
    height: 100svh;
    height: 100dvh;
    margin-inline: calc(50% - 50vw);
    overflow: hidden;
    clip-path: inset(
      0
        calc(
          max(0px, 50vw - var(--half-measure)) * var(--observatory-progress)
        )
        0
    );
    will-change: clip-path;
  }

  .foreground {
    position: absolute;
    inset: var(--observatory-panel-top) var(--observatory-panel-inset)
      var(--observatory-panel-inset);
    z-index: 1;
    display: grid;
    overflow: hidden;
    border: 1px solid var(--observatory-panel-rule);
    border-block-end-color: var(--observatory-content-rule);
    border-radius: var(--observatory-panel-radius);
    background-color: var(--color-paper-prime);
    clip-path: inset(
      0
        calc(
          max(0px, 50vw - var(--half-measure)) * var(--observatory-progress)
        )
        0
    );
    place-items: center;
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
    z-index: 3;
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

  .window-stage {
    position: relative;
    z-index: 1;
    width: min(92vw, 56rem);
    transform: scale(calc(1 - var(--observatory-progress) * 0.2));
    transform-origin: center;
    will-change: transform;
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
    top: calc(
      1.25rem +
        (var(--header-safe-inset) - var(--header-block-size) - 1.25rem) *
        var(--observatory-progress)
    );
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

  .view-status {
    font-variant-numeric: tabular-nums;
    letter-spacing: 0.08em;
    white-space: nowrap;
  }

  .view-status-key {
    color: var(--color-muted);
    transition: color var(--dur-long) var(--ease-out);
  }

  .view-status.spreading .view-status-key {
    color: var(--observatory-signal);
  }

  .transmission-log {
    display: flex;
    flex-direction: column-reverse;
    width: 11.25rem;
    max-width: calc(100vw - var(--scene-inline-inset) - 1rem);
    height: 2.75rem;
    gap: 0.25rem;
    font-variant-numeric: tabular-nums;
  }

  .transmission {
    display: grid;
    grid-template-columns: minmax(0, 1fr) 3ch;
    column-gap: 0.5rem;
    color: var(--transmission-color);
    opacity: var(--transmission-opacity);
    white-space: nowrap;
    will-change: opacity, transform;
    transition:
      color var(--dur-short) var(--ease-out),
      opacity var(--dur-long) var(--ease-out);
  }

  .transmission-empty {
    color: var(--color-muted);
    opacity: 1;
  }

  .transmission-name {
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .transmission-sequence {
    text-align: right;
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

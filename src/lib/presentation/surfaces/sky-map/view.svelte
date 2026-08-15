<script lang="ts">
  import type { SkyMapSurfaceProps } from './contract'
  import {
    RIM_RADIUS,
    VIEW_CENTER,
    VIEW_SIZE,
    gasket_ticks,
    gasket_tracks,
    inner_ticks,
    inner_tracks,
  } from './parts/porthole-geometry'
  import SkyCanvas from './parts/sky-canvas.svelte'

  /* oxlint-disable prefer-const -- Surface props update with the stage. */
  let { on_event, state: surface_state }: SkyMapSurfaceProps = $props()
  const relay_trace_segments = Array.from(
    { length: 15 },
    (_, index) => index,
  )
  const relay_sector = $derived(
    Math.round(surface_state.view_status.right_ascension)
      .toString()
      .padStart(3, '0'),
  )
  const relay_declination = $derived(
    Math.round(surface_state.view_status.declination),
  )
  const relay_declination_sign = $derived(relay_declination < 0 ? '-' : '+')
  const relay_declination_value = $derived(
    Math.abs(relay_declination).toString().padStart(2, '0'),
  )
  let lit_relay_segments = $state<ReadonlySet<number>>(new Set())
  let relay_signal_active = false

  $effect(() => {
    if (surface_state.signal_active === relay_signal_active) return
    relay_signal_active = surface_state.signal_active
    if (!surface_state.signal_active) {
      lit_relay_segments = new Set()
      return
    }
    lit_relay_segments = pick_relay_segments()
  })

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

  function pick_relay_segments() {
    const selected = new Set<number>()
    while (selected.size < 6) {
      selected.add(Math.floor(Math.random() * relay_trace_segments.length))
    }
    return selected
  }
</script>

<div
  class="sky-map"
  data-sky-map
  style:--signal={surface_state.signal_color}
>
  <div class="sky-map-visual">
    <div class="porthole">
      <SkyCanvas {on_event} />
      <div aria-hidden="true" class="glass-layer"></div>
    </div>
    <div
      aria-hidden="true"
      class="porthole-bounds"
      data-sky-map-window
    ></div>
    <svg
      aria-hidden="true"
      class="gasket"
      viewBox="0 0 {VIEW_SIZE} {VIEW_SIZE}"
    >
      <circle
        class="rim"
        cx={VIEW_CENTER}
        cy={VIEW_CENTER}
        fill="none"
        r={RIM_RADIUS}
      />
      {#each inner_tracks as track (track)}
        <path class="inner-track" d={track} />
      {/each}
      {#each inner_ticks as tick (`inner-${tick.angle}`)}
        <line
          class:major={tick.major}
          class:medium={tick.medium}
          class:terminal={tick.terminal}
          class="inner-tick"
          transform={`rotate(${tick.angle} ${VIEW_CENTER} ${VIEW_CENTER})`}
          x1={VIEW_CENTER}
          x2={VIEW_CENTER}
          y1={tick.y1}
          y2={tick.y2}
        />
      {/each}
      {#each gasket_tracks as track (track)}
        <path class="gasket-track" d={track} />
      {/each}
      {#each gasket_ticks as tick (tick.angle)}
        <line
          class:major={tick.major}
          class:medium={tick.medium}
          class:terminal={tick.terminal}
          class="gasket-tick"
          transform={`rotate(${tick.angle} ${VIEW_CENTER} ${VIEW_CENTER})`}
          x1={VIEW_CENTER}
          x2={VIEW_CENTER}
          y1={tick.y1}
          y2={tick.y2}
        />
      {/each}
    </svg>
  </div>
  <div class="label-rail label-rail-top">
    <div class="label-cluster">
      <span class="label observatory-label">Observatory</span>
      <div
        aria-hidden="true"
        class:spreading={surface_state.signal_active}
        class="relay-register"
      >
        <dl class="relay-readings">
          <div>
            <dt>Sector</dt>
            <dd>{relay_sector}</dd>
          </div>
          <div>
            <dt>Declination</dt>
            <dd>{relay_declination_sign}{relay_declination_value}</dd>
          </div>
        </dl>
        <div class="relay-trace">
          <span class="relay-trace-label">Sweep</span>
          <div class="relay-trace-cells">
            {#each relay_trace_segments as segment (segment)}
              <span
                class:lit={lit_relay_segments.has(segment)}
                style:--trace-delay={`${segment * 38}ms`}
              ></span>
            {/each}
          </div>
          <span class="relay-trace-state"
            >{surface_state.signal_active ? 'linked' : 'passive'}</span
          >
        </div>
      </div>
    </div>
    <span
      class:spreading={surface_state.signal_active}
      class="label view-status"
      ><span class="view-status-key">RA</span>
      {format_coordinate(surface_state.view_status.right_ascension)} /
      <span class="view-status-key">DEC</span>
      {format_coordinate(surface_state.view_status.declination, true)} /
      <span class="view-status-key">Z</span>
      {surface_state.view_status.scale.toFixed(2)}</span
    >
  </div>
  <span aria-hidden="true" class="label descent-label"
    >Descent to station</span
  >
</div>

<style>
  .sky-map {
    --label-inline-inset: clamp(0.75rem, 4vw, var(--inline-gutter));
    --porthole-center-x: 84%;
    --porthole-center-y: 42%;
    --porthole-radius: clamp(23rem, 33vw, 37rem);
    --porthole-box: calc(var(--porthole-radius) + var(--porthole-radius));
    --sky-map-opacity: max(0, calc(1 - var(--stage-progress) * 1.2));
    --label-safe-left: var(
      --stage-label-safe-left,
      max(var(--label-inline-inset), env(safe-area-inset-left))
    );
    --label-safe-right: var(
      --stage-label-safe-right,
      max(var(--label-inline-inset), env(safe-area-inset-right))
    );
    --label-block-inset: max(1.25rem, env(safe-area-inset-top));
    --label-bottom-inset: max(1.25rem, env(safe-area-inset-bottom));
    --label-rail-top: calc(
      var(--label-block-inset) +
        (
          var(--header-safe-inset) - var(--header-block-size) -
            var(--label-block-inset)
        ) *
        var(--stage-progress)
    );
    --relay-register-width: clamp(11rem, 16vw, 15rem);
    position: absolute;
    inset: 0;
    z-index: 2;
    overflow: hidden;
  }

  .sky-map-visual {
    position: absolute;
    inset: 0;
    opacity: var(--sky-map-opacity);
    will-change: opacity;
  }

  .sky-map-visual::after {
    position: absolute;
    right: 0;
    bottom: 0;
    left: 0;
    z-index: 2;
    height: 1px;
    pointer-events: none;
    content: '';
    background: var(--color-stage-edge);
    box-shadow: 0 -1rem 1.5rem -1rem var(--color-stage-edge);
  }

  .porthole {
    position: absolute;
    inset: 0;
    overflow: hidden;
    background-color: var(--color-stage-surface);
    clip-path: circle(
      var(--porthole-radius) at var(--porthole-center-x)
        var(--porthole-center-y)
    );
  }

  .porthole-bounds {
    position: absolute;
    top: calc(var(--porthole-center-y) - var(--porthole-radius));
    left: calc(var(--porthole-center-x) - var(--porthole-radius));
    width: var(--porthole-box);
    aspect-ratio: 1;
    visibility: hidden;
    pointer-events: none;
  }

  .glass-layer {
    position: absolute;
    inset: 0;
    z-index: 2;
    pointer-events: none;
  }

  .glass-layer::before {
    inset: 0;
    position: absolute;
    content: '';
    background: radial-gradient(
      circle var(--porthole-radius) at var(--porthole-center-x)
        var(--porthole-center-y),
      transparent calc(var(--porthole-radius) - 0.875rem),
      var(--color-stage-glass-lip) calc(var(--porthole-radius) - 0.125rem),
      transparent var(--porthole-radius)
    );
  }

  .rim {
    stroke: var(--color-boundary);
    stroke-width: 1px;
    vector-effect: non-scaling-stroke;
  }

  .inner-track,
  .inner-tick {
    fill: none;
    stroke: currentcolor;
    stroke-linecap: square;
    stroke-linejoin: bevel;
    vector-effect: non-scaling-stroke;
  }

  .inner-track {
    stroke: var(--color-stage-calibration-inner-standard);
    stroke-width: 2.4px;
  }

  .inner-tick {
    stroke: var(--color-stage-calibration-inner-minor);
    stroke-width: 2.4px;
  }

  .inner-tick.medium {
    stroke: var(--color-stage-calibration-inner-standard);
    stroke-width: 3px;
  }

  .inner-tick.major,
  .inner-tick.terminal {
    stroke: var(--color-stage-calibration-inner-major);
    stroke-width: 3.5px;
  }

  .gasket {
    position: absolute;
    top: calc(var(--porthole-center-y) - var(--porthole-radius));
    left: calc(var(--porthole-center-x) - var(--porthole-radius));
    z-index: 3;
    width: var(--porthole-box);
    overflow: visible;
    aspect-ratio: 1;
    color: var(--color-stage-calibration-standard);
    pointer-events: none;
  }

  .gasket-track,
  .gasket-tick {
    fill: none;
    stroke: currentcolor;
    vector-effect: non-scaling-stroke;
  }

  .gasket-track {
    stroke-width: 3px;
  }

  .gasket-tick {
    stroke: var(--color-stage-calibration-minor);
    stroke-width: 3px;
  }

  .gasket-tick.medium {
    stroke: var(--color-stage-calibration-standard);
    stroke-width: 3.5px;
  }

  .gasket-tick.major,
  .gasket-tick.terminal {
    stroke: var(--color-stage-calibration-major);
    stroke-width: 4px;
  }

  @supports (height: 100dvh) and (height: 100lvh) {
    .sky-map {
      --label-bottom-inset: calc(
        max(1.25rem, env(safe-area-inset-bottom)) +
          max(0px, 100lvh - 100dvh)
      );
    }
  }

  .label {
    margin: 0;
    box-sizing: border-box;
    color: var(--color-stage-ink-secondary);
    font-size: clamp(0.5rem, 0.42rem + 0.4vw, 0.625rem);
    font-weight: 500;
    letter-spacing: clamp(0.06em, 0.025em + 0.35vw, 0.12em);
    line-height: 1.2;
    min-width: 0;
    text-transform: uppercase;
  }

  .label-rail {
    position: absolute;
    z-index: 4;
    right: var(--label-safe-right);
    left: var(--label-safe-left);
    display: grid;
    align-items: start;
    gap: clamp(0.75rem, 2.5vw, 1.25rem);
  }

  .label-rail-top {
    grid-template-columns: var(--relay-register-width) minmax(0, 1fr);
    top: var(--label-rail-top);
  }

  .label-cluster {
    display: grid;
    gap: 0.875rem;
  }

  .relay-register {
    display: grid;
    width: var(--relay-register-width);
    gap: 0.625rem;
    color: var(--color-stage-ink-secondary);
    font-family: var(--font-stack-sans);
    font-size: clamp(0.5rem, 0.42rem + 0.4vw, 0.625rem);
    font-weight: 500;
    font-variant-numeric: tabular-nums;
    letter-spacing: clamp(0.06em, 0.025em + 0.35vw, 0.12em);
    line-height: 1.2;
  }

  .relay-readings {
    display: grid;
    margin: 0;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 0.625rem;
  }

  .relay-readings div {
    display: grid;
    gap: 0.25rem;
  }

  .relay-readings dt,
  .relay-trace-label,
  .relay-trace-state {
    color: var(--color-stage-ink-secondary);
    font-size: 0.88em;
    text-transform: uppercase;
  }

  .relay-readings dd {
    margin: 0;
    color: var(--color-stage-ink);
    font-size: 1em;
    font-weight: 500;
    letter-spacing: 0.06em;
  }

  .relay-trace {
    display: grid;
    grid-template-columns: auto minmax(0, 1fr);
    align-items: center;
    column-gap: 0.625rem;
    row-gap: 0.375rem;
  }

  .relay-trace-cells {
    display: grid;
    grid-template-columns: repeat(15, minmax(0, 1fr));
    height: 0.5rem;
    align-items: center;
    gap: 2px;
  }

  .relay-trace-cells span {
    height: 1px;
    background: var(--color-stage-calibration-minor);
  }

  .relay-trace-cells span:nth-child(3n) {
    height: 2px;
  }

  .relay-trace-cells span.lit {
    background: var(--signal);
    animation: relay-trace-pulse 680ms var(--ease-out) both;
    animation-delay: var(--trace-delay);
  }

  .relay-trace-state {
    grid-column: 2;
  }

  .relay-register.spreading .relay-trace-state {
    color: var(--signal);
  }

  .observatory-label {
    white-space: nowrap;
  }

  .descent-label {
    position: absolute;
    right: var(--label-safe-right);
    bottom: var(--label-bottom-inset);
    z-index: 4;
    text-align: right;
    white-space: nowrap;
    opacity: var(--sky-map-opacity);
  }

  .view-status {
    font-variant-numeric: tabular-nums;
    letter-spacing: 0.08em;
    text-align: right;
  }

  .view-status-key {
    color: var(--color-stage-ink-secondary);
    transition: color var(--dur-long) var(--ease-out);
  }

  .view-status.spreading .view-status-key {
    color: var(--signal);
  }

  @media (max-width: 40rem) {
    .sky-map {
      --porthole-center-x: calc(100% + 30vw);
      --porthole-center-y: 38%;
      --porthole-radius: 75vw;
    }

    .relay-register {
      display: none;
    }

    .label-rail-top {
      grid-template-columns: max-content minmax(0, 1fr);
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .view-status-key {
      transition: none;
    }

    .relay-trace-cells span.lit {
      animation: none;
    }
  }

  @keyframes relay-trace-pulse {
    0% {
      opacity: 0.4;
      transform: scaleY(1);
    }
    45% {
      opacity: 1;
      transform: scaleY(2);
    }
    to {
      opacity: 1;
      transform: scaleY(1.5);
    }
  }
</style>

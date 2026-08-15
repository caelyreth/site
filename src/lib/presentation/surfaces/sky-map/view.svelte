<script lang="ts">
  import type { SkyMapSurfaceProps } from './contract'
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
  <div class="sky-field">
    <SkyCanvas {on_event} />
    <div
      aria-hidden="true"
      class="route-viewport"
      data-sky-map-route-viewport
    ></div>
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
    --sky-map-field-start: 44%;
    --sky-map-fade-start: 0%;
    --sky-map-fade-end: 36%;
    --sky-map-route-top: 10%;
    --sky-map-route-right: 5%;
    --sky-map-route-bottom: 12%;
    --sky-map-route-left: 64%;
    --sky-field-opacity: max(0, calc(1 - var(--stage-progress) * 1.2));
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

  .sky-field {
    position: absolute;
    inset: 0;
    opacity: var(--sky-field-opacity);
    will-change: opacity;
  }

  .route-viewport {
    position: absolute;
    inset: var(--sky-map-route-top) var(--sky-map-route-right)
      var(--sky-map-route-bottom) var(--sky-map-route-left);
    visibility: hidden;
    pointer-events: none;
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
    background: var(--color-boundary);
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

  .descent-label {
    position: absolute;
    right: var(--label-safe-right);
    bottom: var(--label-bottom-inset);
    z-index: 4;
    text-align: right;
    white-space: nowrap;
    opacity: var(--sky-field-opacity);
  }

  @media (max-width: 40rem) {
    .sky-map {
      --sky-map-field-start: 0%;
      --sky-map-fade-start: 12%;
      --sky-map-fade-end: 62%;
      --sky-map-route-top: 12%;
      --sky-map-route-right: 8%;
      --sky-map-route-bottom: 22%;
      --sky-map-route-left: 62%;
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

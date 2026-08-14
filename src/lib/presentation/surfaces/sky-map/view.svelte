<script lang="ts">
  import type { SkyMapSurfaceProps } from './contract'
  import SkyCanvas from './parts/sky-canvas.svelte'

  /* oxlint-disable prefer-const -- Surface props update with the stage. */
  let { on_event, state }: SkyMapSurfaceProps = $props()
  const calibration_degrees = Array.from(
    { length: 12 },
    (_, index) => index * 30,
  )
  const calibration_ticks = Array.from({ length: 360 }, (_, index) => {
    const major = index % 30 === 0
    const medium = index % 5 === 0 && !major
    return { angle: index, major, medium, minor: !major && !medium }
  })
  const calibration_rotation = $derived(
    `${-state.view_status.right_ascension.toFixed(2)}deg`,
  )

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
</script>

<div class="sky-map" data-sky-map style:--signal={state.signal_color}>
  <div class="porthole">
    <SkyCanvas {on_event} />
  </div>
  <div aria-hidden="true" class="porthole-bounds" data-sky-map-window></div>
  <svg aria-hidden="true" class="calibration-ring" viewBox="0 0 1000 1000">
    <g style:--calibration-rotation={calibration_rotation} class="dial">
      <circle
        class="calibration-track"
        cx="500"
        cy="500"
        fill="none"
        pathLength="360"
        r="512"
      />
      {#each calibration_ticks as tick (tick.angle)}
        <line
          class:major={tick.major}
          class:medium={tick.medium}
          class:minor={tick.minor}
          class="calibration-tick"
          transform={`rotate(${tick.angle} 500 500)`}
          x1="500"
          x2="500"
          y1="-12"
          y2={tick.major ? -38 : tick.medium ? -30 : -24}
        />
      {/each}
      {#each calibration_degrees as degree (degree)}
        <text
          class="calibration-degree"
          transform={`rotate(${degree} 500 500)`}
          x="500"
          y="-57">{String(degree).padStart(3, '0')}&deg;</text
        >
      {/each}
    </g>
  </svg>
  <div class="label-rail label-rail-top">
    <span class="label observatory-label">Observatory</span>
    <span class:spreading={state.signal_active} class="label view-status"
      ><span class="view-status-key">RA</span>
      {format_coordinate(state.view_status.right_ascension)} /
      <span class="view-status-key">DEC</span>
      {format_coordinate(state.view_status.declination, true)} /
      <span class="view-status-key">Z</span>
      {state.view_status.scale.toFixed(2)}</span
    >
  </div>
  <span aria-hidden="true" class="label descent-label"
    >Descent to station</span
  >
</div>

<style>
  .sky-map {
    --label-inline-inset: clamp(0.75rem, 4vw, var(--inline-gutter));
    --porthole-center-x: 74%;
    --porthole-center-y: 39%;
    --porthole-radius: clamp(25rem, 35vw, 40rem);
    --label-safe-left: max(
      var(--label-inline-inset),
      env(safe-area-inset-left)
    );
    --label-safe-right: max(
      var(--label-inline-inset),
      env(safe-area-inset-right)
    );
    --label-block-inset: max(1.25rem, env(safe-area-inset-top));
    --label-bottom-inset: max(1.25rem, env(safe-area-inset-bottom));
    position: absolute;
    inset: 0;
    overflow: hidden;
  }

  .porthole {
    position: absolute;
    inset: 0;
    overflow: hidden;
    clip-path: circle(
      var(--porthole-radius) at var(--porthole-center-x)
        var(--porthole-center-y)
    );
  }

  .porthole-bounds {
    position: absolute;
    top: calc(var(--porthole-center-y) - var(--porthole-radius));
    left: calc(var(--porthole-center-x) - var(--porthole-radius));
    width: calc(var(--porthole-radius) + var(--porthole-radius));
    aspect-ratio: 1;
    visibility: hidden;
    pointer-events: none;
  }

  .sky-map::before {
    position: absolute;
    top: calc(var(--porthole-center-y) - var(--porthole-radius) - 2px);
    left: calc(var(--porthole-center-x) - var(--porthole-radius) - 2px);
    z-index: 4;
    box-sizing: border-box;
    width: calc(var(--porthole-radius) + var(--porthole-radius) + 4px);
    aspect-ratio: 1;
    pointer-events: none;
    content: '';
    border: 2px solid var(--color-boundary);
    border-radius: 50%;
  }

  .calibration-ring {
    position: absolute;
    top: calc(var(--porthole-center-y) - var(--porthole-radius) + 1px);
    left: calc(var(--porthole-center-x) - var(--porthole-radius) + 1px);
    z-index: 3;
    width: calc(var(--porthole-radius) + var(--porthole-radius) - 2px);
    aspect-ratio: 1;
    overflow: visible;
    color: var(--color-stage-calibration-standard);
    pointer-events: none;
  }

  .dial {
    transform-box: view-box;
    transform-origin: center;
    transform: rotate(var(--calibration-rotation));
    transition: transform 180ms linear;
  }

  .calibration-track,
  .calibration-tick {
    stroke: currentcolor;
    vector-effect: non-scaling-stroke;
  }

  .calibration-track {
    stroke-width: 2px;
  }

  .calibration-tick {
    stroke-width: 2.5px;
  }

  .calibration-tick.major {
    stroke: var(--color-stage-calibration-major);
    stroke-width: 3.5px;
  }

  .calibration-tick.medium {
    stroke-width: 3px;
  }

  .calibration-tick.minor {
    stroke: var(--color-stage-calibration-minor);
  }

  .calibration-degree {
    fill: var(--color-stage-calibration-major);
    font-size: 14px;
    font-weight: 600;
    letter-spacing: 1px;
    text-anchor: middle;
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
    grid-template-columns: max-content minmax(0, 1fr);
    top: calc(
      var(--label-block-inset) +
        (
          var(--header-safe-inset) - var(--header-block-size) -
            var(--label-block-inset)
        ) *
        var(--stage-progress)
    );
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
      --porthole-center-y: 35%;
      --porthole-radius: 75vw;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .dial {
      transition: none;
    }
  }
</style>

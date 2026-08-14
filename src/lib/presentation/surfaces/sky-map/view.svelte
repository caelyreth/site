<script lang="ts">
  import type { SkyMapSurfaceProps } from './contract'
  import SkyCanvas from './parts/sky-canvas.svelte'

  /* oxlint-disable prefer-const -- Surface props update with the stage. */
  let { on_event, state }: SkyMapSurfaceProps = $props()

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

<div class="sky-map" style:--signal={state.signal_color}>
  <SkyCanvas {on_event} />
  <span aria-hidden="true" class="edge-label edge-label-left"
    >Observation plate / open aperture</span
  >
  <span aria-hidden="true" class="edge-label edge-label-right"
    >Epoch 2026.5 / meridian survey band</span
  >
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

  .edge-label {
    position: absolute;
    top: 50%;
    z-index: 2;
    color: color-mix(
      in oklab,
      var(--color-stage-ink-secondary) 68%,
      transparent
    );
    font-size: clamp(0.4375rem, 0.36rem + 0.25vw, 0.5625rem);
    font-weight: 500;
    letter-spacing: clamp(0.08em, 0.04em + 0.3vw, 0.14em);
    line-height: 1;
    pointer-events: none;
    text-transform: uppercase;
    white-space: nowrap;
    writing-mode: vertical-rl;
  }

  .edge-label-left {
    left: var(--label-safe-left);
    transform: translateY(-50%) rotate(180deg);
  }

  .edge-label-right {
    right: var(--label-safe-right);
    transform: translateY(-50%);
  }

  @media (max-width: 38rem) {
    .edge-label {
      display: none;
    }
  }
</style>

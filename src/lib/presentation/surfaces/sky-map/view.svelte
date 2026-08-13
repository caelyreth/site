<script lang="ts">
  import {
    text_refresh_in,
    text_refresh_out,
  } from '$lib/presentation/text-refresh'
  import { flip } from 'svelte/animate'
  import { fly } from 'svelte/transition'

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
  <span class="label corner corner-left label-top"
    >Caelyreth / Observatory</span
  >
  <span
    class:spreading={state.signal_active}
    class="label corner corner-right label-top view-status"
    ><span class="view-status-key">RA</span>
    {format_coordinate(state.view_status.right_ascension)} /
    <span class="view-status-key">DEC</span>
    {format_coordinate(state.view_status.declination, true)} /
    <span class="view-status-key">Z</span>
    {state.view_status.scale.toFixed(2)}</span
  >
  <div
    aria-hidden="true"
    class="label corner corner-left label-bottom transmission-log"
  >
    {#if state.transmissions.length === 0}
      <span class="transmission transmission-empty"
        ><span class="transmission-name">No log</span><span
          class="transmission-sequence">000</span
        ></span
      >
    {:else}
      {#each state.transmissions as transmission (transmission.sequence)}
        <span
          animate:flip={{ duration: 360 }}
          class="transmission"
          in:fly={text_refresh_in}
          out:fly={text_refresh_out}
          style:--transmission-color={transmission.color}
          style:--transmission-opacity={transmission.opacity}
          ><span class="transmission-name">{transmission.label}</span><span
            class="transmission-sequence"
            >{String(transmission.sequence).padStart(3, '0')}</span
          ></span
        >
      {/each}
    {/if}
  </div>
  <a class="label corner corner-right label-bottom descent" href="#content"
    >Descend to content</a
  >
</div>

<style>
  .sky-map {
    --inline-inset: var(--inline-gutter);
    position: absolute;
    inset: 0;
    overflow: hidden;
  }

  .label {
    position: absolute;
    z-index: 4;
    margin: 0;
    color: var(--color-stage-ink-secondary);
    font-size: 0.625rem;
    font-weight: 500;
    letter-spacing: 0.12em;
    line-height: 1.2;
    text-transform: uppercase;
  }

  .corner-left {
    left: var(--inline-inset);
  }

  .corner-right {
    right: var(--inline-inset);
    text-align: right;
  }

  .label-top {
    top: calc(
      1.25rem +
        (var(--header-safe-inset) - var(--header-block-size) - 1.25rem) *
        var(--stage-progress)
    );
  }

  .label-bottom {
    bottom: 1.25rem;
  }

  .descent {
    color: var(--color-stage-ink-secondary);
    text-decoration-color: var(--color-stage-rule);
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
    color: var(--color-stage-ink-secondary);
    transition: color var(--dur-long) var(--ease-out);
  }

  .view-status.spreading .view-status-key {
    color: var(--signal);
  }

  .transmission-log {
    display: flex;
    flex-direction: column-reverse;
    width: 11.25rem;
    max-width: calc(100vw - var(--inline-inset) - 1rem);
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
    color: var(--color-stage-ink-secondary);
    opacity: 1;
  }

  .transmission-name {
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .transmission-sequence {
    text-align: right;
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
    font-size: 0.5625rem;
    font-weight: 500;
    letter-spacing: 0.14em;
    line-height: 1;
    pointer-events: none;
    text-transform: uppercase;
    white-space: nowrap;
    writing-mode: vertical-rl;
  }

  .edge-label-left {
    left: 0.625rem;
    transform: translateY(-50%) rotate(180deg);
  }

  .edge-label-right {
    right: 0.625rem;
    transform: translateY(-50%);
  }

  @media (hover: hover) {
    .descent:hover {
      color: var(--color-stage-ink);
      text-decoration-color: var(--color-stage-ink);
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

    .edge-label {
      display: none;
    }
  }
</style>

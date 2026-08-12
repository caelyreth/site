<script lang="ts">
  import type { StageProps } from '$lib/presentation/contract'
  import {
    text_refresh_in,
    text_refresh_out,
  } from '$lib/presentation/text-refresh'
  import { flip } from 'svelte/animate'
  import { fly } from 'svelte/transition'

  import { create_observatory_controller } from './controller.svelte'
  import SkyCanvas from './parts/sky-canvas.svelte'
  import Wordmark from './parts/wordmark.svelte'

  /* oxlint-disable prefer-const -- Stage callback can update with its host. */
  let { on_signal }: StageProps = $props()
  const controller = create_observatory_controller(() => on_signal)

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

<div
  class="observatory"
  style:--signal={controller.color_for(
    controller.state.pulse.signal_color_index,
  )}
>
  <SkyCanvas on_event={controller.handle_runtime_event} />
  <div class="wordmark-layer">
    <Wordmark active={controller.state.pulse.active} />
  </div>
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
    class:spreading={controller.state.pulse.active}
    class="label corner corner-right label-top view-status"
    ><span class="view-status-key">RA</span>
    {format_coordinate(controller.state.view_status.right_ascension)} /
    <span class="view-status-key">DEC</span>
    {format_coordinate(controller.state.view_status.declination, true)} /
    <span class="view-status-key">Z</span>
    {controller.state.view_status.scale.toFixed(2)}</span
  >
  <div
    aria-hidden="true"
    class="label corner corner-left label-bottom transmission-log"
  >
    {#if controller.state.transmissions.length === 0}
      <span class="transmission transmission-empty"
        ><span class="transmission-name">No log</span><span
          class="transmission-sequence">000</span
        ></span
      >
    {:else}
      {#each controller.state.transmissions as transmission, index (transmission.sequence)}
        <span
          animate:flip={{ duration: 360 }}
          class="transmission"
          in:fly={text_refresh_in}
          out:fly={text_refresh_out}
          style:--transmission-color={controller.color_for(
            transmission.color_index,
          )}
          style:--transmission-opacity={1 - index * 0.3}
          ><span class="transmission-name"
            >{controller.label_for(transmission.color_index)}</span
          ><span class="transmission-sequence"
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
  .observatory {
    --inline-inset: var(--inline-gutter);
    position: absolute;
    inset: 0;
    overflow: hidden;
  }

  .wordmark-layer {
    position: absolute;
    top: 50%;
    left: 50%;
    z-index: 3;
    width: min(72vw, 46rem);
    pointer-events: none;
    opacity: max(0, calc(1 - var(--stage-progress) * 1.05));
    transform: translate(-50%, -50%)
      scale(calc(1 - var(--stage-progress) * 0.12));
    transform-origin: center;
    will-change: transform, opacity;
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

    .wordmark-layer {
      width: min(90vw, 34rem);
    }
  }
</style>

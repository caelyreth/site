<script lang="ts">
  import Boundary from '$lib/components/station/boundary.svelte'
  import { getStationState } from '$lib/context/station'
  import {
    SIGNAL_STATUS_LABELS,
    TRANSMISSION_COLORS,
  } from '$lib/graphics/observatory/signal-colors'
  import type {
    SkyMapLayerMotionStatus,
    SkyMapPulseStatus,
    SkyMapRollerMotionStatus,
    SkyMapViewStatus,
  } from '$lib/graphics/observatory/sky-map-field'
  import { textRefreshIn, textRefreshOut } from '$lib/motion/text-refresh'
  import { useTheme } from 'svelte-themes'
  import { flip } from 'svelte/animate'
  import { fly } from 'svelte/transition'

  import Canvas from './canvas.svelte'
  import Window from './window.svelte'

  let capture: HTMLElement | undefined
  let scrollFrame: number | undefined
  let transmissionSequence = $state(1)
  let transmissions = $state<
    Array<{ colorIndex: number; sequence: number }>
  >([])
  let spreading = $state(false)
  let skyMapVisible = $state(false)
  let shuttersLoaded = $state(false)
  let windowCompact = $state(false)
  let windowReturning = $state(false)
  let rollerMotion = $state<SkyMapRollerMotionStatus>({
    direction: 1,
    duration: 0,
    sequence: 0,
  })
  let windowScaleDuration = $state(1000)
  let spreadColorIndex = $state(0)
  let viewStatus = $state<SkyMapViewStatus>({
    declination: 42,
    rightAscension: 322,
    scale: 0.48,
  })
  const station = getStationState()
  const theme = useTheme()
  const transmissionColors = $derived(
    theme.resolvedTheme === 'dark'
      ? TRANSMISSION_COLORS.dark
      : TRANSMISSION_COLORS.light,
  )
  const windowScale = $derived(1 - station.scrollProgress * 0.2)

  function beginSpread({
    colorIndex,
    rollerDirection,
  }: SkyMapPulseStatus) {
    rollerMotion.direction = rollerDirection
    spreadColorIndex = colorIndex
    spreading = true
    windowReturning = false
    transmissions = [
      { colorIndex, sequence: transmissionSequence },
      ...transmissions,
    ].slice(0, 3)
    transmissionSequence += 1
  }

  function endSpread() {
    spreading = false
    windowReturning = false
    windowCompact = false
  }

  function contractWindow({ duration }: SkyMapLayerMotionStatus) {
    windowScaleDuration = duration
    windowReturning = false
    windowCompact = true
  }

  function returnWindow({ duration }: SkyMapLayerMotionStatus) {
    windowScaleDuration = duration
    windowReturning = true
    windowCompact = false
  }

  function updateRollerMotion(nextMotion: SkyMapRollerMotionStatus) {
    rollerMotion = nextMotion
  }

  function revealSkyMap() {
    shuttersLoaded = true
    skyMapVisible = true
  }

  function revealSkyMapField() {
    skyMapVisible = true
  }

  function transmissionColor(colorIndex: number) {
    return transmissionColors[colorIndex] ?? transmissionColors[0]
  }

  function transmissionLabel(colorIndex: number) {
    return SIGNAL_STATUS_LABELS[colorIndex] ?? SIGNAL_STATUS_LABELS[0]
  }

  function updateViewStatus(nextStatus: SkyMapViewStatus) {
    viewStatus = nextStatus
  }

  function formatCoordinate(value: number, signed = false) {
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

  function updateProgress() {
    scrollFrame = undefined
    if (!capture) return

    const travel = Math.max(capture.offsetHeight - window.innerHeight, 1)
    const nextProgress = -capture.getBoundingClientRect().top / travel
    station.scrollProgress = Math.min(1, Math.max(0, nextProgress))
  }

  function scheduleProgressUpdate() {
    if (scrollFrame !== undefined) return
    scrollFrame = requestAnimationFrame(updateProgress)
  }

  function cancelProgressUpdate() {
    if (scrollFrame === undefined) return
    cancelAnimationFrame(scrollFrame)
    scrollFrame = undefined
  }

  function observeCapture(node: HTMLElement) {
    capture = node
    cancelProgressUpdate()
    updateProgress()

    return () => {
      if (capture === node) capture = undefined
      cancelProgressUpdate()
      station.scrollProgress = 0
    }
  }
</script>

<svelte:window
  onscroll={scheduleProgressUpdate}
  onresize={scheduleProgressUpdate}
/>

<div class="capture" {@attach observeCapture}>
  <section class="scene" aria-labelledby="scene-label">
    <div class="foreground">
      {#if shuttersLoaded}
        <Canvas
          onFadeInStart={revealSkyMapField}
          onForegroundContractStart={contractWindow}
          onForegroundReturnStart={returnWindow}
          onRollerMotion={updateRollerMotion}
          onSpreadEnd={endSpread}
          onSpreadStart={beginSpread}
          onViewChange={updateViewStatus}
        />
      {/if}
      <div class="window-stage" style:transform={`scale(${windowScale})`}>
        <Window
          active={spreading}
          compact={windowCompact}
          onLoadComplete={revealSkyMap}
          returning={windowReturning}
          {rollerMotion}
          rollerVisible={skyMapVisible}
          scaleDuration={windowScaleDuration}
          signalColor={transmissionColor(spreadColorIndex)}
        />
      </div>
      <Boundary side="left" inScene reveal />
      <Boundary side="right" inScene reveal />
      <span id="scene-label" class="label corner corner-left label-top"
        >Caelyreth / Observatory</span
      >
      <span
        class:spreading
        class="label corner corner-right label-top view-status"
        style:--view-signal-color={transmissionColor(spreadColorIndex)}
        ><span class="view-status-key">RA</span>
        {formatCoordinate(viewStatus.rightAscension)} /
        <span class="view-status-key">DEC</span>
        {formatCoordinate(viewStatus.declination, true)} /
        <span class="view-status-key">Z</span>
        {viewStatus.scale.toFixed(2)}</span
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
              in:fly={textRefreshIn}
              out:fly={textRefreshOut}
              style:--transmission-color={transmissionColor(
                transmission.colorIndex,
              )}
              style:--transmission-opacity={1 - index * 0.3}
              ><span class="transmission-name"
                >{transmissionLabel(transmission.colorIndex)}</span
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
        var(--p, 0)
    );
    position: sticky;
    top: 0;
    z-index: 21;
    width: 100vw;
    height: 100svh;
    height: 100dvh;
    margin-inline: calc(50% - 50vw);
    overflow: hidden;
  }

  .foreground {
    position: absolute;
    inset: 0;
    z-index: 1;
    display: grid;
    overflow: hidden;
    border-block: 1px solid var(--color-rule);
    background-color: var(--color-paper-prime);
    clip-path: inset(
      0 calc(max(0px, 50vw - var(--half-measure)) * var(--p, 0)) 0
    );
    place-items: center;
    will-change: clip-path;
  }

  .foreground::before {
    position: absolute;
    inset: 0;
    pointer-events: none;
    content: '';
    opacity: 0.25;
    background-image: var(--noise-tile);
    background-size: 96px;
  }

  .window-stage {
    position: relative;
    z-index: 1;
    width: min(92vw, 56rem);
    transform-origin: center;
    will-change: transform;
  }

  .window-stage :global(.window) {
    width: 100%;
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
    top: var(--header-safe-inset);
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
    color: var(--view-signal-color);
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
</style>

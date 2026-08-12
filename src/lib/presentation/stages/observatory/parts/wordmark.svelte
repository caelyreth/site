<script lang="ts">
  import { reduced_motion } from '$lib/site/reduced-motion'
  import { onMount } from 'svelte'

  import {
    WORDMARK_BOOT_DURATION,
    WORDMARK_COOL_DURATION,
    WORDMARK_CRASH_DURATION,
    WORDMARK_CRASH_PIXEL_DURATION,
    WORDMARK_FADE_DURATION,
    WORDMARK_LIGHT_DELAY,
  } from '../intro'
  import {
    type CircuitSide,
    circuit_nodes,
    circuit_traces,
    pick_circuit_side,
  } from './circuit'
  import {
    VFD_LAYOUT,
    build_vfd_idle,
    build_vfd_lit,
    fit_vfd_text,
    vfd_word_width,
  } from './vfd'

  type FilamentPhase = 'cool' | 'heat' | 'hold'

  type Props = {
    active?: boolean
  }

  const tube_slots = 9
  const tube_readings = [
    'CAELYRETH',
    'STATION',
    'NO UPLINK',
    'FIELD LOG',
    'MERIDIAN',
  ]
  const crash_pixels = [
    { delay: 0, x: 3.2, y: 6.7 },
    { delay: 48, x: 19.8, y: 2.85 },
    { delay: 24, x: 35.8, y: 10.35 },
    { delay: 80, x: 52.6, y: 4.35 },
  ]
  const glass = {
    height: 8.28,
    radius: 0.4,
    width: vfd_word_width(tube_slots) + 3.2,
    x: -1.6,
    y: 3.18,
  }
  const idle = build_vfd_idle(tube_slots)

  /* oxlint-disable prefer-const -- The signal state updates from the stage. */
  let { active = false }: Props = $props()
  let live_side = $state<CircuitSide>()
  let was_active = false
  let changing = false
  let reading_index = $state(0)
  let phase = $state<FilamentPhase>('heat')
  let cycle = $state(0)
  const reading = $derived(
    fit_vfd_text(tube_readings[reading_index] ?? 'CAELYRETH', tube_slots),
  )
  const lit = $derived(build_vfd_lit(reading, VFD_LAYOUT))
  let display_timer = 0

  function clear_display_timer() {
    if (display_timer) window.clearTimeout(display_timer)
    display_timer = 0
  }

  function schedule_display_change(callback: () => void, delay: number) {
    clear_display_timer()
    display_timer = window.setTimeout(() => {
      display_timer = 0
      callback()
    }, delay)
  }

  function finish_heat() {
    changing = false
    phase = 'hold'
  }

  function show_next_reading() {
    reading_index = (reading_index + 1) % tube_readings.length
    cycle += 1
  }

  function advance_reading() {
    show_next_reading()
    phase = 'heat'
    schedule_display_change(finish_heat, WORDMARK_BOOT_DURATION)
  }

  function begin_reading_change() {
    if (changing || phase === 'cool') return
    changing = true
    if (reduced_motion.current) {
      show_next_reading()
      finish_heat()
      return
    }
    phase = 'cool'
    schedule_display_change(advance_reading, WORDMARK_COOL_DURATION)
  }

  $effect.pre(() => {
    if (active === was_active) return
    was_active = active
    if (!active) return
    live_side = pick_circuit_side()
    if (cycle > 0 || phase === 'hold') begin_reading_change()
  })

  onMount(() => {
    if (reduced_motion.current) {
      phase = 'hold'
      return
    }
    schedule_display_change(
      finish_heat,
      WORDMARK_LIGHT_DELAY + WORDMARK_BOOT_DURATION,
    )
    return () => {
      clear_display_timer()
    }
  })
</script>

<svg
  class:active
  aria-hidden="true"
  class="wordmark"
  fill="none"
  style:--boot-duration={`${WORDMARK_BOOT_DURATION}ms`}
  style:--crash-duration={`${WORDMARK_CRASH_DURATION}ms`}
  style:--crash-pixel-duration={`${WORDMARK_CRASH_PIXEL_DURATION}ms`}
  style:--fade-duration={`${WORDMARK_FADE_DURATION}ms`}
  style:--light-delay={`${WORDMARK_LIGHT_DELAY}ms`}
  style:--circuit-pulse={`${WORDMARK_CRASH_DURATION}ms`}
  style:--cool-duration={`${WORDMARK_COOL_DURATION}ms`}
  viewBox="-4.8 0.2 68.4 14.2"
>
  <defs>
    <clipPath id="wordmark-glass-clip">
      <rect
        x={glass.x}
        y={glass.y}
        width={glass.width}
        height={glass.height}
        rx={glass.radius}
      />
    </clipPath>
    <linearGradient id="wordmark-sheen" x1="18%" y1="0%" x2="62%" y2="100%">
      <stop class="sheen-start" offset="0" />
      <stop class="sheen-mid" offset="0.36" />
      <stop class="sheen-end" offset="1" />
    </linearGradient>
    <radialGradient
      id="wordmark-vignette"
      cx="50%"
      cy="46%"
      r="72%"
      gradientUnits="objectBoundingBox"
    >
      <stop class="vignette-core" offset="0.42" />
      <stop class="vignette-edge" offset="1" />
    </radialGradient>
    <pattern
      id="wordmark-dust"
      width="1.1"
      height="1.1"
      patternUnits="userSpaceOnUse"
    >
      <circle class="dust-speck" cx="0.2" cy="0.35" r="0.045" />
      <circle class="dust-speck" cx="0.78" cy="0.82" r="0.035" />
    </pattern>
  </defs>

  <g class="chassis">
    <g clip-path="url(#wordmark-glass-clip)">
      <rect
        class="glass"
        x={glass.x}
        y={glass.y}
        width={glass.width}
        height={glass.height}
      />
      <rect
        class="glass-dust"
        x={glass.x}
        y={glass.y}
        width={glass.width}
        height={glass.height}
        fill="url(#wordmark-dust)"
      />
      <rect
        class="glass-vignette"
        x={glass.x}
        y={glass.y}
        width={glass.width}
        height={glass.height}
        fill="url(#wordmark-vignette)"
      />
      <rect
        class="glass-sheen"
        x={glass.x}
        y={glass.y}
        width={glass.width}
        height={glass.height}
        fill="url(#wordmark-sheen)"
      />
    </g>
    <rect
      class="glass-lip"
      x={glass.x}
      y={glass.y}
      width={glass.width}
      height={glass.height}
      rx={glass.radius}
    />
    <rect
      class="glass-rebate"
      x={glass.x + 0.28}
      y={glass.y + 0.28}
      width={glass.width - 0.56}
      height={glass.height - 0.56}
      rx={Math.max(glass.radius - 0.16, 0.16)}
    />
  </g>

  <g class="circuit">
    {#each circuit_traces as trace (`${trace.side}:${trace.d}`)}
      <path
        class:live={trace.side === live_side}
        class="circuit-trace circuit-trace-{trace.weight}"
        d={trace.d}
      />
    {/each}
    {#each circuit_nodes as node (`${node.side}:${node.x}:${node.y}`)}
      <g
        class:live={node.side === live_side}
        class="circuit-node"
        style:--pad-delay={`${node.delay}ms`}
        transform="translate({node.x} {node.y}) rotate({node.turn ?? 0})"
      >
        {#if node.kind === 'via'}
          <circle class="via-ring" r="0.26" />
          <circle class="via-hole" r="0.08" />
        {:else if node.kind === 'smd'}
          <rect
            class="smd-pad"
            x="-0.3"
            y="-0.15"
            width="0.6"
            height="0.3"
          />
        {:else}
          <circle class="land-pad" r="0.18" />
        {/if}
      </g>
    {/each}
  </g>

  <g class="filament" clip-path="url(#wordmark-glass-clip)">
    <path class="filament-idle" d={idle} />
    <g class="letters">
      {#key reading}
        <g
          class:cooling={phase === 'cool'}
          class:heating={phase === 'heat'}
          class:holding={phase === 'hold'}
          class:initial={cycle === 0}
          class="filament-on"
        >
          <path class="boot-matrix" d={lit.matrix} />
          <path class="boot-steady" d={lit.steady} />
          <path class="boot-pulse" d={lit.matrix} />
        </g>
      {/key}
    </g>
  </g>

  <g class="crash">
    {#each crash_pixels as pixel (pixel.x)}
      <rect
        class="crash-pixel"
        style:--crash-delay={`${pixel.delay}ms`}
        x={pixel.x}
        y={pixel.y}
        width="1.55"
        height="0.8"
        rx="0.1"
      />
    {/each}
  </g>
</svg>

<style>
  .wordmark {
    --ease-phosphor: cubic-bezier(0.37, 0.02, 0.2, 1);
    --filament: var(--color-stage-ink);
    --filament-dim: var(--color-stage-ink-secondary);
    display: block;
    width: 100%;
    height: auto;
    overflow: visible;
    pointer-events: none;
    opacity: 0;
    animation: wordmark-fade var(--fade-duration) var(--ease-in-out) both;
  }

  .glass {
    fill: color-mix(in oklab, var(--color-field) 12%, transparent);
  }

  .glass-dust {
    opacity: 0.22;
  }

  .dust-speck {
    fill: color-mix(
      in oklab,
      var(--color-stage-ink-secondary) 36%,
      transparent
    );
  }

  .sheen-start {
    stop-color: var(--color-paper);
    stop-opacity: 0.2;
  }

  .sheen-mid,
  .vignette-core {
    stop-color: var(--color-paper);
    stop-opacity: 0;
  }

  .sheen-end {
    stop-color: var(--color-ink);
    stop-opacity: 0;
  }

  .vignette-edge {
    stop-color: var(--color-field);
    stop-opacity: 0.16;
  }

  .glass-lip {
    fill: none;
    stroke: color-mix(
      in oklab,
      var(--color-stage-ink-secondary) 40%,
      transparent
    );
    stroke-width: 0.16;
    transition: stroke var(--dur-long) var(--ease-in-out);
  }

  .glass-rebate {
    fill: none;
    stroke: color-mix(in oklab, var(--color-paper) 22%, transparent);
    stroke-width: 0.08;
  }

  .circuit-trace {
    fill: none;
    stroke: color-mix(
      in oklab,
      var(--color-stage-ink-secondary) 36%,
      transparent
    );
    stroke-linecap: square;
    stroke-linejoin: miter;
    transition: stroke var(--dur-long) var(--ease-in-out);
  }

  .circuit-trace-power {
    stroke-width: 0.16;
  }

  .circuit-trace-signal {
    stroke-width: 0.09;
  }

  .circuit-trace-pair {
    stroke-width: 0.07;
    stroke: color-mix(
      in oklab,
      var(--color-stage-ink-secondary) 26%,
      transparent
    );
  }

  .via-ring {
    fill: none;
    stroke: color-mix(
      in oklab,
      var(--color-stage-ink-secondary) 44%,
      transparent
    );
    stroke-width: 0.08;
  }

  .via-hole {
    fill: color-mix(
      in oklab,
      var(--color-stage-ink-secondary) 38%,
      transparent
    );
  }

  .land-pad {
    fill: color-mix(
      in oklab,
      var(--color-stage-ink-secondary) 32%,
      transparent
    );
    stroke: color-mix(
      in oklab,
      var(--color-stage-ink-secondary) 42%,
      transparent
    );
    stroke-width: 0.06;
  }

  .smd-pad {
    fill: color-mix(
      in oklab,
      var(--color-stage-ink-secondary) 34%,
      transparent
    );
    stroke: color-mix(
      in oklab,
      var(--color-stage-ink-secondary) 40%,
      transparent
    );
    stroke-width: 0.05;
  }

  .circuit-node {
    transition:
      fill var(--dur-long) var(--ease-in-out),
      stroke var(--dur-long) var(--ease-in-out);
  }

  .filament-idle {
    fill: color-mix(
      in oklab,
      var(--color-stage-ink-secondary) 22%,
      transparent
    );
  }

  .letters {
    transform-box: fill-box;
    transform-origin: center;
  }

  .filament-on {
    transform-box: fill-box;
    transform-origin: center;
  }

  .filament-on.heating {
    animation: filament-drift var(--boot-duration) linear both;
  }

  .filament-on.heating.initial {
    animation-delay: var(--light-delay);
  }

  .boot-matrix,
  .boot-steady {
    transition: fill var(--dur-long) var(--ease-in-out);
  }

  .boot-matrix {
    fill: var(--filament-dim);
    opacity: 0;
  }

  .boot-steady,
  .boot-pulse {
    fill: var(--filament);
    opacity: 0;
  }

  .filament-on.heating .boot-matrix {
    animation: filament-heat var(--boot-duration) var(--ease-phosphor) both;
  }

  .filament-on.heating.initial .boot-matrix {
    animation-delay: var(--light-delay);
  }

  .filament-on.heating .boot-steady {
    animation: filament-hold calc(var(--boot-duration) * 0.55)
      var(--ease-phosphor) calc(var(--boot-duration) * 0.52) both;
  }

  .filament-on.heating.initial .boot-steady {
    animation-delay: calc(var(--light-delay) + var(--boot-duration) * 0.52);
  }

  .filament-on.heating .boot-pulse {
    animation: filament-strike calc(var(--boot-duration) * 0.7)
      var(--ease-phosphor) calc(var(--boot-duration) * 0.42) both;
  }

  .filament-on.heating.initial .boot-pulse {
    animation-delay: calc(var(--light-delay) + var(--boot-duration) * 0.42);
  }

  .filament-on.holding .boot-matrix,
  .filament-on.holding .boot-steady {
    opacity: 1;
  }

  .filament-on.cooling .boot-matrix,
  .filament-on.cooling .boot-steady {
    animation: filament-cool var(--cool-duration) var(--ease-phosphor) both;
  }

  .crash-pixel {
    fill: var(--signal);
    opacity: 0;
    transform-box: fill-box;
    transform-origin: center;
  }

  .wordmark.active {
    --filament: color-mix(
      in oklab,
      var(--signal) 42%,
      var(--color-stage-ink)
    );
    --filament-dim: color-mix(
      in oklab,
      var(--signal) 26%,
      var(--color-stage-ink-secondary)
    );
  }

  .wordmark.active .glass-lip {
    stroke: color-mix(
      in oklab,
      var(--signal) 34%,
      var(--color-stage-ink-secondary)
    );
  }

  .wordmark.active .circuit-trace.live {
    stroke: color-mix(
      in oklab,
      var(--signal) 48%,
      var(--color-stage-ink-secondary)
    );
    animation: circuit-carry var(--circuit-pulse) var(--ease-phosphor) both;
  }

  .wordmark.active .circuit-node.live .via-ring,
  .wordmark.active .circuit-node.live .land-pad,
  .wordmark.active .circuit-node.live .smd-pad {
    stroke: color-mix(
      in oklab,
      var(--signal) 52%,
      var(--color-stage-ink-secondary)
    );
  }

  .wordmark.active .circuit-node.live .via-hole,
  .wordmark.active .circuit-node.live .land-pad,
  .wordmark.active .circuit-node.live .smd-pad {
    fill: color-mix(
      in oklab,
      var(--signal) 46%,
      var(--color-stage-ink-secondary)
    );
    animation: circuit-pulse var(--circuit-pulse) var(--ease-phosphor)
      var(--pad-delay) both;
  }

  .wordmark.active .letters {
    animation: wordmark-crash var(--crash-duration) var(--ease-phosphor)
      both;
  }

  .wordmark.active .crash-pixel {
    animation: pixel-crash var(--crash-pixel-duration) var(--ease-phosphor)
      var(--crash-delay) both;
  }

  @keyframes wordmark-fade {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }

  @keyframes wordmark-crash {
    0%,
    to {
      transform: translate(0);
    }
    18% {
      transform: translate(0.28px, -0.12px);
    }
    36% {
      transform: translate(-0.16px, 0.08px);
    }
  }

  @keyframes filament-heat {
    0% {
      opacity: 0;
    }
    28% {
      opacity: 0.32;
    }
    64% {
      opacity: 0.78;
    }
    to {
      opacity: 1;
    }
  }

  @keyframes filament-cool {
    0% {
      opacity: 1;
    }
    45% {
      opacity: 0.48;
    }
    to {
      opacity: 0;
    }
  }

  @keyframes filament-drift {
    0%,
    to {
      transform: translate(0);
    }
    40% {
      transform: translate(0.06px, -0.03px);
    }
    72% {
      transform: translate(-0.04px, 0.02px);
    }
  }

  @keyframes filament-strike {
    0%,
    68% {
      opacity: 0;
    }
    82% {
      opacity: 0.14;
    }
    to {
      opacity: 0;
    }
  }

  @keyframes filament-hold {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }

  @keyframes circuit-pulse {
    0%,
    to {
      opacity: 1;
    }
    28% {
      opacity: 0.35;
    }
    52% {
      opacity: 1;
    }
  }

  @keyframes circuit-carry {
    0%,
    to {
      stroke-opacity: 1;
    }
    30% {
      stroke-opacity: 0.42;
    }
    58% {
      stroke-opacity: 1;
    }
  }

  @keyframes pixel-crash {
    0% {
      opacity: 0;
      transform: translate(0);
    }
    22% {
      opacity: 0.55;
      transform: translate(0.2px, 0);
    }
    58% {
      opacity: 0.18;
      transform: translate(0.9px, 0.04px);
    }
    to {
      opacity: 0;
      transform: translate(1.6px, 0.06px);
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .wordmark,
    .wordmark.active .letters,
    .filament-on,
    .filament-on.heating,
    .filament-on.cooling,
    .boot-matrix,
    .boot-pulse,
    .boot-steady,
    .wordmark.active .crash-pixel,
    .wordmark.active .circuit-node.live .via-hole,
    .wordmark.active .circuit-node.live .land-pad,
    .wordmark.active .circuit-node.live .smd-pad,
    .wordmark.active .circuit-trace.live {
      animation: none;
    }

    .wordmark,
    .boot-matrix,
    .boot-steady {
      opacity: 1;
      transition: none;
    }
  }
</style>

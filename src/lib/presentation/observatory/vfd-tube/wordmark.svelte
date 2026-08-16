<script lang="ts">
  import { reduced_motion } from '$lib/browser/reduced-motion'
  import { onMount } from 'svelte'

  import { circuit_nodes, circuit_traces } from './circuit'
  import { WORDMARK_BOOT_DURATION, WORDMARK_LIGHT_DELAY } from './intro'
  import {
    VFD_LAYOUT,
    VFD_GLYPH_ROWS,
    build_vfd_idle,
    fit_vfd_text,
    vfd_word_width,
  } from './matrix'
  import VfdMatrix from './matrix.svelte'
  import {
    VFD_REFRESH_INTERVAL,
    VFD_REFRESH_READOUTS,
    VFD_REFRESH_STEP_DURATION,
    vfd_refresh_frame,
  } from './refresh'

  interface Props {
    readout?: string
  }

  const tube_slots = 9
  const tube_lines = 2
  const glass = {
    height:
      VFD_GLYPH_ROWS + VFD_LAYOUT.line_pitch * (tube_lines - 1) + 1.28,
    radius: 0.4,
    width: vfd_word_width(tube_slots) + 3.2,
    x: -1.6,
    y: 3.18,
  }
  const idle = build_vfd_idle(tube_slots, tube_lines)

  /* oxlint-disable prefer-const -- The readout can update from a host part. */
  let { readout = 'R322*D+42' }: Props = $props()
  let refresh_step = $state(-1)
  let readout_index = $state(-1)
  /* oxlint-disable prefer-const -- Svelte binding assigns DOM state. */
  let wordmark = $state<SVGSVGElement>()
  const reading = fit_vfd_text('CAELYRETH', tube_slots)
  const active_readout = $derived(
    readout_index < 0
      ? readout
      : (VFD_REFRESH_READOUTS[
          readout_index % VFD_REFRESH_READOUTS.length
        ] ?? readout),
  )
  const refresh_reading = $derived(
    refresh_step < 0
      ? active_readout
      : vfd_refresh_frame(refresh_step, tube_slots),
  )
  const secondary_reading = $derived(
    fit_vfd_text(refresh_reading, tube_slots),
  )
  const matrix_lines = $derived([reading, secondary_reading])
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

  function begin_refresh() {
    refresh_step = 0
    schedule_display_change(advance_refresh, VFD_REFRESH_STEP_DURATION)
  }

  function advance_refresh() {
    if (refresh_step < tube_slots) {
      refresh_step += 1
      schedule_display_change(advance_refresh, VFD_REFRESH_STEP_DURATION)
      return
    }

    readout_index += 1
    refresh_step = -1
    schedule_display_change(begin_refresh, VFD_REFRESH_INTERVAL)
  }

  onMount(() => {
    if (reduced_motion.current) return
    if (!wordmark || typeof IntersectionObserver === 'undefined') {
      schedule_display_change(begin_refresh, VFD_REFRESH_INTERVAL)
      return clear_display_timer
    }

    const observer = new IntersectionObserver(([entry]) => {
      clear_display_timer()
      if (!entry?.isIntersecting) {
        refresh_step = -1
        return
      }
      schedule_display_change(begin_refresh, VFD_REFRESH_INTERVAL)
    })
    observer.observe(wordmark)

    return () => {
      clear_display_timer()
      observer.disconnect()
    }
  })
</script>

<svg
  aria-hidden="true"
  class="wordmark"
  bind:this={wordmark}
  fill="none"
  style:--boot-duration={`${WORDMARK_BOOT_DURATION}ms`}
  style:--light-delay={`${WORDMARK_LIGHT_DELAY}ms`}
  viewBox="-4.8 0.2 68.4 22.2"
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
    {#each circuit_traces as trace (trace.d)}
      <path
        class="circuit-trace circuit-trace-{trace.weight}"
        d={trace.d}
      />
    {/each}
    {#each circuit_nodes as node (`${node.x}:${node.y}`)}
      <g
        class="circuit-node"
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
    <path class="filament-idle" d={idle.matrix} />
    <path class="filament-idle-dim" d={idle.dim} />
    <VfdMatrix lines={matrix_lines} slots={tube_slots} />
  </g>
</svg>

<style>
  .wordmark {
    --ease-phosphor: cubic-bezier(0.37, 0.02, 0.2, 1);
    --filament: var(--color-stage-ink);
    display: block;
    width: 100%;
    height: auto;
    overflow: visible;
    pointer-events: none;
  }

  .glass {
    fill: color-mix(
      in oklab,
      var(--color-stage-glass-surface) 20%,
      transparent
    );
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
    stop-color: var(--color-stage-glass-surface);
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

  .filament-idle {
    fill: color-mix(
      in oklab,
      var(--color-stage-ink-secondary) 22%,
      transparent
    );
  }

  .filament-idle-dim {
    fill: color-mix(
      in oklab,
      var(--color-stage-ink-secondary) 12%,
      transparent
    );
  }
</style>

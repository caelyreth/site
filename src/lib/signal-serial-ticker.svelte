<script lang="ts">
  const SERIALS = [
    'YU-044-0017',
    'SOL-118-0912',
    'RBK-OBS-0004',
    'CAE-RELAY-72',
    'ARC-2026-004',
    'FIELD-044-12',
    'TX-001-KEEP',
    'WND-004-CAEL',
    'STA-00-RBK',
  ] as const
  const ROW_OFFSETS = [-2, -1, 0, 1, 2, 3, 4] as const
  const STEP_TIMES = [426, 986] as const

  const {
    pulseActive,
    onStep,
  }: {
    pulseActive: boolean
    onStep?: () => void
  } = $props()

  let activeIndex = $state(0)
  let stepComplete = $state(false)
  let stepTimers: number[] = []

  const serialAt = (offset: number) => {
    const index = (activeIndex + offset + SERIALS.length) % SERIALS.length
    return SERIALS[index]
  }

  $effect(() => {
    for (const timer of stepTimers) window.clearTimeout(timer)
    stepTimers = []

    if (!pulseActive) {
      stepComplete = false
      return
    }

    stepTimers = STEP_TIMES.map((delay) => window.setTimeout(() => onStep?.(), delay))

    return () => {
      for (const timer of stepTimers) window.clearTimeout(timer)
      stepTimers = []
    }
  })

  function finishStep() {
    if (!pulseActive || stepComplete) return
    activeIndex = (activeIndex + 2) % SERIALS.length
    stepComplete = true
  }
</script>

<div
  aria-hidden="true"
  class="signal-serial hidden sm:block"
  class:is-stepping={pulseActive && !stepComplete}
>
  <div class="signal-serial-viewport">
    <div class="signal-serial-track signal-serial-track-base" onanimationend={finishStep}>
      {#each ROW_OFFSETS as offset}
        <span class="signal-serial-row">{serialAt(offset)}</span>
      {/each}
    </div>

    <div class="signal-serial-active">
      <div class="signal-serial-track signal-serial-track-active">
        {#each ROW_OFFSETS as offset}
          <span class="signal-serial-row">{serialAt(offset)}</span>
        {/each}
      </div>
    </div>
  </div>
</div>

<style>
  /* Hallmark · component: signal serial ticker · genre: atmospheric · theme: project custom
   * pulse-bound decorative telemetry; five-row viewport; transform-only two-step loop
   * pre-emit critique: P5 H5 E5 S5 R5 V5
   */
  .signal-serial {
    --ticker-row: 1.375rem;

    position: absolute;
    top: 50%;
    left: var(--scene-inline-inset);
    z-index: 2;
    width: 10.5rem;
    color: var(--space-ink-2);
    font-size: 0.75rem;
    font-variant-numeric: tabular-nums;
    font-weight: 500;
    letter-spacing: 0.08em;
    line-height: var(--ticker-row);
    opacity: max(0, calc(1 - var(--p, 0) * 1.3));
    text-transform: uppercase;
    transform: translateY(-50%);
  }

  .signal-serial-viewport {
    position: relative;
    height: calc(var(--ticker-row) * 5);
    overflow: hidden;
  }

  .signal-serial-track {
    display: grid;
    grid-auto-rows: var(--ticker-row);
    width: max-content;
    min-width: 100%;
    will-change: auto;
  }

  .signal-serial-track-base {
    opacity: 0.72;
    mask-image: linear-gradient(
      to bottom,
      transparent 0,
      black 15%,
      black 38%,
      black 62%,
      black 85%,
      transparent 100%
    );
  }

  .signal-serial-active {
    position: absolute;
    top: calc(var(--ticker-row) * 2);
    right: 0;
    left: 0;
    height: var(--ticker-row);
    overflow: hidden;
    color: var(--color-accent);
  }

  .signal-serial-track-active {
    position: absolute;
    top: calc(var(--ticker-row) * -2);
    left: 0;
  }

  .signal-serial-row {
    display: block;
    overflow: hidden;
    white-space: nowrap;
  }

  .signal-serial.is-stepping .signal-serial-track {
    animation: signal-serial-step 1120ms var(--ease-in-out) both;
    will-change: transform;
  }

  @keyframes signal-serial-step {
    0% {
      transform: translate3d(0, 0, 0);
    }
    38% {
      transform: translate3d(0, calc(var(--ticker-row) * -1), 0);
    }
    50% {
      transform: translate3d(0, calc(var(--ticker-row) * -1), 0);
    }
    88%,
    100% {
      transform: translate3d(0, calc(var(--ticker-row) * -2), 0);
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .signal-serial.is-stepping .signal-serial-track {
      animation: none;
      will-change: auto;
    }
  }
</style>

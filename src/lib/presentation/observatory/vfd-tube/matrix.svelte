<script lang="ts">
  import { reduced_motion } from '$lib/browser/reduced-motion'
  import { onMount } from 'svelte'

  import { WORDMARK_BOOT_DURATION, WORDMARK_LIGHT_DELAY } from './intro'
  import { cell_layout, lit_mask } from './matrix'

  interface Props {
    lines: readonly string[]
    slots: number
  }

  const { lines, slots }: Props = $props()
  const cells = $derived(cell_layout(lines.length, slots))
  const lit_cells = $derived(lit_mask(lines, slots))
  let mounted = $state(false)
  let booting = $state(true)
  let animation_frame = 0
  let boot_timer = 0

  onMount(() => {
    if (reduced_motion.current) {
      mounted = true
      booting = false
      return
    }

    animation_frame = window.requestAnimationFrame(() => {
      mounted = true
      boot_timer = window.setTimeout(
        () => (booting = false),
        WORDMARK_LIGHT_DELAY + WORDMARK_BOOT_DURATION + 96,
      )
    })

    return () => {
      window.cancelAnimationFrame(animation_frame)
      if (boot_timer) window.clearTimeout(boot_timer)
    }
  })
</script>

<g class="matrix">
  {#each cells as cell, index (cell.key)}
    <path
      class:lit={lit_cells[index]}
      class:mounted
      class:booting
      class="matrix-cell"
      d={cell.d}
      style:--cell-delay={`${cell.delay}ms`}
      style:--cell-opacity={cell.opacity}
    />
  {/each}
</g>

<style>
  .matrix-cell {
    fill: var(--filament);
    fill-opacity: var(--cell-opacity);
    opacity: 0;
    transition:
      opacity var(--boot-duration) var(--ease-phosphor),
      fill-opacity var(--boot-duration) var(--ease-phosphor);
  }

  .matrix-cell.mounted.lit {
    opacity: 1;
    transition-duration: 240ms, var(--boot-duration);
  }

  .matrix-cell.mounted.lit.booting {
    animation: matrix-light var(--boot-duration) var(--ease-phosphor) both;
    animation-delay: calc(var(--light-delay) + var(--cell-delay));
  }

  @keyframes matrix-light {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .matrix-cell {
      animation: none;
      transition: none;
    }
  }
</style>

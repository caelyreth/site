<script lang="ts">
  /* oxlint-disable prefer-const -- bind:this assigns this Svelte rune. */
  import type { createSkyMapField } from '$lib/graphics/observatory/sky-map-field'
  import { onMount } from 'svelte'
  import { useTheme } from 'svelte-themes'

  type FieldController = ReturnType<typeof createSkyMapField>
  type CanvasProps = {
    onPulseComplete?: () => void
  }

  let { onPulseComplete }: CanvasProps = $props()
  const theme = useTheme()
  let canvas = $state<HTMLCanvasElement | undefined>()
  let controller = $state<FieldController>()
  let sceneVisible = $state(false)
  let pageVisible = $state(true)
  let fieldReady = $state(false)

  function syncActivity() {
    controller?.setActive(sceneVisible && pageVisible)
  }

  onMount(() => {
    if (!canvas) return

    let disposed = false
    let revealFrame: number | undefined
    const observer =
      typeof IntersectionObserver === 'undefined'
        ? undefined
        : new IntersectionObserver(([entry]) => {
            sceneVisible = entry?.isIntersecting ?? false
            syncActivity()
          })
    const handleVisibility = () => {
      pageVisible = document.visibilityState === 'visible'
      syncActivity()
    }

    if (observer) {
      observer.observe(canvas)
    } else {
      sceneVisible = true
    }
    document.addEventListener('visibilitychange', handleVisibility)
    pageVisible = document.visibilityState === 'visible'

    void Promise.all([
      import('$lib/graphics/observatory/sky-map-field'),
      import('$lib/data/sky-map-data.generated'),
    ])
      .then(([runtime, skyData]) => {
        if (disposed || !canvas) return
        controller = runtime.createSkyMapField(
          canvas,
          skyData,
          theme.resolvedTheme === 'dark',
          onPulseComplete,
        )
        syncActivity()
        revealFrame = requestAnimationFrame(() => {
          revealFrame = undefined
          fieldReady = !disposed
        })
      })
      .catch((error: unknown) => {
        if (!disposed) {
          console.error(
            'Unable to initialize the observatory sky map.',
            error,
          )
        }
      })

    return () => {
      disposed = true
      if (revealFrame !== undefined) cancelAnimationFrame(revealFrame)
      observer?.disconnect()
      document.removeEventListener('visibilitychange', handleVisibility)
      controller?.destroy()
      controller = undefined
      fieldReady = false
    }
  })

  $effect(() => {
    controller?.setTheme(theme.resolvedTheme === 'dark')
    controller?.setActive(sceneVisible && pageVisible)
  })
</script>

<canvas
  aria-hidden="true"
  bind:this={canvas}
  class:is-ready={fieldReady}
  class="canvas"
  data-observatory-canvas
></canvas>

<style>
  .canvas {
    position: absolute;
    inset: 0;
    z-index: 1;
    display: block;
    width: 100%;
    height: 100%;
    pointer-events: none;
    opacity: 0;
    transition: opacity var(--dur-long) var(--ease-out);
  }

  .canvas.is-ready {
    opacity: max(0, calc(1 - var(--p, 0) * 1.25));
  }

  @media (prefers-reduced-motion: reduce) {
    .canvas {
      transition: none;
    }

    .canvas.is-ready {
      opacity: max(0, calc(0.72 - var(--p, 0) * 1.05));
    }
  }
</style>

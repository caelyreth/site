<script lang="ts">
  /* oxlint-disable prefer-const -- bind:this assigns this Svelte rune. */
  import { load_sky_map_engine } from '$lib/presentation/surfaces/sky-map/runtime/load-engine'
  import type {
    SkyMapEngine,
    SkyMapRuntimeEvent,
  } from '$lib/presentation/surfaces/sky-map/runtime/types'
  import { reduced_motion } from '$lib/site/reduced-motion'
  import { onMount } from 'svelte'
  import { useTheme } from 'svelte-themes'

  import { SKY_SCENE_START_DELAY } from '../intro'

  interface CanvasProps {
    on_event?: (event: SkyMapRuntimeEvent) => void
  }

  /* oxlint-disable prefer-const -- props react to parent callbacks. */
  let { on_event }: CanvasProps = $props()
  const theme = useTheme()
  let canvas = $state<HTMLCanvasElement | undefined>()
  let engine = $state<SkyMapEngine>()
  let canvas_visible = $state(false)
  let page_visible = $state(true)
  let field_ready = $state(false)

  function sync_activity() {
    engine?.set_active(canvas_visible && page_visible)
  }

  onMount(() => {
    if (!canvas) return

    let disposed = false
    let reveal_timer: ReturnType<typeof setTimeout> | undefined
    let scene_timer: ReturnType<typeof setTimeout> | undefined
    const observer =
      typeof IntersectionObserver === 'undefined'
        ? undefined
        : new IntersectionObserver(([entry]) => {
            canvas_visible = entry?.isIntersecting ?? false
            sync_activity()
          })
    const handle_visibility = () => {
      page_visible = document.visibilityState === 'visible'
      sync_activity()
    }

    if (observer) {
      observer.observe(canvas)
    } else {
      canvas_visible = true
    }
    document.addEventListener('visibilitychange', handle_visibility)
    page_visible = document.visibilityState === 'visible'

    const start_scene = () => {
      void load_sky_map_engine()
        .then(({ create_engine, sky_data }) => {
          if (disposed || !canvas) return
          engine = create_engine(
            canvas,
            sky_data,
            theme.resolvedTheme === 'dark',
            { on_event },
          )
          sync_activity()
          reveal_timer = setTimeout(() => {
            if (!disposed) {
              field_ready = true
            }
          }, 32)
        })
        .catch((error: unknown) => {
          if (!disposed) {
            console.error('Unable to initialize the sky map.', error)
          }
        })
    }

    scene_timer = setTimeout(
      start_scene,
      reduced_motion.current ? 0 : SKY_SCENE_START_DELAY,
    )

    return () => {
      disposed = true
      if (scene_timer !== undefined) clearTimeout(scene_timer)
      if (reveal_timer !== undefined) clearTimeout(reveal_timer)
      observer?.disconnect()
      document.removeEventListener('visibilitychange', handle_visibility)
      engine?.destroy()
      engine = undefined
      field_ready = false
    }
  })

  $effect(() => {
    engine?.set_theme(theme.resolvedTheme === 'dark')
    engine?.set_active(canvas_visible && page_visible)
  })
</script>

<canvas
  aria-hidden="true"
  bind:this={canvas}
  class:is-ready={field_ready}
  class="canvas"
  data-sky-map-canvas
></canvas>

<style>
  .canvas {
    --scene-reveal-duration: 1100ms;
    position: absolute;
    top: 0;
    left: 50%;
    z-index: 1;
    display: block;
    width: calc(100vw - 2 * var(--stage-frame-inset));
    height: calc(100dvh - var(--stage-top) - var(--stage-frame-inset));
    pointer-events: none;
    opacity: 0;
    transform: translateX(-50%);
    will-change: opacity;
    transition: opacity var(--scene-reveal-duration) var(--ease-out);
  }

  .canvas.is-ready {
    opacity: max(0, calc(1 - var(--stage-progress) * 1.25));
  }

  @media (prefers-reduced-motion: reduce) {
    .canvas {
      transition: none;
    }

    .canvas.is-ready {
      opacity: max(0, calc(0.72 - var(--stage-progress) * 1.05));
    }
  }
</style>

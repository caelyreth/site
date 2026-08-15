<script lang="ts">
  /* oxlint-disable complexity -- Canvas lifecycle coordinates engine startup with browser observers. */
  /* oxlint-disable prefer-const -- bind:this assigns this Svelte rune. */
  import { load_sky_map_engine } from '$lib/presentation/surfaces/sky-map/runtime/load-engine'
  import type {
    SkyMapEngine,
    SkyMapRuntimeEvent,
    SkyMapViewport,
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

  function clamp_unit(value: number) {
    return Math.min(1, Math.max(0, value))
  }

  function viewport_for(
    canvas_bounds: DOMRect,
    route_bounds: DOMRect,
    surface_bounds: DOMRect,
  ): SkyMapViewport | undefined {
    const { height, width } = canvas_bounds
    if (width <= 0 || height <= 0) return undefined

    const left = Math.max(
      canvas_bounds.left,
      route_bounds.left,
      surface_bounds.left,
    )
    const right = Math.min(
      canvas_bounds.right,
      route_bounds.right,
      surface_bounds.right,
    )
    const top = Math.max(
      canvas_bounds.top,
      route_bounds.top,
      surface_bounds.top,
    )
    const bottom = Math.min(
      canvas_bounds.bottom,
      route_bounds.bottom,
      surface_bounds.bottom,
    )
    if (right <= left || bottom <= top) return undefined

    return {
      bottom: clamp_unit((bottom - canvas_bounds.top) / height),
      left: clamp_unit((left - canvas_bounds.left) / width),
      right: clamp_unit((right - canvas_bounds.left) / width),
      top: clamp_unit((top - canvas_bounds.top) / height),
    }
  }

  function sync_activity() {
    engine?.set_active(canvas_visible && page_visible)
  }

  onMount(() => {
    if (!canvas) return

    const sky_map = canvas.closest<HTMLElement>('[data-sky-map]')
    const route_viewport = sky_map?.querySelector<HTMLElement>(
      '[data-sky-map-route-viewport]',
    )
    let disposed = false
    let reveal_timer: ReturnType<typeof setTimeout> | undefined
    let scene_timer: ReturnType<typeof setTimeout> | undefined
    let viewport_frame: number | undefined
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
    const sync_active_viewport = () => {
      if (!canvas || !route_viewport || !sky_map) return
      const active_viewport = viewport_for(
        canvas.getBoundingClientRect(),
        route_viewport.getBoundingClientRect(),
        sky_map.getBoundingClientRect(),
      )
      engine?.set_active_viewport(active_viewport)
    }
    const schedule_active_viewport_sync = () => {
      if (viewport_frame !== undefined) return
      viewport_frame = requestAnimationFrame(() => {
        viewport_frame = undefined
        sync_active_viewport()
      })
    }
    const viewport_observer =
      route_viewport && typeof ResizeObserver !== 'undefined'
        ? new ResizeObserver(schedule_active_viewport_sync)
        : undefined

    if (observer) {
      observer.observe(canvas)
    } else {
      canvas_visible = true
    }
    if (viewport_observer && route_viewport && sky_map) {
      viewport_observer.observe(canvas)
      viewport_observer.observe(route_viewport)
      viewport_observer.observe(sky_map)
    }
    document.addEventListener('visibilitychange', handle_visibility)
    window.addEventListener('scroll', schedule_active_viewport_sync, {
      passive: true,
    })
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
          sync_active_viewport()
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
      if (viewport_frame !== undefined) cancelAnimationFrame(viewport_frame)
      observer?.disconnect()
      viewport_observer?.disconnect()
      document.removeEventListener('visibilitychange', handle_visibility)
      window.removeEventListener('scroll', schedule_active_viewport_sync)
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
    --sky-map-field-mask: linear-gradient(
      to right,
      transparent var(--sky-map-fade-start),
      #000 var(--sky-map-fade-end)
    );
    position: absolute;
    top: 0;
    left: var(--sky-map-field-start);
    z-index: 1;
    display: block;
    width: calc(100% - var(--sky-map-field-start));
    height: 100%;
    pointer-events: none;
    opacity: 0;
    will-change: opacity;
    -webkit-mask-image: var(--sky-map-field-mask);
    -webkit-mask-repeat: no-repeat;
    mask-image: var(--sky-map-field-mask);
    mask-repeat: no-repeat;
    transition: opacity var(--scene-reveal-duration) var(--ease-out);
  }

  .canvas.is-ready {
    opacity: 1;
  }

  @media (prefers-reduced-motion: reduce) {
    .canvas {
      transition: none;
    }

    .canvas.is-ready {
      opacity: 0.72;
    }
  }
</style>

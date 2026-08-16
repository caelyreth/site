<script lang="ts">
  /* oxlint-disable prefer-const -- Svelte bindings update client state. */
  import { load_sky_map_engine } from '$lib/presentation/surfaces/sky-map/runtime/load-engine'
  import type { SkyMapEngine } from '$lib/presentation/surfaces/sky-map/runtime/types'
  import { reduced_motion } from '$lib/site/reduced-motion'
  import { onMount } from 'svelte'
  import { useTheme } from 'svelte-themes'

  import { SKY_SCENE_START_DELAY } from '../intro'

  interface Props {
    deferred?: boolean
  }

  let { deferred = false }: Props = $props()
  const theme = useTheme()
  let canvas = $state<HTMLCanvasElement | undefined>()
  let engine = $state<SkyMapEngine>()
  let canvas_visible = $state(false)
  let page_visible = $state(true)
  let field_ready = $state(false)

  function sync_activity() {
    engine?.set_active(canvas_visible && page_visible && !deferred)
  }

  onMount(() => {
    if (!canvas) return

    let disposed = false
    let reveal_timer: ReturnType<typeof setTimeout> | undefined
    const observer =
      typeof IntersectionObserver === 'undefined'
        ? undefined
        : new IntersectionObserver(
            ([entry]) => {
              canvas_visible = entry?.isIntersecting ?? false
              sync_activity()
            },
            { rootMargin: '75% 0px 60%' },
          )
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
        .then(({ create_engine }) => {
          if (disposed || !canvas) return
          engine = create_engine(canvas, theme.resolvedTheme === 'dark')
          sync_activity()
          reveal_timer = setTimeout(() => {
            if (!disposed) field_ready = true
          }, 32)
        })
        .catch((error: unknown) => {
          if (!disposed) {
            console.error('Unable to initialize the sky map.', error)
          }
        })
    }

    const scene_timer = setTimeout(
      start_scene,
      reduced_motion.current ? 0 : SKY_SCENE_START_DELAY,
    )

    return () => {
      disposed = true
      clearTimeout(scene_timer)
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
    sync_activity()
  })
</script>

<canvas
  aria-hidden="true"
  bind:this={canvas}
  class:is-deferred={deferred}
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

  .canvas.is-deferred {
    opacity: 0;
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

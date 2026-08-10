<script lang="ts">
  /* oxlint-disable prefer-const -- bind:this assigns this Svelte rune. */
  import { load_sky_map_engine } from '$lib/graphics/observatory/load-engine'
  import type {
    SkyMapEngine,
    SkyMapLayerMotionStatus,
    SkyMapPulseStatus,
    SkyMapRollerMotionStatus,
    SkyMapViewStatus,
  } from '$lib/graphics/observatory/types'
  import { onMount } from 'svelte'
  import { useTheme } from 'svelte-themes'

  type CanvasProps = {
    on_destination_arrival?: () => void
    on_fade_in_start?: () => void
    on_foreground_contract_start?: (status: SkyMapLayerMotionStatus) => void
    on_foreground_return_start?: (status: SkyMapLayerMotionStatus) => void
    on_roller_motion?: (status: SkyMapRollerMotionStatus) => void
    on_spread_end?: () => void
    on_spread_start?: (status: SkyMapPulseStatus) => void
    on_view_change?: (status: SkyMapViewStatus) => void
  }

  /* oxlint-disable prefer-const -- props react to parent callbacks. */
  let {
    on_destination_arrival,
    on_fade_in_start,
    on_foreground_contract_start,
    on_foreground_return_start,
    on_roller_motion,
    on_spread_end,
    on_spread_start,
    on_view_change,
  }: CanvasProps = $props()
  const theme = useTheme()
  let canvas = $state<HTMLCanvasElement | undefined>()
  let engine = $state<SkyMapEngine>()
  let scene_visible = $state(false)
  let page_visible = $state(true)
  let field_ready = $state(false)

  // MARK: - lifecycle

  function sync_activity() {
    engine?.set_active(scene_visible && page_visible)
  }

  onMount(() => {
    if (!canvas) return

    let disposed = false
    let reveal_frame: number | undefined
    const observer =
      typeof IntersectionObserver === 'undefined'
        ? undefined
        : new IntersectionObserver(([entry]) => {
            scene_visible = entry?.isIntersecting ?? false
            sync_activity()
          })
    const handle_visibility = () => {
      page_visible = document.visibilityState === 'visible'
      sync_activity()
    }

    if (observer) {
      observer.observe(canvas)
    } else {
      scene_visible = true
    }
    document.addEventListener('visibilitychange', handle_visibility)
    page_visible = document.visibilityState === 'visible'

    void load_sky_map_engine()
      .then(({ create_engine, sky_data }) => {
        if (disposed || !canvas) return
        engine = create_engine(
          canvas,
          sky_data,
          theme.resolvedTheme === 'dark',
          {
            on_destination_arrival,
            on_foreground_contract_start,
            on_foreground_return_start,
            on_roller_motion,
            on_spread_end,
            on_spread_start,
            on_view_change,
          },
        )
        sync_activity()
        reveal_frame = requestAnimationFrame(() => {
          if (disposed) return
          reveal_frame = requestAnimationFrame(() => {
            reveal_frame = undefined
            field_ready = true
            on_fade_in_start?.()
          })
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
      if (reveal_frame !== undefined) cancelAnimationFrame(reveal_frame)
      observer?.disconnect()
      document.removeEventListener('visibilitychange', handle_visibility)
      engine?.destroy()
      engine = undefined
      field_ready = false
    }
  })

  $effect(() => {
    engine?.set_theme(theme.resolvedTheme === 'dark')
    engine?.set_active(scene_visible && page_visible)
  })
</script>

<canvas
  aria-hidden="true"
  bind:this={canvas}
  class:is-ready={field_ready}
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
    transition: opacity 1000ms var(--ease-out);
  }

  .canvas.is-ready {
    opacity: max(0, calc(1 - var(--observatory-progress) * 1.25));
  }

  @media (prefers-reduced-motion: reduce) {
    .canvas {
      transition: none;
    }

    .canvas.is-ready {
      opacity: max(0, calc(0.72 - var(--observatory-progress) * 1.05));
    }
  }
</style>

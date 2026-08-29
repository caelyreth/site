<script lang="ts">
  import { reduced_motion } from '$lib/browser/reduced-motion'
  import { onMount } from 'svelte'
  import { useTheme } from 'svelte-themes'

  import { SKY_FIELD_START_DELAY } from './config'
  import type { Engine } from './engine'
  import { load_engine } from './engine-loader'

  interface Props {
    deferred?: boolean
    paused?: boolean
  }

  let { deferred = false, paused = false }: Props = $props()
  const theme = useTheme()
  let canvas = $state<HTMLCanvasElement | undefined>()
  let engine = $state<Engine>()
  let canvas_visible = $state(false)
  let page_visible = $state(true)
  let field_ready = $state(false)
  let mounted = $state(false)
  let scene_failed = $state(false)
  let scene_loading = $state(false)
  let scene_timer: ReturnType<typeof setTimeout> | undefined
  let reveal_timer: ReturnType<typeof setTimeout> | undefined
  const scene_active = $derived(
    canvas !== undefined &&
      canvas_visible &&
      page_visible &&
      !deferred &&
      !paused,
  )
  const scene_start_ready = $derived(
    mounted &&
      scene_active &&
      engine === undefined &&
      !scene_failed &&
      !scene_loading &&
      scene_timer === undefined,
  )

  function sync_engine_activity() {
    engine?.set_active(
      canvas_visible && page_visible && !deferred && !paused,
    )
  }

  function cancel_scene_start() {
    if (scene_timer === undefined) return
    clearTimeout(scene_timer)
    scene_timer = undefined
  }

  function start_scene() {
    scene_timer = undefined
    if (scene_loading || engine || !scene_active) return

    scene_loading = true
    void load_engine()
      .then((create_engine) => {
        if (!mounted || engine || !canvas || !scene_active) return
        engine = create_engine(canvas, theme.resolvedTheme === 'dark')
        sync_engine_activity()
        reveal_timer = setTimeout(() => {
          if (mounted) field_ready = true
        }, 32)
      })
      .catch((error: unknown) => {
        if (!mounted) return
        scene_failed = true
        console.error('无法初始化星空场。', error)
      })
      .finally(() => {
        scene_loading = false
        schedule_scene_start()
      })
  }

  function schedule_scene_start() {
    if (!scene_start_ready) return

    scene_timer = setTimeout(
      start_scene,
      reduced_motion.current ? 0 : SKY_FIELD_START_DELAY,
    )
  }

  onMount(() => {
    if (!canvas) return

    mounted = true
    const observer = new IntersectionObserver(([entry]) => {
      canvas_visible = entry?.isIntersecting ?? false
      sync_engine_activity()
      if (!canvas_visible) cancel_scene_start()
      schedule_scene_start()
    })
    const handle_visibility = () => {
      page_visible = document.visibilityState === 'visible'
      sync_engine_activity()
      if (!page_visible) cancel_scene_start()
      schedule_scene_start()
    }

    observer.observe(canvas)
    document.addEventListener('visibilitychange', handle_visibility)
    page_visible = document.visibilityState === 'visible'
    schedule_scene_start()

    return () => {
      mounted = false
      cancel_scene_start()
      if (reveal_timer !== undefined) clearTimeout(reveal_timer)
      observer.disconnect()
      document.removeEventListener('visibilitychange', handle_visibility)
      engine?.destroy()
      engine = undefined
      field_ready = false
    }
  })

  $effect(() => {
    engine?.set_theme(theme.resolvedTheme === 'dark')
  })

  $effect(() => {
    sync_engine_activity()
    if (!scene_active) cancel_scene_start()
    schedule_scene_start()
  })
</script>

<canvas
  aria-hidden="true"
  bind:this={canvas}
  class:is-deferred={deferred}
  class:is-ready={field_ready}
  class="canvas"
  data-sky-field-canvas
></canvas>

<style>
  .canvas {
    --scene-reveal-duration: 1100ms;
    --sky-field-mask: linear-gradient(
      to right,
      transparent var(--sky-field-fade-start),
      #000 var(--sky-field-fade-end)
    );
    position: absolute;
    top: 0;
    left: var(--sky-field-start);
    z-index: 1;
    display: block;
    width: calc(100% - var(--sky-field-start));
    height: 100%;
    pointer-events: none;
    opacity: 0;
    will-change: opacity;
    -webkit-mask-image: var(--sky-field-mask);
    -webkit-mask-repeat: no-repeat;
    mask-image: var(--sky-field-mask);
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

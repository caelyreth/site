<script lang="ts">
  import type {
    RegionOptions,
    StageIntro,
    StageMotion,
    StageProps,
  } from '$lib/presentation/contract'
  import { scroll_progress } from '$lib/site/scroll-progress'
  import type { Component } from 'svelte'
  import type { Attachment } from 'svelte/attachments'

  import Guide from './guide.svelte'

  interface Props {
    component: Component<StageProps>
    intro: StageIntro
    on_progress?: (progress: number) => void
    options: RegionOptions
    progress?: number
  }

  /* oxlint-disable prefer-const -- Stage selection can update with the route. */
  let {
    component,
    intro,
    on_progress,
    options,
    progress = 0,
  }: Props = $props()
  const StageContent = $derived(component)
  const stage_motion = $state<StageMotion>({ defer_surface: false })

  const stage_open_scroll_tolerance = 2
  const surface_settle_delay = 360
  const sky_field_fade_rate = 1.2
  const surface_hidden_progress = 1 / sky_field_fade_rate
  const surface_visible_progress = 0.8

  function stage_element(capture: HTMLElement) {
    const element = capture.firstElementChild
    return element instanceof HTMLElement ? element : undefined
  }

  function compact_transition_span(stage: HTMLElement) {
    const root_font_size = Number.parseFloat(
      getComputedStyle(document.documentElement).fontSize,
    )
    const minimum = 8 * root_font_size
    const maximum = 12 * root_font_size
    return Math.min(maximum, Math.max(minimum, stage.offsetHeight * 0.24))
  }

  function stage_scroll_span(capture: HTMLElement) {
    const stage = stage_element(capture)
    if (!stage) return 0
    return window.matchMedia('(max-width: 40rem)').matches
      ? compact_transition_span(stage)
      : Math.max(capture.offsetHeight - stage.offsetHeight, 1)
  }

  function stage_progress(capture: HTMLElement) {
    const travel = stage_scroll_span(capture)
    if (!travel) return 0
    return Math.min(
      1,
      Math.max(0, -capture.getBoundingClientRect().top / travel),
    )
  }

  function set_surface_deferred(defer_surface: boolean) {
    if (stage_motion.defer_surface === defer_surface) return
    stage_motion.defer_surface = defer_surface
  }

  function create_stage_return_observer(): Attachment<HTMLElement> {
    return (capture) => {
      let settle_timer: ReturnType<typeof setTimeout> | undefined
      let stage_start = 0
      let previous_scroll_top = window.scrollY
      let surface_exit = 0

      const refresh_stage_bounds = () => {
        stage_start = window.scrollY + capture.getBoundingClientRect().top
        surface_exit =
          stage_start + stage_scroll_span(capture) * surface_hidden_progress
        previous_scroll_top = window.scrollY
      }
      const settle = () => {
        settle_timer = undefined
        if (stage_progress(capture) < surface_visible_progress) {
          set_surface_deferred(false)
        }
      }
      const schedule_settle = () => {
        if (settle_timer !== undefined) clearTimeout(settle_timer)
        settle_timer = setTimeout(settle, surface_settle_delay)
      }
      const cancel_settle = () => {
        if (settle_timer === undefined) return
        clearTimeout(settle_timer)
        settle_timer = undefined
      }
      const update = () => {
        const scroll_top = window.scrollY
        const returning = scroll_top < previous_scroll_top
        if (scroll_top <= stage_start + stage_open_scroll_tolerance) {
          set_surface_deferred(false)
        } else if (returning && previous_scroll_top >= surface_exit) {
          set_surface_deferred(true)
        }
        previous_scroll_top = scroll_top
        if (stage_motion.defer_surface) {
          schedule_settle()
        } else {
          cancel_settle()
        }
      }

      refresh_stage_bounds()
      window.addEventListener('scroll', update, { passive: true })
      window.addEventListener('resize', refresh_stage_bounds)

      return () => {
        cancel_settle()
        window.removeEventListener('scroll', update)
        window.removeEventListener('resize', refresh_stage_bounds)
      }
    }
  }

  const observe_stage_return = create_stage_return_observer()

  const observe_stage_progress = scroll_progress({
    fallback_only: true,
    get_progress: stage_progress,
    observed_elements(capture) {
      const stage = stage_element(capture)
      return stage ? [stage] : []
    },
    on_progress(progress) {
      on_progress?.(progress)
    },
  })
</script>

<div
  class="stage-capture"
  style:--stage-fallback-progress={progress}
  {@attach observe_stage_progress}
  {@attach observe_stage_return}
>
  <section class="stage-sticky" aria-label={intro.title}>
    <div class="stage-frame">
      <StageContent {intro} motion={stage_motion} {options} />
      <Guide side="left" inStage reveal />
      <Guide side="right" inStage reveal />
    </div>
  </section>
</div>

<style>
  .stage-capture {
    --stage-viewport: var(--stable-viewport-block);
    --stage-scroll-span: var(--stage-transition-span);
    --stage-frame-inset: clamp(0.5rem, 1.6vw, 1.25rem);
    --stage-frame-radius: clamp(0.375rem, 0.75vw, 0.625rem);
    --stage-progress: var(--stage-fallback-progress, 0);
    --stage-opening: calc(1 - var(--stage-progress));
    --stage-rail-seam: 1px;
    --stage-clip-inset: calc(
      max(0px, 50vw - var(--half-measure)) * var(--stage-progress)
    );
    --stage-block-inset: calc(
      var(--stage-frame-inset) * var(--stage-opening)
    );
    --stage-inline-inset: calc(
      var(--stage-clip-inset) + var(--stage-block-inset)
    );
    --stage-top: calc(var(--header-block-size) - var(--stage-rail-seam));
    --stage-radius: calc(var(--stage-frame-radius) * var(--stage-opening));
    --stage-content-rule: var(--color-boundary);
    --stage-intro-inline-inset: max(
      var(--inline-gutter),
      env(safe-area-inset-left),
      env(safe-area-inset-right)
    );
    --stage-intro-bottom-inset: max(1.25rem, env(safe-area-inset-bottom));
    height: calc(var(--stage-viewport) + var(--stage-scroll-span));
  }

  @supports (animation-timeline: scroll(root block)) {
    .stage-capture {
      animation: stage-progress 1ms linear both;
      animation-range: 0 var(--stage-scroll-span);
      animation-timeline: scroll(root block);
    }
  }

  @supports (height: 100dvh) and (height: 100lvh) {
    .stage-capture {
      --stage-intro-bottom-inset: calc(
        max(1.25rem, env(safe-area-inset-bottom)) +
          max(0px, 100lvh - 100dvh)
      );
    }
  }

  .stage-sticky {
    position: sticky;
    top: 0;
    z-index: 21;
    width: 100vw;
    height: var(--stage-viewport);
    margin-inline: calc(50% - 50vw);
    overflow: hidden;
    clip-path: inset(0 var(--stage-clip-inset) 0);
    will-change: clip-path;
  }

  .stage-frame {
    position: absolute;
    inset: var(--stage-top) var(--stage-inline-inset)
      var(--stage-block-inset);
    z-index: 1;
    overflow: hidden;
    border: 1px solid var(--stage-content-rule);
    border-radius: var(--stage-radius);
    background-color: color-mix(
      in oklab,
      var(--color-stage-surface) 88%,
      var(--color-stage-wash)
    );
    contain: layout paint;
  }

  .stage-frame::before {
    position: absolute;
    inset: 0;
    pointer-events: none;
    content: '';
    opacity: var(--noise-stage-opacity);
    background-image: var(--noise-tile);
    background-size: var(--noise-size);
  }

  @media (max-width: 40rem) {
    .stage-capture {
      --stage-frame-inset: 0px;
      --stage-frame-radius: 0px;
      --stage-top: 0px;
      height: var(--stage-viewport);
    }

    .stage-sticky {
      position: relative;
    }

    .stage-frame {
      border: 0;
    }
  }
</style>

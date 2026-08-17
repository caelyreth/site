<script lang="ts">
  import { onMount } from 'svelte'

  export type ScrollbarAxis = 'block' | 'inline'

  interface Props {
    axis?: ScrollbarAxis
    target: HTMLElement
    viewport?: boolean
  }

  interface ScrollbarGeometry {
    max_scroll: number
    offset: number
    thumb_size: number
    track_cross_start: number
    track_length: number
    track_start: number
  }

  const hidden_delay = 720
  const edge_padding = 6
  const minimum_thumb_size = 28
  const scrollbar_thickness = 6

  /* oxlint-disable prefer-const -- Svelte props and element bindings can update. */
  let { axis = 'block', target, viewport = false }: Props = $props()
  let dragging = $state(false)
  let geometry = $state<ScrollbarGeometry>({
    max_scroll: 0,
    offset: 0,
    thumb_size: 0,
    track_cross_start: 0,
    track_length: 0,
    track_start: 0,
  })
  let is_scrollable = $state(false)
  let is_visible = $state(false)
  let release_drag: (() => void) | undefined
  let schedule_hide_after_drag: (() => void) | undefined
  let thumb: HTMLButtonElement | undefined = $state()

  const is_block = $derived(axis === 'block')

  function read_scroll_dimensions(element: HTMLElement) {
    if (is_block) {
      return {
        client_size: viewport ? window.innerHeight : element.clientHeight,
        scroll_offset: element.scrollTop,
        scroll_size: element.scrollHeight,
      }
    }

    return {
      client_size: element.clientWidth,
      scroll_offset: element.scrollLeft,
      scroll_size: element.scrollWidth,
    }
  }

  function read_track_position(element: HTMLElement) {
    if (is_block) {
      return {
        track_cross_start: 0,
        track_start: viewport
          ? edge_padding
          : element.getBoundingClientRect().top + edge_padding,
      }
    }

    const bounds = element.getBoundingClientRect()
    return {
      track_cross_start: bounds.bottom - scrollbar_thickness - edge_padding,
      track_start: bounds.left + edge_padding,
    }
  }

  function read_geometry(element: HTMLElement): ScrollbarGeometry {
    const { client_size, scroll_offset, scroll_size } =
      read_scroll_dimensions(element)
    const track_length = Math.max(0, client_size - edge_padding * 2)
    const max_scroll = Math.max(0, scroll_size - client_size)
    const thumb_size = Math.min(
      track_length,
      Math.max(
        minimum_thumb_size,
        (track_length * client_size) / scroll_size,
      ),
    )
    const available_track = Math.max(0, track_length - thumb_size)
    const offset =
      max_scroll === 0 ? 0 : (scroll_offset / max_scroll) * available_track

    return {
      max_scroll,
      offset,
      thumb_size,
      ...read_track_position(element),
      track_length,
    }
  }

  function scroll_by_thumb_offset(offset: number) {
    if (geometry.max_scroll === 0) return

    const available_track = geometry.track_length - geometry.thumb_size
    if (available_track <= 0) return

    const progress = Math.min(1, Math.max(0, offset / available_track))
    if (is_block) target.scrollTop = progress * geometry.max_scroll
    else target.scrollLeft = progress * geometry.max_scroll
  }

  function pointer_position(event: PointerEvent) {
    return is_block ? event.clientY : event.clientX
  }

  function attach_drag_handlers(
    pointer_id: number,
    pointer_origin: number,
    thumb_origin: number,
  ) {
    const move = (move_event: PointerEvent) => {
      scroll_by_thumb_offset(
        thumb_origin + pointer_position(move_event) - pointer_origin,
      )
    }
    const end = (end_event: PointerEvent) => {
      if (end_event.pointerId !== pointer_id) return
      release_drag?.()
      dragging = false
      schedule_hide_after_drag?.()
    }

    const release = () => {
      window.removeEventListener('pointermove', move)
      window.removeEventListener('pointerup', end)
      window.removeEventListener('pointercancel', end)
      if (release_drag === release) release_drag = undefined
    }

    window.addEventListener('pointermove', move)
    window.addEventListener('pointerup', end)
    window.addEventListener('pointercancel', end)

    return release
  }

  function begin_drag(event: PointerEvent) {
    if (geometry.max_scroll === 0 || !thumb) return

    event.preventDefault()
    dragging = true
    is_visible = true
    thumb.setPointerCapture(event.pointerId)
    release_drag?.()
    release_drag = attach_drag_handlers(
      event.pointerId,
      pointer_position(event),
      geometry.offset,
    )
  }

  onMount(() => {
    let animation_frame: number | undefined
    let hide_timer: number | undefined
    const visual_viewport = window.visualViewport

    const update = () => {
      animation_frame = undefined
      geometry = read_geometry(target)
      is_scrollable = geometry.max_scroll > 1
      if (!is_scrollable) is_visible = false
    }
    const schedule_update = () => {
      if (animation_frame !== undefined) return
      animation_frame = requestAnimationFrame(update)
    }
    const hide = () => {
      hide_timer = undefined
      if (!dragging) is_visible = false
    }
    const reveal = () => {
      is_visible = true
      clearTimeout(hide_timer)
      hide_timer = window.setTimeout(hide, hidden_delay)
    }
    const schedule_hide = () => {
      clearTimeout(hide_timer)
      hide_timer = window.setTimeout(hide, hidden_delay)
    }
    const on_scroll = () => {
      schedule_update()
      reveal()
    }
    const on_window_scroll = () => {
      if (viewport) on_scroll()
      else if (is_visible) schedule_update()
    }
    const resize_observer = new ResizeObserver(schedule_update)

    schedule_hide_after_drag = schedule_hide
    resize_observer.observe(target)
    if (viewport && document.body) resize_observer.observe(document.body)
    if (!viewport) {
      target.addEventListener('scroll', on_scroll, { passive: true })
    }
    window.addEventListener('scroll', on_window_scroll, { passive: true })
    window.addEventListener('resize', schedule_update)
    visual_viewport?.addEventListener('resize', schedule_update)
    update()

    return () => {
      if (animation_frame !== undefined) {
        cancelAnimationFrame(animation_frame)
      }
      clearTimeout(hide_timer)
      release_drag?.()
      schedule_hide_after_drag = undefined
      resize_observer.disconnect()
      if (!viewport) target.removeEventListener('scroll', on_scroll)
      window.removeEventListener('scroll', on_window_scroll)
      window.removeEventListener('resize', schedule_update)
      visual_viewport?.removeEventListener('resize', schedule_update)
    }
  })
</script>

{#if is_scrollable}
  <div
    aria-hidden="true"
    class:dragging
    class:is-visible={is_visible}
    class:scrollbar-block={is_block}
    class:scrollbar-inline={!is_block}
    class="scrollbar-indicator"
    style:--scrollbar-offset={`${geometry.offset}px`}
    style:--scrollbar-thumb-size={`${geometry.thumb_size}px`}
    style:--scrollbar-track-cross-start={`${geometry.track_cross_start}px`}
    style:--scrollbar-track-length={`${geometry.track_length}px`}
    style:--scrollbar-track-start={`${geometry.track_start}px`}
  >
    <button
      aria-hidden="true"
      bind:this={thumb}
      class="scrollbar-thumb"
      tabindex="-1"
      type="button"
      onpointerdown={begin_drag}
    ></button>
  </div>
{/if}

<style>
  .scrollbar-indicator {
    position: fixed;
    z-index: 60;
    pointer-events: none;
    visibility: hidden;
    opacity: 0;
    transition:
      opacity var(--dur-short) var(--ease-out),
      visibility 0s linear var(--dur-short);
  }

  .scrollbar-indicator.is-visible {
    pointer-events: auto;
    visibility: visible;
    opacity: 1;
    transition-delay: 0s;
  }

  .scrollbar-block {
    top: var(--scrollbar-track-start);
    right: max(0.35rem, env(safe-area-inset-right));
    width: 0.375rem;
    height: var(--scrollbar-track-length);
  }

  .scrollbar-inline {
    top: var(--scrollbar-track-cross-start);
    left: var(--scrollbar-track-start);
    width: var(--scrollbar-track-length);
    height: 0.375rem;
  }

  .scrollbar-thumb {
    position: absolute;
    padding: 0;
    border: 0;
    border-radius: 999px;
    background: color-mix(in oklab, var(--color-muted) 72%, transparent);
    box-shadow: 0 0 0 1px
      color-mix(in oklab, var(--color-field) 38%, transparent);
    cursor: grab;
    touch-action: none;
  }

  .dragging .scrollbar-thumb {
    cursor: grabbing;
  }

  .scrollbar-block .scrollbar-thumb {
    inset-inline: 0;
    height: var(--scrollbar-thumb-size);
    transform: translateY(var(--scrollbar-offset));
  }

  .scrollbar-inline .scrollbar-thumb {
    inset-block: 0;
    width: var(--scrollbar-thumb-size);
    transform: translateX(var(--scrollbar-offset));
  }

  @media (prefers-reduced-motion: reduce) {
    .scrollbar-indicator {
      transition: none;
    }
  }

  @media (forced-colors: active), print {
    .scrollbar-indicator {
      display: none;
    }
  }
</style>

<script lang="ts">
  import { reduced_motion } from '$lib/browser/reduced-motion'
  import type { Snippet } from 'svelte'

  interface Props extends Record<string, unknown> {
    children?: Snippet
    class?: string
    open?: boolean
    summary?: string
  }

  let {
    children,
    class: class_name,
    open = false,
    summary = '详情',
    ...attributes
  }: Props = $props()
  let is_closing = $state(false)
  let pointer_origin: { x: number; y: number } | undefined

  function track_pointer(event: PointerEvent) {
    if (event.button !== 0) return
    pointer_origin = { x: event.clientX, y: event.clientY }
  }

  function is_selection_gesture(event: MouseEvent) {
    const origin = pointer_origin
    pointer_origin = undefined
    if (!origin) return

    return (
      Math.hypot(event.clientX - origin.x, event.clientY - origin.y) > 4
    )
  }

  function clear_accidental_selection() {
    requestAnimationFrame(() => window.getSelection()?.removeAllRanges())
  }

  function toggle_details(event: MouseEvent) {
    const selection_gesture = is_selection_gesture(event)
    if (selection_gesture) return

    if (selection_gesture === false) clear_accidental_selection()

    update_details()
  }

  function update_details() {
    if (is_closing) {
      is_closing = false
      open = true
      return
    }

    if (!open) {
      open = true
      return
    }

    if (reduced_motion.current) {
      open = false
      return
    }

    is_closing = true
  }

  function finish_close(event: TransitionEvent) {
    if (
      !is_closing ||
      event.target !== event.currentTarget ||
      event.propertyName !== 'grid-template-rows'
    ) {
      return
    }

    open = false
    is_closing = false
  }
</script>

<div
  {...attributes}
  class={`details${class_name ? ` ${class_name}` : ''}`}
  data-closing={is_closing || undefined}
  data-open={open || undefined}
>
  <button
    type="button"
    class="details-toggle"
    aria-expanded={open && !is_closing}
    onpointerdown={track_pointer}
    onclick={toggle_details}
  >
    {summary}
  </button>
  <div
    aria-hidden={!open || is_closing}
    class="details-content"
    inert={!open || is_closing}
    ontransitionend={finish_close}
  >
    <div class="details-content-inner">
      <div class="details-copy">{@render children?.()}</div>
    </div>
  </div>
</div>

<style>
  .details {
    margin-top: var(--prose-block-gap);
    border: 1px solid var(--color-rule);
    color: var(--color-text-secondary);
    background: var(--color-prose-surface);
  }

  .details-toggle {
    display: flex;
    inline-size: 100%;
    min-inline-size: 0;
    padding: 0.75rem 1rem;
    border: 0;
    align-items: center;
    background: transparent;
    justify-content: space-between;
    gap: 1rem;
    color: var(--color-text);
    cursor: pointer;
    font-family: var(--font-stack-sans);
    font-size: 0.8125rem;
    font-weight: 600;
    line-height: 1.35;
    text-align: start;
  }

  .details-toggle::after {
    flex: none;
    content: '+';
    transition: transform var(--dur-micro) var(--ease-out);
  }

  .details[data-open] .details-toggle {
    border-bottom: 1px solid var(--color-rule);
  }

  .details[data-open] .details-toggle::after {
    transform: rotate(45deg);
  }

  .details-toggle:focus-visible {
    outline: 2px solid var(--color-focus);
    outline-offset: -2px;
  }

  .details-content {
    display: grid;
    grid-template-rows: 0fr;
    min-inline-size: 0;
    opacity: 0;
    transition:
      grid-template-rows var(--dur-short) var(--ease-out),
      opacity var(--dur-short) var(--ease-out);
  }

  .details[data-open]:not([data-closing]) .details-content {
    grid-template-rows: 1fr;
    opacity: 1;
  }

  .details-content-inner {
    min-block-size: 0;
    overflow: clip;
  }

  .details-copy {
    padding: 0.875rem 1rem 1rem;
  }

  .details-copy :global(p + p) {
    margin-top: var(--prose-nested-gap);
  }

  @media (prefers-reduced-motion: reduce) {
    .details-toggle::after,
    .details-content {
      transition-duration: 0ms;
    }
  }
</style>

<script lang="ts">
  import type { Snippet } from 'svelte'

  interface Props extends Record<string, unknown> {
    children?: Snippet
    open?: boolean
    summary?: string
  }

  /* oxlint-disable prefer-const -- Renderer props can update with the document. */
  let {
    children,
    open = false,
    summary = 'Details',
    ...attributes
  }: Props = $props()
  let is_closing = $state(false)

  function is_reduced_motion() {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches
  }

  function toggle_details(event: MouseEvent) {
    event.preventDefault()

    if (is_closing) {
      is_closing = false
      open = true
      return
    }

    if (!open) {
      open = true
      return
    }

    if (is_reduced_motion()) {
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

<details {...attributes} data-closing={is_closing || undefined} {open}>
  <summary onclick={toggle_details}>{summary}</summary>
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
</details>

<style>
  details {
    margin-top: var(--prose-block-gap);
    border: 1px solid var(--color-rule);
    color: var(--color-text-secondary);
    background: var(--color-prose-surface);
  }

  summary {
    display: flex;
    min-inline-size: 0;
    padding: 0.75rem 1rem;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
    color: var(--color-text);
    cursor: pointer;
    font-family: var(--font-stack-sans);
    font-size: 0.8125rem;
    font-weight: 600;
    line-height: 1.35;
    list-style: none;
  }

  summary::-webkit-details-marker {
    display: none;
  }

  summary::after {
    flex: none;
    content: '+';
    transition: transform var(--dur-micro) var(--ease-out);
  }

  details[open] summary {
    border-bottom: 1px solid var(--color-rule);
  }

  details[open] summary::after {
    transform: rotate(45deg);
  }

  summary:focus-visible {
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

  details[open]:not([data-closing]) .details-content {
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
    summary::after,
    .details-content {
      transition-duration: 0ms;
    }
  }
</style>

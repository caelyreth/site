<script lang="ts">
  import { copy_text } from '$lib/browser/clipboard'
  import { onDestroy } from 'svelte'

  interface Props {
    label: string
    value: () => string
  }

  type CopyState = 'copied' | 'failed' | 'idle'

  /* oxlint-disable prefer-const -- Renderer props can update with the document. */
  let { label, value }: Props = $props()
  let state = $state<CopyState>('idle')
  let reset_timer: ReturnType<typeof setTimeout> | undefined

  onDestroy(() => clearTimeout(reset_timer))

  const button_label = $derived(
    state === 'copied'
      ? 'Copied'
      : state === 'failed'
        ? 'Try again'
        : label,
  )

  async function copy() {
    clearTimeout(reset_timer)

    try {
      await copy_text(value())
      state = 'copied'
    } catch {
      state = 'failed'
    }

    reset_timer = setTimeout(() => {
      state = 'idle'
    }, 1800)
  }
</script>

<button
  aria-live="polite"
  class="copy-button"
  data-state={state}
  onclick={copy}
  type="button">{button_label}</button
>

<style>
  .copy-button {
    flex: none;
    min-block-size: 1.75rem;
    padding: 0.2rem 0.375rem;
    border: 0;
    color: var(--color-muted);
    font-family: var(--font-stack-sans);
    font-size: 0.6875rem;
    font-weight: 600;
    line-height: 1;
    text-decoration: underline;
    text-decoration-color: transparent;
    text-underline-offset: 0.2em;
    background: transparent;
    cursor: pointer;
    transition:
      color var(--dur-short) var(--ease-in-out),
      text-decoration-color var(--dur-short) var(--ease-in-out);
  }

  .copy-button:hover,
  .copy-button[data-state='copied'] {
    color: var(--color-text-link);
    text-decoration-color: currentColor;
  }

  .copy-button[data-state='failed'] {
    color: var(--color-alert-warning);
  }

  .copy-button:focus-visible {
    border-radius: 0.15rem;
    outline: 2px solid var(--color-focus);
    outline-offset: 0.1rem;
  }
</style>

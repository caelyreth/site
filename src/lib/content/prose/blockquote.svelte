<script lang="ts">
  import type { Snippet } from 'svelte'

  const alert_labels: Record<string, string> = {
    caution: 'Caution',
    important: 'Important',
    note: 'Note',
    tip: 'Tip',
    warning: 'Warning',
  }

  interface Props extends Record<string, unknown> {
    as?: string
    children?: Snippet
  }

  /* oxlint-disable prefer-const -- Renderer props can update with the document. */
  let { as: alert_type, children, ...attributes }: Props = $props()
  const alert_label = $derived(
    alert_type ? (alert_labels[alert_type] ?? alert_type) : '',
  )
</script>

{#if alert_type}
  <aside
    {...attributes}
    aria-label={alert_label}
    data-alert-tone={alert_type}
  >
    <p class="label">{alert_label}</p>
    <div class="copy">{@render children?.()}</div>
  </aside>
{:else}
  <blockquote {...attributes}>{@render children?.()}</blockquote>
{/if}

<style>
  aside,
  blockquote {
    margin: 1.5rem 0 0;
    padding: 0.75rem 1rem;
    border: 1px solid var(--color-rule);
    border-inline-start: 2px solid var(--color-text-secondary);
    color: var(--color-text-secondary);
    font-size: var(--prose-size);
    line-height: var(--prose-leading);
    overflow-wrap: anywhere;
    background: var(--color-prose-surface);
  }

  aside {
    --alert-tone: var(--color-text);

    padding: 0.875rem 1rem 1rem;
    border-inline-start-color: var(--alert-tone);
  }

  aside[data-alert-tone='note'] {
    --alert-tone: var(--color-alert-note);
  }

  aside[data-alert-tone='tip'] {
    --alert-tone: var(--color-alert-tip);
  }

  aside[data-alert-tone='important'] {
    --alert-tone: var(--color-alert-important);
  }

  aside[data-alert-tone='warning'] {
    --alert-tone: var(--color-alert-warning);
  }

  aside[data-alert-tone='caution'] {
    --alert-tone: var(--color-alert-caution);
  }

  .label {
    margin: 0;
    color: var(--alert-tone);
    font-family: var(--font-stack-sans);
    font-size: 0.8125rem;
    font-weight: 700;
    line-height: 1.2;
  }

  .copy {
    margin-top: 0.45rem;
  }
</style>

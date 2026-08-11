<script lang="ts">
  import type { Snippet } from 'svelte'

  type AlertTone = 'note' | 'tip' | 'important' | 'warning' | 'caution'

  type Props = {
    children?: Snippet
    label: string
    tone: AlertTone
  } & Record<string, unknown>

  /* oxlint-disable prefer-const -- Renderer props can update with the document. */
  let { children, label, tone, ...attributes }: Props = $props()
</script>

<aside {...attributes} aria-label={label} data-alert-tone={tone}>
  <p class="label">{label}</p>
  <div class="copy">{@render children?.()}</div>
</aside>

<style>
  aside {
    --alert-tone: var(--color-text);

    margin: 1.5rem 0 0;
    padding: 0.875rem 1rem 1rem;
    border: 1px solid var(--color-rule);
    border-inline-start: 2px solid var(--alert-tone);
    color: var(--color-text-secondary);
    font-size: var(--prose-size);
    line-height: var(--prose-leading);
    overflow-wrap: anywhere;
    background-color: var(--color-prose-surface);
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

<script lang="ts">
  import type { Snippet } from 'svelte'

  import CopyButton from './copy-button.svelte'

  interface Props extends Record<string, unknown> {
    caption?: string
    children?: Snippet
    filename?: string
    language?: string
  }

  /* oxlint-disable prefer-const -- Renderer props can update with the document. */
  let { caption, children, filename, language, ...attributes }: Props =
    $props()
  let pre: HTMLPreElement | undefined = $state()
  const code_caption = $derived(caption || filename)

  function code_text() {
    return pre?.querySelector('code')?.textContent ?? ''
  }
</script>

<figure class="code-block">
  <pre
    {...attributes}
    bind:this={pre}
    data-language={language || undefined}>{@render children?.()}</pre>
  <figcaption class="code-tools">
    {#if code_caption}<span class="code-caption">{code_caption}</span>{/if}
    <CopyButton label="Copy code" value={code_text} />
  </figcaption>
</figure>

<style>
  .code-block {
    max-width: 100%;
    margin: var(--prose-block-gap) 0 0;
  }

  pre {
    margin: 0;
    padding: 0.875rem 1rem;
    overscroll-behavior-inline: contain;
    overflow-x: auto;
    border: 1px solid var(--color-rule);
    background: var(--color-prose-surface);
  }

  .code-tools {
    display: flex;
    gap: 0.75rem;
    align-items: center;
    min-block-size: 2.25rem;
    margin: 0;
    padding: 0.25rem 0.625rem 0.25rem 1rem;
    border: 1px solid var(--color-rule);
    border-top: 0;
    background: var(--color-prose-surface);
  }

  .code-caption {
    min-inline-size: 0;
    color: var(--color-muted);
    font-family: var(--font-stack-mono);
    font-size: 0.6875rem;
    line-height: 1.45;
    overflow-wrap: anywhere;
  }

  .code-tools :global(.copy-button) {
    margin-inline-start: auto;
  }

  pre :global(code) {
    padding: 0;
    border: 0;
    color: inherit;
    font-family: var(--font-stack-mono);
    font-size: 0.75rem;
    font-synthesis: none;
    font-variant-ligatures: none;
    line-height: 1.55;
    tab-size: 2;
    background: transparent;
  }
</style>

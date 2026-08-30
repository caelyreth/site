<script lang="ts">
  import ScrollbarIndicator from '$lib/components/layout/scrollbar-indicator.svelte'
  import type { Snippet } from 'svelte'

  import CopyButton from './copy-button.svelte'

  interface Props extends Record<string, unknown> {
    caption?: string
    children?: Snippet
    filename?: string
    language?: string
  }

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
  {#if pre}
    <ScrollbarIndicator axis="inline" target={pre} />
  {/if}
  <figcaption class="code-tools">
    {#if code_caption}<span class="code-caption">{code_caption}</span>{/if}
    <CopyButton label="复制代码" value={code_text} />
  </figcaption>
</figure>

<style>
  .code-block {
    inline-size: 100%;
    max-width: 100%;
    margin: var(--prose-block-gap) 0 0;
    min-inline-size: 0;
  }

  pre {
    box-sizing: border-box;
    max-inline-size: 100%;
    margin: 0;
    padding: 0.875rem 1rem;
    overscroll-behavior-inline: contain;
    overflow-x: auto;
    scrollbar-width: none;
    border: 1px solid var(--color-rule);
    background: var(--color-prose-surface);
  }

  pre::-webkit-scrollbar {
    display: none;
  }

  .code-tools {
    display: flex;
    box-sizing: border-box;
    inline-size: 100%;
    min-inline-size: 0;
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
    font-family: var(--font-stack-sans);
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
    font-family: var(--font-stack-sans);
    font-size: 0.75rem;
    font-synthesis: none;
    font-variant-ligatures: none;
    line-height: 1.55;
    tab-size: 2;
    background: transparent;
  }

  :global(.dark) .code-block pre.shiki {
    color: var(--shiki-dark) !important;
    background-color: var(--shiki-dark-bg) !important;
  }

  :global(.dark) .code-block pre.shiki :global(span) {
    color: var(--shiki-dark) !important;
  }

  @media (forced-colors: active) {
    pre {
      scrollbar-width: auto;
    }

    pre::-webkit-scrollbar {
      display: block;
    }
  }
</style>

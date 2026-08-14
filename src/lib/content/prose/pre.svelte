<script lang="ts">
  import type { Snippet } from 'svelte'

  interface Props extends Record<string, unknown> {
    children?: Snippet
    language?: string
  }

  /* oxlint-disable prefer-const -- Renderer props can update with the document. */
  let { children, language, ...attributes }: Props = $props()
</script>

<pre {...attributes} data-language={language || undefined}>
  {@render children?.()}
</pre>

<style>
  pre {
    max-width: 100%;
    margin: var(--prose-block-gap) 0 0;
    padding: 0.875rem 1rem;
    overscroll-behavior-inline: contain;
    overflow-x: auto;
    border: 1px solid var(--color-rule);
    background: var(--color-prose-surface);
  }

  pre :global(code) {
    padding: 0;
    border: 0;
    color: var(--color-text);
    font-family: var(--font-stack-mono);
    font-size: 0.75rem;
    font-synthesis: none;
    font-variant-ligatures: none;
    line-height: 1.55;
    tab-size: 2;
    background: transparent;
  }
</style>

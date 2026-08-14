<script lang="ts">
  import type { Snippet } from 'svelte'

  interface Props extends Record<string, unknown> {
    alt?: string
    caption?: string
    children?: Snippet
    src?: string
    wide?: boolean
  }

  /* oxlint-disable prefer-const -- Renderer props can update with the document. */
  let {
    alt = '',
    caption,
    children,
    src,
    wide = false,
    ...attributes
  }: Props = $props()
</script>

<figure {...attributes} class:wide>
  {#if src}
    <img {src} {alt} decoding="async" loading="lazy" />
  {/if}
  {#if caption}<figcaption>{caption}</figcaption>{/if}
  {#if children}<div class="figure-content">{@render children()}</div>{/if}
</figure>

<style>
  figure {
    max-inline-size: min(100%, 22rem);
    margin: var(--prose-block-gap) 0 0;
    border: 1px solid var(--color-rule);
    background: var(--color-prose-surface);
  }

  figure.wide {
    max-inline-size: 100%;
  }

  img {
    display: block;
    inline-size: 100%;
    block-size: auto;
  }

  figcaption,
  .figure-content {
    padding: 0.625rem 0.75rem;
    color: var(--color-text-secondary);
    font-size: 0.8125rem;
    line-height: 1.5;
  }

  .figure-content {
    padding-top: 0;
  }
</style>

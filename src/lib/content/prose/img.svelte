<script lang="ts">
  interface Props extends Record<string, unknown> {
    alt?: string
    class?: string
    decoding?: 'async' | 'auto' | 'sync'
    loading?: 'eager' | 'lazy'
    src?: string
    title?: string
  }

  /* oxlint-disable prefer-const -- Renderer props can update with the document. */
  let {
    alt = '',
    class: class_name,
    decoding = 'async',
    loading = 'lazy',
    src,
    title,
    ...attributes
  }: Props = $props()
</script>

<figure class={class_name}>
  <img {...attributes} {alt} {decoding} {loading} {src} />
  {#if title}<figcaption>{title}</figcaption>{/if}
</figure>

<style>
  figure {
    max-inline-size: min(100%, 22rem);
    margin: var(--prose-block-gap) 0 0;
  }

  figure.wide {
    max-inline-size: 100%;
  }

  img {
    display: block;
    inline-size: 100%;
    block-size: auto;
    border: 1px solid var(--color-rule);
    background: var(--color-prose-surface);
  }

  figcaption {
    margin-top: 0.625rem;
    color: var(--color-muted);
    font-size: 0.75rem;
    line-height: 1.45;
  }
</style>

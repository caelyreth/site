<script lang="ts">
  interface Props extends Record<string, unknown> {
    decoding?: 'async' | 'auto' | 'sync'
    loading?: 'eager' | 'lazy'
  }

  /* oxlint-disable prefer-const -- Renderer props can update with the document. */
  let {
    decoding = 'async',
    loading = 'lazy',
    ...attributes
  }: Props = $props()
</script>

<img {...attributes} {decoding} {loading} />

<style>
  img {
    display: block;
    max-inline-size: min(100%, 18rem);
    block-size: auto;
    margin: 1.25rem 0 0;
    border: 1px solid var(--color-rule);
    background: var(--color-prose-surface);
  }

  img.wide {
    max-inline-size: 100%;
  }
</style>

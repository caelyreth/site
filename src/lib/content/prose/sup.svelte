<script lang="ts">
  import type { Snippet } from 'svelte'

  interface Props extends Record<string, unknown> {
    children?: Snippet
  }

  /* oxlint-disable prefer-const -- Renderer props can update with the document. */
  let { children, ...attributes }: Props = $props()
</script>

<sup {...attributes}>{@render children?.()}</sup>

<style>
  sup {
    /* Comark requires a boundary space before inline components; absorb it visually. */
    margin-inline-start: -0.3em;
    font-size: 0.75em;
    line-height: 0;
    vertical-align: 0.35em;
  }

  sup.footnote-ref {
    margin-inline: 0.1em;
    font-family: var(--font-stack-sans);
    font-size: 0.6875em;
    font-weight: 700;
    vertical-align: super;
  }

  sup.footnote-ref :global(a) {
    color: var(--color-text-link);
  }
</style>

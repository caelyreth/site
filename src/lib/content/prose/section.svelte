<script lang="ts">
  import type { Snippet } from 'svelte'

  interface Props extends Record<string, unknown> {
    children?: Snippet
  }

  /* oxlint-disable prefer-const -- Renderer props can update with the document. */
  let { children, ...attributes }: Props = $props()
</script>

<section {...attributes}>{@render children?.()}</section>

<style>
  section.footnotes {
    margin-top: 3rem;
    padding-top: 1rem;
    border-top: 1px solid var(--color-rule);
  }

  section.footnotes :global([data-heading-depth='2']) {
    margin-top: 0;
    font-family: var(--font-stack-sans);
    font-size: 0.875rem;
    line-height: 1.35;
  }

  section.footnotes :global(.footnotes-list) {
    margin-top: 0.75rem;
  }

  section.footnotes :global(.footnote-backref) {
    margin-inline-start: 0.35rem;
  }
</style>

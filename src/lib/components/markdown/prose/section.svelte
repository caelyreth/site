<script lang="ts">
  import type { Snippet } from 'svelte'

  interface Props extends Record<string, unknown> {
    children?: Snippet
  }

  let { children, ...attributes }: Props = $props()
</script>

<section {...attributes}>{@render children?.()}</section>

<style>
  section.footnotes {
    margin-top: 0;
  }

  section.footnotes > :global(.divider) {
    margin-bottom: 1rem;
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

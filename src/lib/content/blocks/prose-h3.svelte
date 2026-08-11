<script lang="ts">
  import type { Snippet } from 'svelte'

  /* oxlint-disable prefer-const -- Renderer props can update with the document. */
  let { children, id }: { children?: Snippet; id?: string } = $props()
</script>

<h3 {id}>{@render children?.()}</h3>

<style>
  h3 {
    margin: 2rem 0 0;
    color: var(--color-ink);
    font-size: 0.875rem;
    line-height: 1.35;
    scroll-margin-top: var(--header-safe-inset);
  }
</style>

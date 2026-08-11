<script lang="ts">
  import type { Snippet } from 'svelte'

  /* oxlint-disable prefer-const -- Snippet props can update with the document. */
  let { children }: { children?: Snippet } = $props()
</script>

<p>{@render children?.()}</p>

<style>
  p {
    max-width: 65ch;
    margin: 0.25rem 0 0;
    color: var(--color-muted);
    font-size: 0.875rem;
    line-height: 1.65;
  }
</style>

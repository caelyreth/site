<script lang="ts">
  import type { Snippet } from 'svelte'

  /* oxlint-disable prefer-const -- Snippet props can update with the document. */
  let { children }: { children?: Snippet } = $props()
</script>

<p class="lead">{@render children?.()}</p>

<style>
  .lead {
    max-width: 65ch;
    margin: 1.25rem 0 0;
    color: var(--color-ink-prime);
    font-size: 1rem;
    line-height: 1.65;
  }
</style>

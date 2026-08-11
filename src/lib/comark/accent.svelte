<script lang="ts">
  import type { Snippet } from 'svelte'

  /* oxlint-disable prefer-const -- Snippet props can update with the document. */
  let { children }: { children?: Snippet } = $props()
</script>

<span class="accent">{@render children?.()}</span>

<style>
  .accent {
    color: var(--color-accent);
    font-weight: 500;
  }
</style>

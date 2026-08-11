<script lang="ts">
  import type { Snippet } from 'svelte'

  /* oxlint-disable prefer-const -- Renderer props can update with the document. */
  let { children, id }: { children?: Snippet; id?: string } = $props()
</script>

<h2 {id} class="heading font-serif">{@render children?.()}</h2>

<style>
  .heading {
    margin: 2.5rem 0 0;
    color: var(--color-ink);
    font-size: 1.25rem;
    font-weight: 700;
    letter-spacing: 0;
    line-height: 1.08;
    scroll-margin-top: var(--header-safe-inset);
  }
</style>

<script lang="ts">
  import type { Snippet } from 'svelte'

  /* oxlint-disable prefer-const -- Renderer props can update with the document. */
  let { children, id }: { children?: Snippet; id?: string } = $props()
</script>

<h1 {id} class="heading font-serif">{@render children?.()}</h1>

<style>
  .heading {
    max-width: 18ch;
    margin: 0;
    color: var(--color-ink);
    font-size: clamp(2.25rem, 7vw, 3rem);
    font-weight: 700;
    letter-spacing: 0;
    line-height: 1.08;
    scroll-margin-top: var(--header-safe-inset);
  }
</style>

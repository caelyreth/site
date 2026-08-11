<script lang="ts">
  import type { Snippet } from 'svelte'

  /* oxlint-disable prefer-const -- Snippet props can update with the route. */
  let { children }: { children?: Snippet } = $props()
</script>

<div class="content-bleed">{@render children?.()}</div>

<style>
  .content-bleed {
    --content-bleed-width: min(
      var(--content-bleed-measure, 80rem),
      calc(100vw - var(--inline-gutter) * 2)
    );
    width: var(--content-bleed-width);
    margin-inline: calc((100% - var(--content-bleed-width)) / 2);
  }
</style>

<script lang="ts">
  import type { Snippet } from 'svelte'

  /* oxlint-disable prefer-const -- Snippet props can update with the route. */
  let { children }: { children?: Snippet } = $props()
</script>

<article id="content" class="article deck">
  {@render children?.()}
</article>

<style>
  .article {
    display: flex;
    flex: 1;
    width: 100%;
    max-width: var(--frame-measure);
    margin: 0 auto;
    padding-inline: var(--inline-gutter);
    flex-direction: column;
  }
</style>

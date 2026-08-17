<script lang="ts">
  import type { Snippet } from 'svelte'

  interface Props extends Record<string, unknown> {
    children?: Snippet
  }

  let { children, ...attributes }: Props = $props()
</script>

<dl {...attributes}>{@render children?.()}</dl>

<style>
  dl {
    margin: var(--prose-block-gap) 0 0;
    padding-inline-start: 1rem;
    border-inline-start: 2px solid var(--color-rule);
  }

  dl :global(dt + dd + dt) {
    margin-top: 0.875rem;
  }
</style>

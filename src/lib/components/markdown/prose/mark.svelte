<script lang="ts">
  import type { Snippet } from 'svelte'

  interface Props extends Record<string, unknown> {
    children?: Snippet
  }

  let { children, ...attributes }: Props = $props()
</script>

<mark {...attributes}>{@render children?.()}</mark>

<style>
  mark {
    padding-inline: 0.1em;
    color: var(--color-text-secondary);
    overflow-wrap: anywhere;
    background: var(--color-highlight-surface);
    -webkit-box-decoration-break: clone;
    box-decoration-break: clone;
  }
</style>

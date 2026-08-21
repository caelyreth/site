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
    color: inherit;
    overflow-wrap: anywhere;
    background: transparent;
    text-decoration: underline wavy var(--color-accent-secondary) 1.25px;
    text-underline-offset: 0.25em;
  }
</style>

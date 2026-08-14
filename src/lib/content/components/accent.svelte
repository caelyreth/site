<script lang="ts">
  import type { Snippet } from 'svelte'

  interface Props extends Record<string, unknown> {
    class?: string
    children?: Snippet
  }

  /* oxlint-disable prefer-const -- Snippet props can update with the document. */
  let { children, class: class_name, ...attributes }: Props = $props()
</script>

<span
  {...attributes}
  class={['accent', class_name].filter(Boolean).join(' ')}
>
  {@render children?.()}
</span>

<style>
  .accent {
    color: var(--color-text-link);
    font-family: var(--font-stack-serif);
    font-weight: 400;
    overflow-wrap: anywhere;
  }
</style>

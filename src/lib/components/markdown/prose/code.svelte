<script lang="ts">
  import type { Snippet } from 'svelte'

  interface Props extends Record<string, unknown> {
    children?: Snippet
  }

  let { children, ...attributes }: Props = $props()
</script>

<code {...attributes}>{@render children?.()}</code>

<style>
  code {
    padding: 0.1rem 0.25rem;
    border: 1px solid var(--color-rule);
    color: var(--color-text);
    font-family: var(--font-stack-sans);
    font-size: 0.8em;
    font-synthesis: none;
    font-variant-ligatures: none;
    overflow-wrap: anywhere;
    tab-size: 2;
    background: color-mix(in oklab, var(--color-text) 7%, transparent);
    -webkit-box-decoration-break: clone;
    box-decoration-break: clone;
  }
</style>

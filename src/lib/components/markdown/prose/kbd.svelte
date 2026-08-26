<script lang="ts">
  import type { Snippet } from 'svelte'

  interface Props extends Record<string, unknown> {
    children?: Snippet
  }

  let { children, ...attributes }: Props = $props()
</script>

<kbd {...attributes}>{@render children?.()}</kbd>

<style>
  kbd {
    padding: 0.08rem 0.28rem;
    border: 1px solid var(--color-rule);
    border-bottom-width: 2px;
    color: var(--color-text);
    font-family: var(--font-stack-sans);
    font-size: 0.78em;
    font-synthesis: none;
    font-variant-ligatures: none;
    line-height: 1;
    overflow-wrap: anywhere;
    background: var(--color-prose-surface);
    -webkit-box-decoration-break: clone;
    box-decoration-break: clone;
  }
</style>

<script lang="ts">
  import type { Snippet } from 'svelte'

  interface Props extends Record<string, unknown> {
    children?: Snippet
  }

  /* oxlint-disable prefer-const -- Renderer props can update with the document. */
  let { children, ...attributes }: Props = $props()
</script>

<code {...attributes}>{@render children?.()}</code>

<style>
  code {
    padding: 0.1rem 0.25rem;
    border: 1px solid var(--color-rule);
    color: var(--color-text);
    font-family: var(--font-stack-mono);
    font-size: 0.8em;
    overflow-wrap: anywhere;
    background: color-mix(in oklab, var(--color-text) 7%, transparent);
    -webkit-box-decoration-break: clone;
    box-decoration-break: clone;
  }
</style>

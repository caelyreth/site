<script lang="ts">
  import type { Snippet } from 'svelte'

  interface Props extends Record<string, unknown> {
    children?: Snippet
  }

  /* oxlint-disable prefer-const -- Renderer props can update with the document. */
  let { children, ...attributes }: Props = $props()
</script>

<a {...attributes}>{@render children?.()}</a>

<style>
  a {
    color: var(--color-text);
    text-decoration-color: var(--color-rule);
    text-decoration-thickness: 1px;
    text-underline-offset: 0.16em;
    overflow-wrap: anywhere;
    transition:
      color var(--dur-micro) var(--ease-out),
      text-decoration-color var(--dur-micro) var(--ease-out);
  }

  a:visited {
    color: var(--color-text-link);
  }

  @media (hover: hover) {
    a:hover {
      color: var(--color-text-link);
      text-decoration-color: var(--color-text-link);
    }
  }

  a:focus-visible {
    outline: 2px solid var(--color-focus);
    outline-offset: 0.16rem;
  }
</style>

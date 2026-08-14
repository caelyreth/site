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
    color: var(--color-text-link);
    text-decoration-line: underline;
    text-decoration-color: color-mix(
      in oklab,
      var(--color-text-link) 55%,
      transparent
    );
    text-decoration-thickness: 1px;
    text-underline-offset: 0.16em;
    overflow-wrap: anywhere;
    transition:
      color var(--dur-micro) var(--ease-out),
      text-decoration-color var(--dur-micro) var(--ease-out);
  }

  a::after {
    margin-inline-start: 0.16em;
    color: var(--color-muted);
    font-family: var(--font-stack-sans);
    font-size: 0.75em;
    font-weight: 600;
    text-decoration: none;
    content: '\2197';
  }

  a[href^='#fn']::after,
  a.footnote-backref::after {
    content: none;
  }

  @media (hover: hover) {
    a:hover {
      text-decoration-color: var(--color-text-link);
    }
  }

  a:focus-visible {
    outline: 2px solid var(--color-focus);
    outline-offset: 0.16rem;
  }
</style>

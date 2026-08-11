<script lang="ts">
  import type { Snippet } from 'svelte'

  type Props = {
    children?: Snippet
    depth?: number
    id?: string
  } & Record<string, unknown>

  /* oxlint-disable prefer-const -- Renderer props can update with the document. */
  let { children, depth = 2, id, ...attributes }: Props = $props()
  const tag = $derived(`h${depth}`)
</script>

<svelte:element this={tag} {...attributes} {id} data-heading-depth={depth}
  >{@render children?.()}</svelte:element
>

<style>
  :global([data-heading-depth]) {
    color: var(--color-text);
    scroll-margin-top: var(--header-safe-inset);
    overflow-wrap: anywhere;
  }

  :global([data-heading-depth='1']) {
    max-width: 18ch;
    margin: 0;
    font-family: var(--font-stack-serif);
    font-size: clamp(2.25rem, 7vw, 3rem);
    font-weight: 700;
    line-height: 1.08;
  }

  :global([data-heading-depth='2']) {
    margin: 3.5rem 0 0;
    font-family: var(--font-stack-serif);
    font-size: 1.375rem;
    font-weight: 700;
    line-height: 1.15;
  }

  :global([data-heading-depth='3']) {
    margin: 2.25rem 0 0;
    font-size: 1.125rem;
    font-weight: 700;
    line-height: 1.35;
  }

  :global([data-heading-depth='4']) {
    margin: 1.75rem 0 0;
    color: var(--color-text);
    font-size: var(--prose-size);
    font-weight: 700;
    line-height: 1.35;
  }

  :global([data-heading-depth='5']),
  :global([data-heading-depth='6']) {
    margin: 0.75rem 0 0;
    font-family: var(--font-stack-sans);
    font-size: var(--prose-size);
    line-height: var(--prose-leading);
  }

  :global([data-heading-depth='5']) {
    color: var(--color-text);
    font-weight: 600;
  }

  :global([data-heading-depth='6']) {
    color: var(--color-text-secondary);
    font-weight: 500;
  }
</style>

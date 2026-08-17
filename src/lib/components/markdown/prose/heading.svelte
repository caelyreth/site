<script lang="ts">
  import type { Snippet } from 'svelte'

  interface Props extends Record<string, unknown> {
    children?: Snippet
    class?: string
    depth?: number
    id?: string
  }

  /* oxlint-disable prefer-const -- Renderer props can update with the document. */
  let { children, class: class_name, depth = 2, id, ...attributes }: Props =
    $props()
  const tag = $derived(`h${Math.min(6, Math.max(1, depth))}`)
</script>

<svelte:element
  this={tag}
  {...attributes}
  class={`prose-heading${class_name ? ` ${class_name}` : ''}`}
  {id}
  data-heading-depth={depth}
>
  {#if id}
    <a class="heading-link" href={`#${id}`}>
      <span class="heading-text">{@render children?.()}</span>
      <span aria-hidden="true" class="heading-anchor i-ri-hashtag"></span>
    </a>
  {:else}
    {@render children?.()}
  {/if}
</svelte:element>

<style>
  .prose-heading {
    color: var(--color-text);
    font-style: normal;
    scroll-margin-top: var(--header-safe-inset);
    overflow-wrap: anywhere;
  }

  .prose-heading .heading-link {
    color: inherit;
    text-decoration: none;
  }

  .prose-heading .heading-anchor {
    display: inline-block;
    inline-size: 0.875em;
    block-size: 0.875em;
    margin-inline-start: 0.35em;
    color: var(--color-muted);
    opacity: 0;
    vertical-align: -0.08em;
    transform: translateX(-0.15em);
    transition:
      opacity var(--dur-short) var(--ease-in-out),
      transform var(--dur-short) var(--ease-in-out);
  }

  .prose-heading:hover .heading-anchor,
  .prose-heading .heading-link:focus-visible .heading-anchor {
    opacity: 1;
    transform: translateX(0);
  }

  .prose-heading .heading-link:focus-visible {
    border-radius: 0.15rem;
    outline: 2px solid var(--color-focus);
    outline-offset: 0.16rem;
  }

  .prose-heading::after {
    display: block;
    height: 1px;
    content: '';
  }

  .prose-heading[data-heading-depth='1']::after,
  .prose-heading[data-heading-depth='2']::after,
  .prose-heading[data-heading-depth='3']::after {
    margin-top: 0.7rem;
    background: var(--color-boundary);
  }

  .prose-heading[data-heading-depth='4']::after,
  .prose-heading[data-heading-depth='5']::after,
  .prose-heading[data-heading-depth='6']::after {
    margin-top: 0.45rem;
    background-image: var(--paper-seam-dash);
  }

  .prose-heading[data-heading-depth='1'] {
    margin: 0;
    font-family: var(--font-stack-serif);
    font-size: clamp(2.25rem, 7vw, 3rem);
    font-weight: 700;
    line-height: 1.08;
    text-wrap: balance;
  }

  .prose-heading[data-heading-depth='2'] {
    margin: 3.5rem 0 0;
    font-size: 1.375rem;
    font-weight: 700;
    line-height: 1.15;
    text-wrap: balance;
  }

  .prose-heading[data-heading-depth='3'] {
    margin: 2.25rem 0 0;
    font-size: 1.125rem;
    font-weight: 700;
    line-height: 1.35;
  }

  .prose-heading[data-heading-depth='4'] {
    margin: 1.75rem 0 0;
    font-size: var(--prose-size);
    font-weight: 700;
    line-height: 1.35;
  }

  .prose-heading[data-heading-depth='5'],
  .prose-heading[data-heading-depth='6'] {
    margin: 0.75rem 0 0;
    font-family: var(--font-stack-sans);
    font-size: var(--prose-size);
    line-height: var(--prose-leading);
  }

  .prose-heading[data-heading-depth='5'] {
    font-weight: 600;
  }

  .prose-heading[data-heading-depth='6'] {
    color: var(--color-text-secondary);
    font-weight: 500;
  }
</style>

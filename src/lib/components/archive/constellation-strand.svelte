<script lang="ts">
  import { base } from '$app/paths'
  import type { ConstellationSummary } from '$lib/content/relations'

  interface Props {
    constellation: ConstellationSummary
  }

  let { constellation }: Props = $props()

  function constellation_href(id: string) {
    return `${base}/constellations/${id}`.replace('//', '/')
  }

  function record_href(id: string) {
    return `${base}/records/${id}`.replace('//', '/')
  }
</script>

<article class="strand">
  <a class="strand-head" href={constellation_href(constellation.id)}>
    <h2>{constellation.title}</h2>
    <span class="strand-summary">{constellation.summary}</span>
  </a>

  <nav class="strand-records" aria-label={`${constellation.title}中的记录`}>
    {#each constellation.latest as record}
      <a href={record_href(record.id)}>{record.title}</a>
    {/each}
  </nav>
</article>

<style>
  .strand {
    display: grid;
    min-width: 0;
    padding-block: clamp(1rem, 2.2vw, 1.45rem) clamp(1rem, 2.2vw, 1.55rem);
    grid-template-columns: minmax(0, 1fr);
    gap: 0.75rem;
  }

  .strand-head,
  .strand-records {
    min-width: 0;
  }

  .strand-head {
    color: var(--color-text);
    text-decoration: none;
    transition: color var(--dur-short) var(--ease-out);
  }

  h2 {
    margin: 0;
    color: inherit;
    font-family: var(--font-stack-serif);
    font-size: clamp(1.2rem, 2vw, 1.6rem);
    font-weight: 700;
    letter-spacing: 0;
    line-height: 1.18;
    overflow-wrap: anywhere;
  }

  .strand-records {
    display: grid;
    padding-inline-start: 1rem;
    border-inline-start: 1px solid var(--color-boundary);
    font-size: 0.75rem;
    line-height: 1.45;
    gap: 0.375rem;
  }

  .strand-records a {
    position: relative;
    min-width: 0;
    overflow: hidden;
    color: var(--color-muted);
    text-overflow: ellipsis;
    text-decoration: none;
    white-space: nowrap;
    transition: color var(--dur-micro) var(--ease-out);
  }

  .strand-records a::before {
    position: absolute;
    top: 0.65em;
    right: 100%;
    width: 0.5rem;
    border-top: 1px solid var(--color-boundary);
    content: '';
  }

  .strand-summary {
    display: block;
    max-width: 25rem;
    margin-top: 0.65rem;
    color: var(--color-text-secondary);
    font-size: 0.8125rem;
    line-height: 1.5;
  }

  .strand-head:focus-visible,
  .strand-records a:focus-visible {
    outline: 2px solid var(--color-focus);
    outline-offset: 0.2rem;
  }

  @media (hover: hover) {
    .strand-head:hover {
      color: var(--color-text-link);
    }

    .strand-records a:hover {
      color: var(--color-text-link);
    }
  }

  @media (width >= 48rem) {
    .strand {
      grid-template-columns: minmax(12rem, 0.65fr) minmax(0, 1fr);
      align-items: start;
      column-gap: clamp(2rem, 5vw, 5rem);
    }

    .strand-head {
      grid-column: 1;
    }

    .strand-records {
      grid-column: 2;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .strand-head,
    .strand-records a {
      transition: none;
    }
  }
</style>

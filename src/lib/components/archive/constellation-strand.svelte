<script lang="ts">
  import { entry_path } from '$lib/content/entries'
  import { get_library_config } from '$lib/content/library'
  import type { ConstellationSummary } from '$lib/content/relations'
  import { format_template } from '$lib/content/site'
  import { site_href } from '$lib/navigation/path'

  import { format_published_date } from './date'

  interface Props {
    constellation: ConstellationSummary
  }

  let { constellation }: Props = $props()
  const library = get_library_config()
</script>

<article class="strand">
  <header class="strand-head">
    <div class="strand-meta">
      {#if constellation.latest_published}
        <time datetime={constellation.latest_published}
          >{format_published_date(constellation.latest_published)}</time
        >
      {/if}
      <span
        >{format_template(library.current.constellations.entry_count_label, {
          count: constellation.entry_count,
        })}</span
      >
    </div>
    <h2>{constellation.title}</h2>
    <span class="strand-summary">{constellation.summary}</span>
    <a
      class="strand-detail"
      href={site_href(`/constellations/${constellation.id}`)}
    >
      <span>{library.current.constellations.detail_label}</span>
      <span aria-hidden="true" class="i-ri-arrow-right-line"></span>
    </a>
  </header>

  <nav
    class="strand-echoes"
    aria-label={format_template(
      library.current.constellations.entries_navigation_label,
      {
        entries: library.current.constellations.entries_label,
        title: constellation.title,
      },
    )}
  >
    {#each constellation.latest as entry}
      <a href={site_href(entry_path(entry.collection, entry.id))}>
        <time datetime={entry.published}
          >{format_published_date(entry.published)}</time
        >
        <span class="echo-title">{entry.title}</span>
      </a>
    {/each}
  </nav>
</article>

<style>
  .strand {
    display: grid;
    min-width: 0;
    padding-block: clamp(1.25rem, 2.6vw, 1.8rem)
      clamp(1.25rem, 2.6vw, 1.75rem);
    grid-template-columns: minmax(0, 1fr);
    gap: 1rem;
  }

  .strand-head,
  .strand-echoes {
    min-width: 0;
  }

  .strand-head {
    color: var(--color-text);
  }

  .strand-meta {
    display: flex;
    margin-bottom: 0.7rem;
    align-items: baseline;
    gap: 0.65rem;
    color: var(--color-muted);
    font-size: 0.625rem;
    font-variant-numeric: tabular-nums;
    letter-spacing: 0.06em;
    line-height: 1.3;
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

  .strand-echoes {
    display: grid;
    font-size: 0.8125rem;
    gap: 0;
  }

  .strand-echoes a {
    position: relative;
    display: block;
    min-width: 0;
    min-height: 2.75rem;
    padding: 0.65rem 0;
    border-bottom: 1px solid var(--color-boundary);
    color: var(--color-muted);
    text-decoration: none;
    transition:
      border-color var(--dur-micro) var(--ease-out),
      color var(--dur-micro) var(--ease-out);
  }

  .strand-echoes time {
    display: block;
    margin-bottom: 0.25rem;
    color: var(--color-muted);
    font-size: 0.625rem;
    font-variant-numeric: tabular-nums;
    letter-spacing: 0.08em;
  }

  .echo-title {
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .strand-summary {
    display: block;
    max-width: 25rem;
    margin-top: 0.55rem;
    color: var(--color-text-secondary);
    font-size: 0.8125rem;
    line-height: 1.5;
  }

  .strand-detail {
    display: flex;
    min-height: 2.25rem;
    margin-top: 1rem;
    border-top: 1px solid var(--color-boundary);
    align-items: center;
    justify-content: space-between;
    color: var(--color-muted);
    font-size: 0.6875rem;
    letter-spacing: 0.06em;
    text-decoration: none;
    transition:
      border-color var(--dur-micro) var(--ease-out),
      color var(--dur-micro) var(--ease-out);
  }

  .i-ri-arrow-right-line {
    width: 1rem;
    height: 1rem;
  }

  .strand-detail:focus-visible,
  .strand-echoes a:focus-visible {
    outline: 2px solid var(--color-focus);
    outline-offset: 0.2rem;
  }

  @media (hover: hover) {
    .strand-detail:hover {
      border-color: var(--color-text-secondary);
      color: var(--color-text);
    }

    .strand-echoes a:hover {
      border-color: var(--color-text-secondary);
      color: var(--color-text);
    }
  }

  @media (width >= 48rem) {
    .strand {
      grid-template-columns: minmax(12rem, 0.52fr) minmax(0, 1fr);
      align-items: start;
      column-gap: clamp(1.5rem, 4vw, 3.5rem);
    }

    .strand-head {
      grid-column: 1;
    }

    .strand-echoes {
      grid-column: 2;
      padding-inline-start: clamp(1rem, 2vw, 1.5rem);
      border-inline-start: 1px solid var(--color-boundary);
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .strand-detail,
    .strand-echoes a {
      transition: none;
    }
  }
</style>

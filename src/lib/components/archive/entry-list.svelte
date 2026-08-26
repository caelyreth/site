<script lang="ts">
  import { entry_path, type EntryCollection } from '$lib/content/entries'
  import { get_library_config } from '$lib/content/library'
  import type { EntrySummary } from '$lib/content/relations'
  import { site_href } from '$lib/navigation/path'

  import ArchiveList from './archive-list.svelte'
  import ConstellationLinks from './constellation-links.svelte'
  import { format_published_date } from './date'

  interface Props {
    collection?: EntryCollection
    entries: EntrySummary[]
    show_collection?: boolean
    show_constellations?: boolean
  }

  let {
    collection,
    entries,
    show_collection = false,
    show_constellations = true,
  }: Props = $props()
  const library = get_library_config()
</script>

<ArchiveList>
  {#each entries as entry, index}
    <li
      class:records={collection === 'records'}
      class:voidknot={collection === 'voidknot'}
      class="entry-item"
    >
      <a
        class="entry-link"
        href={site_href(entry_path(entry.collection, entry.id))}
      >
        <div class="entry-coordinate">
          <span aria-hidden="true" class="entry-sequence"
            >{String(index + 1).padStart(2, '0')}</span
          >
          <time datetime={entry.published}
            >{format_published_date(entry.published)}</time
          >
        </div>
        <div class="entry-copy">
          {#if show_collection}
            <span class="entry-source"
              >{library.current.entries[entry.collection].title}</span
            >
          {/if}
          <h2>{entry.title}</h2>
          <p>{entry.summary}</p>
        </div>
      </a>
      {#if show_constellations}
        <div class="entry-constellations">
          <ConstellationLinks constellations={entry.constellations} />
        </div>
      {/if}
    </li>
  {/each}
</ArchiveList>

<style>
  .entry-item {
    --archive-mark-offset: 1.72rem;
    --entry-coordinate-width: clamp(5.75rem, 14vw, 7rem);
    --entry-column-gap: clamp(0.75rem, 1.75vw, 1.25rem);
    min-width: 0;
  }

  .entry-link {
    position: relative;
    display: grid;
    min-width: 0;
    padding-block: clamp(1.25rem, 2.6vw, 1.8rem)
      clamp(0.85rem, 1.8vw, 1.25rem);
    grid-template-columns: minmax(0, 1fr);
    gap: 0.4rem;
    color: var(--color-text);
    text-decoration: none;
    transition: color var(--dur-short) var(--ease-out);
  }

  .entry-coordinate {
    display: flex;
    align-items: baseline;
    gap: 0.5rem;
    color: var(--color-muted);
    font-variant-numeric: tabular-nums;
    line-height: 1.45;
  }

  .entry-coordinate time {
    font-size: 0.6875rem;
    letter-spacing: 0.03em;
  }

  .entry-sequence {
    color: var(--color-text-secondary);
    font-size: 0.625rem;
    letter-spacing: 0.08em;
  }

  .entry-copy {
    min-width: 0;
  }

  h2 {
    margin: 0;
    color: inherit;
    font-family: var(--font-stack-serif);
    font-size: clamp(1.2rem, 1.9vw, 1.55rem);
    font-weight: 700;
    letter-spacing: 0;
    line-height: 1.18;
    overflow-wrap: anywhere;
  }

  .entry-source {
    display: block;
    margin-bottom: 0.45rem;
    color: var(--color-muted);
    font-size: 0.625rem;
    letter-spacing: 0.08em;
    line-height: 1.25;
  }

  p {
    max-width: 40rem;
    margin: 0.5rem 0 0;
    color: var(--color-text-secondary);
    font-size: 0.875rem;
    line-height: 1.65;
  }

  .entry-constellations {
    margin: -0.1rem 0 1.25rem;
  }

  .entry-link:focus-visible {
    outline: 2px solid var(--color-focus);
    outline-offset: -2px;
  }

  @media (hover: hover) {
    .entry-link:hover {
      color: var(--color-text-link);
    }
  }

  @media (width >= 42rem) {
    .entry-link {
      grid-template-columns: var(--entry-coordinate-width) minmax(0, 1fr);
      column-gap: var(--entry-column-gap);
    }

    .entry-coordinate {
      padding-top: 0.2rem;
    }

    .entry-constellations {
      margin-left: calc(
        var(--entry-coordinate-width) + var(--entry-column-gap)
      );
    }
  }

  .entry-item.records .entry-link {
    padding-block: clamp(1rem, 2vw, 1.35rem) clamp(0.7rem, 1.4vw, 1rem);
  }

  .entry-item.records h2 {
    font-size: clamp(1.05rem, 1.55vw, 1.25rem);
    font-weight: 650;
    line-height: 1.35;
  }

  .entry-item.records p {
    max-width: 44rem;
    font-size: 0.8125rem;
    line-height: 1.55;
  }

  .entry-item.voidknot .entry-link {
    padding-block: clamp(1.6rem, 3.4vw, 2.5rem)
      clamp(1.1rem, 2.2vw, 1.65rem);
  }

  .entry-item.voidknot h2 {
    font-size: clamp(1.4rem, 2.4vw, 1.9rem);
    line-height: 1.24;
  }

  .entry-item.voidknot p {
    max-width: 35rem;
    font-size: 0.9375rem;
  }

  @media (prefers-reduced-motion: reduce) {
    .entry-link {
      transition: none;
    }
  }
</style>

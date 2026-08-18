<script lang="ts">
  import type { RecordSummary } from '$lib/content/relations'
  import { site_href } from '$lib/navigation/path'

  import ArchiveList from './archive-list.svelte'
  import ConstellationLinks from './constellation-links.svelte'
  import { format_published_date } from './date'

  interface Props {
    entries: RecordSummary[]
    show_constellations?: boolean
  }

  let { entries, show_constellations = true }: Props = $props()
</script>

<ArchiveList>
  {#each entries as entry, index}
    <li class="record-item">
      <a class="record-link" href={site_href(`/records/${entry.id}`)}>
        <div class="record-coordinate">
          <span aria-hidden="true" class="record-sequence"
            >{String(index + 1).padStart(2, '0')}</span
          >
          <time datetime={entry.published}
            >{format_published_date(entry.published)}</time
          >
        </div>
        <div class="record-copy">
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
  .record-item {
    --archive-mark-offset: 1.72rem;
    --record-coordinate-width: clamp(5.75rem, 14vw, 7rem);
    --record-column-gap: clamp(0.75rem, 1.75vw, 1.25rem);
    min-width: 0;
  }

  .record-link {
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

  .record-coordinate {
    display: flex;
    align-items: baseline;
    gap: 0.5rem;
    color: var(--color-muted);
    font-variant-numeric: tabular-nums;
    line-height: 1.45;
  }

  .record-coordinate time {
    font-size: 0.6875rem;
    letter-spacing: 0.03em;
  }

  .record-sequence {
    color: var(--color-text-secondary);
    font-size: 0.625rem;
    letter-spacing: 0.08em;
  }

  .record-copy {
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

  .record-link:focus-visible {
    outline: 2px solid var(--color-focus);
    outline-offset: -2px;
  }

  @media (hover: hover) {
    .record-link:hover {
      color: var(--color-text-link);
    }
  }

  @media (width >= 42rem) {
    .record-link {
      grid-template-columns: var(--record-coordinate-width) minmax(0, 1fr);
      column-gap: var(--record-column-gap);
    }

    .record-coordinate {
      padding-top: 0.2rem;
    }

    .entry-constellations {
      margin-left: calc(
        var(--record-coordinate-width) + var(--record-column-gap)
      );
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .record-link {
      transition: none;
    }
  }
</style>

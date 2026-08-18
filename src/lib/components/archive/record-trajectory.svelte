<script lang="ts">
  import type { RecordSummary } from '$lib/content/relations'
  import { site_href } from '$lib/navigation/path'

  import ArchiveList from './archive-list.svelte'
  import ConstellationLinks from './constellation-links.svelte'

  interface Props {
    entries: RecordSummary[]
    show_constellations?: boolean
  }

  let { entries, show_constellations = true }: Props = $props()

  const date_formatter = new Intl.DateTimeFormat('zh-CN', {
    day: 'numeric',
    month: 'short',
    timeZone: 'UTC',
    year: 'numeric',
  })

  function display_date(value: string) {
    return date_formatter.format(new Date(`${value}T00:00:00Z`))
  }
</script>

<ArchiveList>
  {#each entries as entry}
    <li>
      <a class="record-link" href={site_href(`/records/${entry.id}`)}>
        <time datetime={entry.published}
          >{display_date(entry.published)}</time
        >
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
  .record-link {
    position: relative;
    display: grid;
    min-width: 0;
    padding-block: clamp(1rem, 2.2vw, 1.4rem) clamp(0.85rem, 1.8vw, 1.2rem);
    grid-template-columns: minmax(0, 1fr);
    gap: 0.45rem;
    color: var(--color-text);
    text-decoration: none;
    transition: color var(--dur-short) var(--ease-out);
  }

  time {
    color: var(--color-muted);
    font-size: 0.625rem;
    font-variant-numeric: tabular-nums;
    letter-spacing: 0.04em;
    line-height: 1.3;
  }

  .record-copy {
    min-width: 0;
  }

  h2 {
    margin: 0;
    color: inherit;
    font-family: var(--font-stack-serif);
    font-size: clamp(1.15rem, 1.8vw, 1.5rem);
    font-weight: 700;
    letter-spacing: 0;
    line-height: 1.18;
    overflow-wrap: anywhere;
  }

  p {
    max-width: 44rem;
    margin: 0.45rem 0 0;
    color: var(--color-text-secondary);
    font-size: 0.8125rem;
    line-height: 1.55;
  }

  .entry-constellations {
    margin: -0.1rem 0 0.95rem;
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

  @media (prefers-reduced-motion: reduce) {
    .record-link {
      transition: none;
    }
  }
</style>

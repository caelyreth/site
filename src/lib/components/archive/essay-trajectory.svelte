<script lang="ts">
  import { base } from '$app/paths'
  import type { EssaySummary } from '$lib/content/archive'

  import ThreadLinks from './thread-links.svelte'

  interface Props {
    entries: EssaySummary[]
    show_threads?: boolean
  }

  let { entries, show_threads = true }: Props = $props()

  const date_formatter = new Intl.DateTimeFormat('en', {
    day: 'numeric',
    month: 'short',
    timeZone: 'UTC',
    year: 'numeric',
  })

  function essay_href(slug: string) {
    return `${base}/essays/${slug}`.replace('//', '/')
  }

  function display_date(value: string) {
    return date_formatter.format(new Date(`${value}T00:00:00Z`))
  }
</script>

<ol class="trajectory">
  {#each entries as entry}
    <li>
      <a class="essay-link" href={essay_href(entry.slug)}>
        <time datetime={entry.published}
          >{display_date(entry.published)}</time
        >
        <div class="essay-copy">
          <h2>{entry.title}</h2>
          <p>{entry.summary}</p>
        </div>
      </a>
      {#if show_threads}
        <div class="entry-threads">
          <ThreadLinks threads={entry.threads} />
        </div>
      {/if}
    </li>
  {/each}
</ol>

<style>
  .trajectory {
    --date-width: clamp(5.5rem, 12vw, 7.5rem);
    margin: 0;
    padding: 0;
    list-style: none;
  }

  li {
    position: relative;
    min-width: 0;
    border-bottom: 1px solid var(--color-boundary);
  }

  .essay-link {
    position: relative;
    display: grid;
    min-width: 0;
    padding-block: clamp(1.25rem, 3vw, 1.75rem);
    grid-template-columns: minmax(0, var(--date-width)) minmax(0, 1fr);
    column-gap: clamp(1rem, 3vw, 2.25rem);
    color: var(--color-text);
    text-decoration: none;
    transition: color var(--dur-short) var(--ease-out);
  }

  time {
    padding-top: 0.2rem;
    color: var(--color-muted);
    font-size: 0.625rem;
    font-variant-numeric: tabular-nums;
    letter-spacing: 0.04em;
    line-height: 1.3;
  }

  .essay-copy {
    min-width: 0;
  }

  h2 {
    margin: 0;
    color: inherit;
    font-family: var(--font-stack-serif);
    font-size: clamp(1.25rem, 2vw, 1.65rem);
    font-weight: 700;
    letter-spacing: 0;
    line-height: 1.05;
    overflow-wrap: anywhere;
  }

  p {
    max-width: 44rem;
    margin: 0.5rem 0 0;
    color: var(--color-text-secondary);
    font-size: 0.8125rem;
    line-height: 1.55;
  }

  .entry-threads {
    margin: -0.25rem 0 1.25rem
      calc(var(--date-width) + clamp(1rem, 3vw, 2.25rem));
  }

  .essay-link:focus-visible {
    outline: 2px solid var(--color-focus);
    outline-offset: -2px;
  }

  @media (hover: hover) {
    .essay-link:hover {
      color: var(--color-text-link);
    }
  }

  @media (width < 32rem) {
    .essay-link {
      grid-template-columns: 1fr;
      gap: 0.625rem;
    }

    .entry-threads {
      margin-inline-start: 0;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .essay-link {
      transition: none;
    }
  }
</style>

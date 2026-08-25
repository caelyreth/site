<script lang="ts">
  import { entry_path } from '$lib/content/entries'
  import type { RecentArchiveItem } from '$lib/content/relations'
  import { site_href } from '$lib/navigation/path'

  import ArchiveList from './archive-list.svelte'
  import { format_published_date } from './date'

  interface Props {
    items: RecentArchiveItem[]
  }

  let { items }: Props = $props()

  const collection_labels = {
    records: '简单记录',
    voidknot: '虚空之结',
  } as const

  function item_href(item: RecentArchiveItem) {
    return item.kind === 'entry'
      ? entry_path(item.collection, item.id)
      : `/constellations/${item.id}`
  }

  function item_label(item: RecentArchiveItem) {
    if (item.kind === 'entry') return collection_labels[item.collection]
    return `星群 / ${item.entry_count} 条记录`
  }
</script>

<section class="recent-archive" aria-labelledby="recent-archive-title">
  <header class="recent-head">
    <div>
      <p class="micro-label">近期归档</p>
      <h2 id="recent-archive-title">正在接收的信号</h2>
    </div>
    <a href={site_href('/constellations')}>查看星群</a>
  </header>

  {#if items.length}
    <ArchiveList>
      {#each items as item, index}
        <li class:constellation={item.kind === 'constellation'}>
          <a class="recent-link" href={site_href(item_href(item))}>
            <div class="recent-coordinate">
              <span aria-hidden="true"
                >{String(index + 1).padStart(2, '0')}</span
              >
              {#if item.updated}
                <time datetime={item.updated}
                  >{format_published_date(item.updated)}</time
                >
              {/if}
            </div>
            <div class="recent-copy">
              <span class="recent-kind">{item_label(item)}</span>
              <h3>{item.title}</h3>
              <p>{item.summary}</p>
            </div>
          </a>
        </li>
      {/each}
    </ArchiveList>
  {:else}
    <p class="recent-empty">暂未接收到可归档的信号。</p>
  {/if}
</section>

<style>
  .recent-archive {
    --archive-axis: clamp(0.25rem, 1.25vw, 0.75rem);
    --archive-content-inset: calc(
      var(--archive-axis) + clamp(1.25rem, 2.5vw, 2rem)
    );
    width: min(100%, 48rem);
    margin: 0 auto clamp(3.5rem, 8vw, 6rem);
  }

  .recent-head {
    display: flex;
    min-width: 0;
    margin-bottom: clamp(1.25rem, 3vw, 2rem);
    align-items: end;
    justify-content: space-between;
    gap: 1rem;
  }

  .recent-head p {
    margin: 0;
    color: var(--color-muted);
  }

  .recent-head h2 {
    margin: 0.55rem 0 0;
    color: var(--color-text);
    font-family: var(--font-stack-serif);
    font-size: clamp(1.35rem, 2.25vw, 1.75rem);
    font-weight: 700;
    letter-spacing: 0;
    line-height: 1.2;
  }

  .recent-head a {
    flex: none;
    color: var(--color-muted);
    font-size: 0.75rem;
    line-height: 1.4;
    text-decoration: none;
    transition: color var(--dur-micro) var(--ease-out);
  }

  .recent-link {
    display: grid;
    min-width: 0;
    padding-block: 1.05rem;
    grid-template-columns: minmax(0, 1fr);
    gap: 0.35rem;
    color: var(--color-text);
    text-decoration: none;
    transition: color var(--dur-micro) var(--ease-out);
  }

  .recent-coordinate {
    display: flex;
    align-items: baseline;
    gap: 0.5rem;
    color: var(--color-muted);
    font-family: var(--font-stack-mono);
    font-size: 0.625rem;
    font-variant-numeric: tabular-nums;
    letter-spacing: 0.06em;
    line-height: 1.35;
  }

  .recent-copy {
    min-width: 0;
  }

  .recent-kind {
    display: block;
    margin-bottom: 0.35rem;
    color: var(--color-muted);
    font-size: 0.625rem;
    letter-spacing: 0.06em;
    line-height: 1.35;
  }

  h3 {
    margin: 0;
    color: inherit;
    font-family: var(--font-stack-serif);
    font-size: clamp(1rem, 1.6vw, 1.2rem);
    font-weight: 700;
    letter-spacing: 0;
    line-height: 1.3;
    overflow-wrap: anywhere;
  }

  .recent-copy p {
    max-width: 42rem;
    margin: 0.35rem 0 0;
    color: var(--color-text-secondary);
    font-size: 0.8125rem;
    line-height: 1.55;
  }

  .recent-empty {
    margin: 0;
    color: var(--color-muted);
    font-size: 0.8125rem;
    line-height: 1.6;
  }

  :global(.recent-archive .archive-list > li) {
    --archive-mark-offset: 1.55rem;
  }

  :global(.recent-archive .archive-list > li.constellation)::before {
    border-radius: 50%;
  }

  .recent-link:focus-visible {
    outline: 2px solid var(--color-focus);
    outline-offset: -2px;
  }

  @media (hover: hover) {
    .recent-link:hover,
    .recent-head a:hover {
      color: var(--color-text-link);
    }
  }

  @media (width >= 42rem) {
    .recent-link {
      grid-template-columns: clamp(5.5rem, 12vw, 6.75rem) minmax(0, 1fr);
      column-gap: clamp(0.75rem, 1.75vw, 1.25rem);
    }

    .recent-coordinate {
      padding-top: 0.15rem;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .recent-head a,
    .recent-link {
      transition: none;
    }
  }
</style>

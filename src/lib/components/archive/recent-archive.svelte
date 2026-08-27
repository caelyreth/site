<script lang="ts">
  import { entry_path } from '$lib/content/entries'
  import type { EntrySummary } from '$lib/content/relations'
  import { site_href } from '$lib/navigation/path'

  import ArchiveList from './archive-list.svelte'
  import { format_published_date } from './date'

  interface Props {
    items: EntrySummary[]
  }

  let { items }: Props = $props()

  const collection_labels = {
    records: '简单记录',
    voidknot: '虚空之结',
  } as const
</script>

<section class="recent-archive" aria-labelledby="recent-archive-title">
  <header class="recent-head">
    <div>
      <p class="micro-label">近期归档</p>
      <h2 id="recent-archive-title">最新内容</h2>
    </div>
    <a href={site_href('/constellations')}>查看星群</a>
  </header>

  {#if items.length}
    <ArchiveList>
      {#each items as item}
        <li>
          <a
            class="recent-link"
            href={site_href(entry_path(item.collection, item.id))}
          >
            <div class="recent-copy">
              <div class="recent-meta">
                <time datetime={item.published}
                  >{format_published_date(item.published)}</time
                >
                <span class="recent-kind"
                  >{collection_labels[item.collection]}</span
                >
              </div>
              <h3>{item.title}</h3>
              <p>{item.summary}</p>
            </div>
          </a>
        </li>
      {/each}
    </ArchiveList>
  {:else}
    <p class="recent-empty">暂时没有可显示的内容。</p>
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
    display: inline-flex;
    min-height: 2.5rem;
    padding-inline: 0.25rem;
    align-items: center;
    color: var(--color-text-secondary);
    font-family: var(--font-stack-serif);
    font-size: 0.9375rem;
    line-height: 1.4;
    text-decoration: none;
    transition: color var(--dur-micro) var(--ease-out);
  }

  .recent-link {
    display: grid;
    min-width: 0;
    padding-block: 1.05rem;
    color: var(--color-text);
    text-decoration: none;
    transition: color var(--dur-micro) var(--ease-out);
  }

  .recent-meta {
    display: flex;
    margin-bottom: 0.35rem;
    align-items: baseline;
    gap: 0.5rem;
    color: var(--color-muted);
    font-size: 0.625rem;
    font-variant-numeric: tabular-nums;
    letter-spacing: 0.06em;
    line-height: 1.35;
  }

  .recent-copy {
    min-width: 0;
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

  @media (prefers-reduced-motion: reduce) {
    .recent-head a,
    .recent-link {
      transition: none;
    }
  }
</style>

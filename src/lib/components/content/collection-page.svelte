<script lang="ts">
  import { base } from '$app/paths'
  import type {
    ContentSection,
    ContentSummary,
    EntryFrontmatter,
  } from '$lib/content/schema'

  interface Props {
    description: string
    entries: ContentSummary<EntryFrontmatter>[]
    eyebrow: string
    section: ContentSection
    title: string
  }

  const { description, entries, eyebrow, section, title }: Props = $props()

  function section_path() {
    return `${base}/${section}`.replace('//', '/')
  }

  function entry_path(slug: string) {
    return `${section_path()}/${slug}`
  }

  function display_date(value: string | undefined) {
    if (!value) return 'Undated record'
    return value
  }
</script>

<section id="content" class="collection-page">
  <header class="collection-header">
    <p class="micro-label eyebrow">{eyebrow}</p>
    <h1 class="font-serif">{title}</h1>
    <p class="description">{description}</p>
  </header>

  <div class="collection-rule" aria-hidden="true"></div>

  {#if entries.length > 0}
    <ol class="entry-list">
      {#each entries as entry}
        <li>
          <a class="entry-link" href={entry_path(entry.slug)}>
            <div class="entry-meta">
              <span>{display_date(entry.frontmatter.published)}</span>
              <span>{entry.slug}</span>
            </div>
            <h2 class="font-serif">{entry.frontmatter.title}</h2>
            {#if entry.frontmatter.summary || entry.frontmatter.description}
              <p>
                {entry.frontmatter.summary ?? entry.frontmatter.description}
              </p>
            {/if}
            <span
              class="entry-arrow i-ri-arrow-right-line"
              aria-hidden="true"
            ></span>
          </a>
        </li>
      {/each}
    </ol>
  {:else}
    <div class="empty-state">
      <span class="empty-mark" aria-hidden="true">--</span>
      <p>No records have been filed in this shelf yet.</p>
    </div>
  {/if}
</section>

<style>
  .collection-page {
    box-sizing: border-box;
    width: min(100%, var(--frame-measure));
    margin: 0 auto;
    padding: clamp(3.25rem, 8vw, 7rem) var(--inline-gutter)
      clamp(4rem, 9vw, 7rem);
  }

  .collection-header {
    max-width: 42rem;
  }

  .eyebrow {
    margin: 0;
    color: var(--color-muted);
    letter-spacing: 0.14em;
  }

  h1 {
    margin: 0.875rem 0 0;
    color: var(--color-text);
    font-size: clamp(2.25rem, 6vw, 4.5rem);
    font-weight: 700;
    letter-spacing: 0;
    line-height: 0.98;
  }

  .description {
    max-width: 38rem;
    margin: 1.25rem 0 0;
    color: var(--color-text-secondary);
    font-size: 1rem;
    line-height: 1.6;
  }

  .collection-rule {
    height: 1px;
    margin-top: clamp(2.5rem, 6vw, 5rem);
    background-image: var(--paper-seam-dash);
  }

  .entry-list {
    margin: 0;
    padding: 0;
    list-style: none;
  }

  .entry-list li {
    border-bottom: 1px solid var(--color-boundary);
  }

  .entry-link {
    position: relative;
    display: block;
    padding: 1.5rem 2.5rem 1.5rem 0;
    color: var(--color-text);
    text-decoration: none;
    transition:
      color var(--dur-short) var(--ease-out),
      padding var(--dur-short) var(--ease-out),
      background-color var(--dur-short) var(--ease-out);
  }

  .entry-meta {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem 1.25rem;
    color: var(--color-muted);
    font-size: 0.625rem;
    letter-spacing: 0.08em;
    line-height: 1.3;
    text-transform: uppercase;
  }

  .entry-meta span + span::before {
    margin-right: 1.25rem;
    color: var(--color-boundary);
    content: '/';
  }

  h2 {
    margin: 0.625rem 0 0;
    color: inherit;
    font-size: clamp(1.25rem, 2.2vw, 1.75rem);
    font-weight: 700;
    line-height: 1.08;
  }

  .entry-link p {
    max-width: 40rem;
    margin: 0.625rem 0 0;
    color: var(--color-text-secondary);
    font-size: 0.8125rem;
    line-height: 1.55;
  }

  .entry-arrow {
    position: absolute;
    top: 50%;
    right: 0.25rem;
    color: var(--color-muted);
    font-size: 1rem;
    transform: translateY(-50%);
    transition:
      color var(--dur-short) var(--ease-out),
      transform var(--dur-short) var(--ease-out);
  }

  .empty-state {
    display: flex;
    min-height: 12rem;
    border-bottom: 1px solid var(--color-boundary);
    color: var(--color-muted);
    align-items: center;
    gap: 0.75rem;
  }

  .empty-state p {
    margin: 0;
    font-size: 0.8125rem;
  }

  .empty-mark {
    color: var(--color-boundary);
    font-family: var(--font-stack-mono);
    font-size: 1.25rem;
  }

  @media (hover: hover) {
    .entry-link:hover {
      padding-inline-start: 0.75rem;
      background-color: color-mix(
        in oklab,
        var(--color-prose-surface) 64%,
        transparent
      );
    }

    .entry-link:hover .entry-arrow {
      color: var(--color-text-link);
      transform: translate(0.25rem, -50%);
    }
  }

  .entry-link:focus-visible {
    outline: 2px solid var(--color-focus);
    outline-offset: -2px;
  }

  @media (max-width: 40rem) {
    .collection-page {
      padding-top: 3rem;
    }

    .entry-link {
      padding-block: 1.25rem;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .entry-link,
    .entry-arrow {
      transition: none;
    }
  }
</style>

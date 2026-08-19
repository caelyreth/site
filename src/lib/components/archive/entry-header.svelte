<script lang="ts">
  import type { EntryCollection } from '$lib/content/entries'
  import type { Snippet } from 'svelte'

  import BackLink from './back-link.svelte'

  interface Props {
    back_href: string
    back_label: string
    collection?: EntryCollection
    children?: Snippet
    meta: string
    summary: string
    title: string
  }

  let {
    back_href,
    back_label,
    children,
    collection,
    meta,
    summary,
    title,
  }: Props = $props()
</script>

<header class="archive-entry-header" data-collection={collection}>
  <BackLink href={back_href} label={back_label} />
  <p class="micro-label entry-meta">{meta}</p>
  <h1>{title}</h1>
  <p class="summary">{summary}</p>
  {@render children?.()}
</header>

<style>
  .entry-meta {
    margin: clamp(1.25rem, 3vw, 2rem) 0 0;
    color: var(--color-muted);
    letter-spacing: 0.13em;
  }

  h1 {
    margin: 0.875rem 0 0;
    color: var(--color-text);
    font-family: var(--font-stack-serif);
    font-size: clamp(2rem, 3.6vw, 3.4rem);
    font-weight: 700;
    letter-spacing: 0;
    line-height: 1.16;
    overflow-wrap: anywhere;
  }

  .archive-entry-header[data-collection='records'] h1 {
    font-size: clamp(1.75rem, 3vw, 2.75rem);
    font-weight: 650;
    line-height: 1.25;
  }

  .summary {
    max-width: 41rem;
    margin: 1rem 0 0;
    color: var(--color-text-secondary);
    font-size: 1rem;
    line-height: 1.6;
  }
</style>

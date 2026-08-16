<script lang="ts">
  import { base } from '$app/paths'
  import ThreadLinks from '$lib/components/content/thread-links.svelte'
  import Content from '$lib/components/markdown/document.svelte'
  import type {
    ContentDocument,
    EntryFrontmatter,
  } from '$lib/content/schema'

  type EntryProfile = 'article' | 'essay' | 'map'

  interface Props {
    back_label: string
    back_path: string
    document: ContentDocument<EntryFrontmatter>
    profile: EntryProfile
    section_label: string
  }

  const { back_label, back_path, document, profile, section_label }: Props =
    $props()

  const back_href = $derived(`${base}${back_path}`.replace('//', '/'))
</script>

<article
  id="content"
  class:article-profile={profile === 'article'}
  class:essay-profile={profile === 'essay'}
  class:map-profile={profile === 'map'}
  class="entry-view"
>
  <header class="entry-header">
    <a class="back-link" href={back_href}>
      <span class="i-ri-arrow-left-line" aria-hidden="true"></span>
      <span>{back_label}</span>
    </a>
    <p class="micro-label entry-label">
      {section_label}{#if document.frontmatter.published}
        / {document.frontmatter.published}{/if}
    </p>
    <h1 class="font-serif">{document.frontmatter.title}</h1>
    {#if document.frontmatter.summary || document.frontmatter.description}
      <p class="dek">
        {document.frontmatter.summary ?? document.frontmatter.description}
      </p>
    {/if}
    {#if document.frontmatter.threads?.length}
      <ThreadLinks threads={document.frontmatter.threads} />
    {/if}
  </header>

  <div class="entry-rule" aria-hidden="true"></div>

  <div class="entry-body">
    <Content {document} />
  </div>

  <nav class="entry-footer" aria-label="Entry navigation">
    <a class="back-link" href={back_href}>
      <span class="i-ri-arrow-left-line" aria-hidden="true"></span>
      <span>Back to {back_label}</span>
    </a>
  </nav>
</article>

<style>
  .entry-view {
    --entry-measure: 48rem;
    box-sizing: border-box;
    display: flex;
    width: min(100%, var(--frame-measure));
    margin: 0 auto;
    padding: clamp(3rem, 8vw, 6rem) var(--inline-gutter) 0;
    flex: 1;
    flex-direction: column;
  }

  .essay-profile {
    --entry-measure: 54rem;
  }

  .map-profile {
    --entry-measure: 52rem;
  }

  .entry-header,
  .entry-body,
  .entry-footer {
    width: min(100%, var(--entry-measure));
    margin-inline: auto;
  }

  .back-link {
    display: inline-flex;
    color: var(--color-muted);
    font-size: 0.6875rem;
    font-weight: 500;
    letter-spacing: 0.06em;
    line-height: 1.3;
    text-decoration: none;
    text-transform: uppercase;
    align-items: center;
    gap: 0.5rem;
    transition: color var(--dur-short) var(--ease-out);
  }

  .back-link span:first-child {
    font-size: 0.875rem;
    transition: transform var(--dur-short) var(--ease-out);
  }

  .back-link:focus-visible {
    outline: 2px solid var(--color-focus);
    outline-offset: 0.25rem;
  }

  .entry-label {
    margin: clamp(2.5rem, 6vw, 4.5rem) 0 0;
    color: var(--color-muted);
    letter-spacing: 0.14em;
  }

  h1 {
    margin: 0.875rem 0 0;
    color: var(--color-text);
    font-size: clamp(2.25rem, 6vw, 4.75rem);
    font-weight: 700;
    line-height: 0.98;
  }

  .dek {
    max-width: 40rem;
    margin: 1.25rem 0 0;
    color: var(--color-text-secondary);
    font-size: 1rem;
    line-height: 1.6;
  }

  .entry-rule {
    height: 1px;
    margin: clamp(2.5rem, 6vw, 5rem) auto clamp(2rem, 5vw, 4rem);
    background-image: var(--paper-seam-dash);
  }

  .entry-body {
    min-width: 0;
  }

  .entry-footer {
    margin-top: clamp(3rem, 7vw, 6rem);
    padding-block: 1.25rem clamp(2.5rem, 6vw, 4rem);
    border-top: 1px solid var(--color-boundary);
  }

  @media (hover: hover) {
    .back-link:hover {
      color: var(--color-text-link);
    }

    .back-link:hover span:first-child {
      transform: translateX(-0.2rem);
    }
  }

  @media (max-width: 40rem) {
    .entry-view {
      padding-top: 3rem;
    }

    h1 {
      font-size: clamp(2rem, 11vw, 3.25rem);
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .back-link,
    .back-link span:first-child {
      transition: none;
    }
  }
</style>

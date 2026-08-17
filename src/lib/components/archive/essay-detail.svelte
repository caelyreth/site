<script lang="ts">
  import { base } from '$app/paths'
  import Content from '$lib/components/markdown/document.svelte'
  import type { EssayDocument } from '$lib/content/archive'

  import BackLink from './back-link.svelte'
  import EntryHeader from './entry-header.svelte'
  import ThreadLinks from './thread-links.svelte'

  interface Props {
    document: EssayDocument
  }

  let { document }: Props = $props()
  const date_formatter = new Intl.DateTimeFormat('en', {
    day: 'numeric',
    month: 'long',
    timeZone: 'UTC',
    year: 'numeric',
  })

  function display_date(value: string) {
    return date_formatter.format(new Date(`${value}T00:00:00Z`))
  }
</script>

<article id="content" class="essay-detail">
  <EntryHeader
    back_href={`${base}/essays`.replace('//', '/')}
    back_label="Essays"
    meta={`Essay / ${display_date(document.frontmatter.published)}`}
    summary={document.frontmatter.summary}
    title={document.frontmatter.title}
  >
    {#snippet children()}
      <ThreadLinks threads={document.frontmatter.threads ?? []} />
    {/snippet}
  </EntryHeader>

  <div class="entry-body">
    <Content {document} />
  </div>

  <footer class="entry-footer">
    <BackLink
      href={`${base}/essays`.replace('//', '/')}
      label="Return to essays"
    />
  </footer>
</article>

<style>
  .essay-detail {
    --entry-measure: 45rem;
    box-sizing: border-box;
    width: min(100%, var(--frame-measure));
    margin: 0 auto;
    padding: clamp(3rem, 7vw, 5.5rem) var(--inline-gutter) 0;
  }

  :global(.archive-entry-header),
  .entry-body,
  .entry-footer {
    width: min(100%, var(--entry-measure));
    margin-inline: auto;
  }

  .entry-body {
    margin-top: clamp(2.75rem, 7vw, 5rem);
  }

  .entry-footer {
    margin-top: clamp(2.75rem, 7vw, 5rem);
    padding-block: 1rem clamp(2.5rem, 6vw, 4.5rem);
    border-top: 1px solid var(--color-boundary);
  }
</style>

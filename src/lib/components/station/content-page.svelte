<script lang="ts">
  import { resolve_comark_component } from '$lib/comark/manifest'
  import type { ContentDocument } from '$lib/content/types'
  import { resolve_presentation } from '$lib/presentation/discovery'
  import { MarkdownDocument } from '@comark/svelte'

  import StationShell from './station-shell.svelte'

  /* oxlint-disable prefer-const -- Content can update during client navigation. */
  let { document }: { document: ContentDocument } = $props()
  const presentation = $derived(resolve_presentation(document.frontmatter))
</script>

<svelte:head>
  <title>{document.frontmatter.title}</title>
  {#if document.frontmatter.description}
    <meta name="description" content={document.frontmatter.description} />
  {/if}
</svelte:head>

<StationShell footer={presentation.footer} graphic={presentation.graphic}>
  <MarkdownDocument
    value={document}
    componentsManifest={resolve_comark_component}
  />
</StationShell>

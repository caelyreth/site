<script lang="ts">
  import { resolve_comark_component } from '$lib/comark/manifest'
  import type { ContentPage } from '$lib/content/types'
  import { resolve_presentation } from '$lib/presentation/registry'
  import { MarkdownDocument } from '@comark/svelte'

  import StationShell from './station-shell.svelte'

  /* oxlint-disable prefer-const -- Content can update during client navigation. */
  let { content }: { content: ContentPage } = $props()
  const presentation = $derived(resolve_presentation(content.presentation))
</script>

<svelte:head>
  <title>{content.document.frontmatter.title}</title>
  {#if content.document.frontmatter.description}
    <meta
      name="description"
      content={content.document.frontmatter.description}
    />
  {/if}
</svelte:head>

<StationShell footer={presentation.footer} graphic={presentation.stage}>
  <MarkdownDocument
    value={content.document}
    componentsManifest={resolve_comark_component}
  />
</StationShell>

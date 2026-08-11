<script lang="ts">
  import type { ContentDocument } from '$lib/content/schema'
  import { MarkdownDocument } from '@comark/svelte'
  import type { Component } from 'svelte'

  import Heading from './blocks/prose/heading.svelte'

  const components = import.meta.glob('./blocks/**/*.svelte', {
    eager: true,
    import: 'default',
  }) as Record<string, Component>

  function resolve_component(name: string) {
    if (/^h[1-6]$/.test(name)) return Heading
    if (name.startsWith('alert-')) {
      return components[`./blocks/prose/alerts/${name.slice(6)}.svelte`]
    }

    return (
      components[`./blocks/prose/${name}.svelte`] ??
      components[`./blocks/${name}.svelte`]
    )
  }

  /* oxlint-disable prefer-const -- Document props can update during client navigation. */
  let { document }: { document: ContentDocument } = $props()
</script>

<div class="document">
  <MarkdownDocument
    value={document}
    componentsManifest={resolve_component}
  />
</div>

<style>
  .document {
    --prose-size: 0.9375rem;
    --prose-leading: 1.6;
  }
</style>

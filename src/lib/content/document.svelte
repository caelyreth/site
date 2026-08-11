<script lang="ts">
  import type { ContentDocument } from '$lib/content/schema'
  import { MarkdownDocument } from '@comark/svelte'
  import type { Component } from 'svelte'

  const components = import.meta.glob('./blocks/*.svelte', {
    eager: true,
    import: 'default',
  }) as Record<string, Component>

  function resolve_component(name: string) {
    return (
      components[`./blocks/prose-${name}.svelte`] ??
      components[`./blocks/${name}.svelte`]
    )
  }

  /* oxlint-disable prefer-const -- Document props can update during client navigation. */
  let { document }: { document: ContentDocument } = $props()
</script>

<MarkdownDocument value={document} componentsManifest={resolve_component} />

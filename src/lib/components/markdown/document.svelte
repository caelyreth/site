<script lang="ts">
  import type { ContentDocument } from '$lib/content/schema'
  import { MarkdownDocument } from '@comark/svelte'
  import { pascalCase } from 'comark/utils'
  import type { Component } from 'svelte'

  const custom_components = import.meta.glob<Component>(
    './blocks/*.svelte',
    {
      eager: true,
      import: 'default',
    },
  )

  const prose_components = import.meta.glob<Component>('./prose/*.svelte', {
    eager: true,
    import: 'default',
  })

  function component_name(path: string) {
    return path.slice(path.lastIndexOf('/') + 1, -'.svelte'.length)
  }

  const components = Object.freeze({
    ...Object.fromEntries(
      Object.entries(custom_components).map(([path, component]) => [
        component_name(path),
        component,
      ]),
    ),
    ...Object.fromEntries(
      Object.entries(prose_components).map(([path, component]) => [
        `Prose${pascalCase(component_name(path))}`,
        component,
      ]),
    ),
  })

  /* oxlint-disable prefer-const -- Document props can update during client navigation. */
  let { document }: { document: ContentDocument } = $props()
</script>

<div class="document">
  <MarkdownDocument value={document} {components} />
</div>

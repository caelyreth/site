<script lang="ts">
  import type { ContentFont } from '$lib/content/frontmatter'
  import { MarkdownDocument } from '@comark/svelte'
  import type { MarkdownDocument as MarkdownDocumentValue } from 'comark'
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

  interface Props {
    document: MarkdownDocumentValue
    font?: ContentFont
  }

  let { document, font = 'sans' }: Props = $props()
</script>

<div class="document" data-font={font}>
  <MarkdownDocument value={document} {components} />
</div>

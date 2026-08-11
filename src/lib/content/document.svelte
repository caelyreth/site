<script lang="ts">
  import { resolve_comark_component } from '$lib/content/manifest'
  import type { ContentDocument } from '$lib/content/types'
  import { MarkdownDocument } from '@comark/svelte'

  /* oxlint-disable prefer-const -- Document props can update during client navigation. */
  let { document }: { document: ContentDocument } = $props()
</script>

<MarkdownDocument
  value={document}
  componentsManifest={resolve_comark_component}
/>

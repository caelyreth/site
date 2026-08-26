<script lang="ts">
  import DocumentPage from '$lib/components/markdown/document-page.svelte'

  import type { PageData } from './$types'

  let { data }: { data: PageData } = $props()
</script>

<DocumentPage document={data.document} />

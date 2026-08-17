<script lang="ts">
  import ThreadIndex from '$lib/components/archive/thread-index.svelte'

  import type { PageData } from './$types'

  let { data }: { data: PageData } = $props()
</script>

<svelte:head>
  <title>线索 / Caelyreth</title>
  <meta
    name="description"
    content="在 Caelyreth 中继站的随笔之间彼此呼应的主题。"
  />
</svelte:head>

<ThreadIndex threads={data.threads} />

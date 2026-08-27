<script lang="ts">
  import FriendList from '$lib/components/friends/list.svelte'
  import PaperSeam from '$lib/components/layout/paper-seam.svelte'
  import DocumentPage from '$lib/components/markdown/document-page.svelte'

  import type { PageData } from './$types'

  let { data }: { data: PageData } = $props()
</script>

<DocumentPage document={data.document}>
  <div class="friends-transition">
    <PaperSeam />
  </div>
  <FriendList friends={data.friends} />
</DocumentPage>

<style>
  .friends-transition {
    width: calc(100% + var(--inline-gutter) * 2);
    margin: clamp(2rem, 5vw, 3.5rem) calc(-1 * var(--inline-gutter)) 0;
  }
</style>

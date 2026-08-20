<script lang="ts">
  import { page } from '$app/state'
  import Backdrop from '$lib/components/layout/backdrop.svelte'
  import Footer from '$lib/components/layout/footer.svelte'
  import {
    set_page_chrome,
    type PageChrome,
  } from '$lib/components/layout/page-chrome'
  import PaperDeck from '$lib/components/layout/paper-deck.svelte'
  import Header from '$lib/components/navigation/header.svelte'
  import TableOfContents from '$lib/components/navigation/table-of-contents.svelte'
  import type { HeadingEntry } from '$lib/content/headings'
  import { set_library_config } from '$lib/content/library'
  import RelayFooter from '$lib/presentation/relay-footer/view.svelte'
  import type { Snippet } from 'svelte'

  import type { LayoutData } from './$types'

  interface Props {
    children: Snippet
    data: LayoutData
  }

  const { children, data }: Props = $props()
  const chrome = $state<PageChrome>({
    content_active: true,
    stage_progress: 1,
    toc: [],
  })
  const page_toc = $derived(
    ((page.data as { toc?: HeadingEntry[] }).toc ?? []) as HeadingEntry[],
  )
  const library = {
    get current() {
      return data.library
    },
  }

  set_page_chrome(chrome)
  set_library_config(library)

  $effect(() => {
    chrome.toc = page_toc
  })
</script>

<div class="library">
  <div class="scroll-chrome" style:--stage-progress={1}>
    <Backdrop />
    <Header />
  </div>
  <main id="main-content" class="library-main" tabindex="-1">
    <div class="library-surface">
      <PaperDeck edge>
        {@render children()}
      </PaperDeck>
    </div>
    {#if chrome.toc.length}
      <TableOfContents entries={chrome.toc} />
    {/if}
  </main>
  <Footer>
    {#snippet children(visible)}
      <RelayFooter entries={data.footer_entries} {visible} />
    {/snippet}
  </Footer>
</div>

<style>
  .library {
    position: relative;
    z-index: 10;
    display: flex;
    min-height: 100vh;
    flex-direction: column;
  }

  .library-main {
    display: flex;
    width: 100%;
    min-height: calc(100vh - var(--header-block-size));
    flex: 1;
    flex-direction: column;
    padding-top: var(--header-block-size);
  }

  .library-surface {
    box-sizing: border-box;
    display: flex;
    width: min(100%, var(--frame-measure));
    min-height: calc(100vh - var(--header-block-size));
    margin-inline: auto;
    flex: 1;
    flex-direction: column;
  }

  .library-main :global(.toc-rail) {
    position: fixed;
    top: 50svh;
    left: var(--content-rail-start);
    transform: translateY(-50%);
  }

  @media (width < 40rem) {
    .library-main {
      min-height: 100dvh;
      padding-top: 0;
    }

    .library-surface {
      min-height: 100dvh;
    }
  }
</style>

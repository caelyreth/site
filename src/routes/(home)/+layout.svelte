<script lang="ts">
  import { page } from '$app/state'
  import Article from '$lib/components/layout/article.svelte'
  import Backdrop from '$lib/components/layout/backdrop.svelte'
  import Footer from '$lib/components/layout/footer.svelte'
  import {
    set_page_chrome,
    type PageChrome,
  } from '$lib/components/layout/page-chrome'
  import Stage from '$lib/components/layout/stage.svelte'
  import Header from '$lib/components/navigation/header.svelte'
  import { SKY_FIELD_FADE_RATE } from '$lib/presentation/observatory/sky/config'
  import Observatory from '$lib/presentation/observatory/view.svelte'
  import RelayFooter from '$lib/presentation/relay-footer/view.svelte'

  import type { PageData } from './$types'

  const { children } = $props()
  const data = $derived(page.data as PageData)
  const document = $derived(data.document)
  const document_toc = $derived(data.toc)
  const chrome = $state<PageChrome>({
    content_active: false,
    stage_progress: 0,
    toc: (page.data as PageData).toc,
  })

  set_page_chrome(chrome)

  $effect(() => {
    chrome.toc = document_toc
  })
</script>

<div class="home">
  <div class="scroll-chrome" style:--stage-progress={chrome.stage_progress}>
    <Backdrop />
    <Header />
  </div>
  <main id="main-content" tabindex="-1">
    <h1 class="sr-only">{document.frontmatter.title}</h1>
    <Stage
      title={document.frontmatter.title}
      defer_surface_when_covered_mobile
      surface_exit_progress={1 / SKY_FIELD_FADE_RATE}
    >
      {#snippet children(defer_surface, sky_paused)}
        <Observatory
          {defer_surface}
          description={document.frontmatter.description}
          observatory={document.frontmatter.observatory}
          {sky_paused}
        />
      {/snippet}
    </Stage>
    <Article has_footer>
      {@render children()}
    </Article>
  </main>
  <Footer>
    {#snippet children(visible)}
      <RelayFooter entries={data.footer_entries} {visible} />
    {/snippet}
  </Footer>
</div>

<style>
  .home {
    position: relative;
    z-index: 10;
    display: flex;
    min-height: 100vh;
    flex-direction: column;
  }

  main {
    position: relative;
    display: flex;
    flex: 1;
    min-height: 100vh;
    flex-direction: column;
  }
</style>

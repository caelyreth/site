<script lang="ts">
  import { page } from '$app/state'
  import Article from '$lib/components/layout/article.svelte'
  import Backdrop from '$lib/components/layout/backdrop.svelte'
  import Footer from '$lib/components/layout/footer.svelte'
  import Stage from '$lib/components/layout/stage.svelte'
  import Header from '$lib/components/navigation/header.svelte'
  import type { HomeDocument } from '$lib/content/home'
  import { SKY_FIELD_FADE_RATE } from '$lib/presentation/observatory/sky/config'
  import Observatory from '$lib/presentation/observatory/view.svelte'
  import RelayFooter from '$lib/presentation/relay-footer/view.svelte'

  interface HomePageData {
    document: HomeDocument
  }

  const { children } = $props()
  const document = $derived((page.data as HomePageData).document)
  let fallback_progress = $state(0)

  function update_stage_progress(progress: number) {
    fallback_progress = progress
  }
</script>

<div class="home">
  <div class="scroll-chrome" style:--stage-progress={fallback_progress}>
    <Backdrop />
    <Header />
  </div>
  <main>
    <Stage
      title={document.frontmatter.title}
      on_progress={update_stage_progress}
      progress={fallback_progress}
      surface_exit_progress={1 / SKY_FIELD_FADE_RATE}
    >
      {#snippet children(defer_surface, sky_paused)}
        <Observatory
          {defer_surface}
          description={document.frontmatter.description}
          {sky_paused}
        />
      {/snippet}
    </Stage>
    <div aria-hidden="true" class="mobile-stage-seam"></div>
    <Article has_footer>
      {@render children()}
    </Article>
  </main>
  <Footer>
    {#snippet children(visible)}
      <RelayFooter {visible} />
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

  .mobile-stage-seam {
    display: none;
  }

  @media (max-width: 40rem) {
    .mobile-stage-seam {
      display: block;
      height: 1px;
      background-color: var(--color-rule);
    }
  }
</style>

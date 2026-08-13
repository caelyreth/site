<script lang="ts">
  import { page } from '$app/state'
  import type { PresentationSelection } from '$lib/presentation/contract'
  import { resolve_presentation } from '$lib/presentation/registry'
  import Article from '$lib/site/article.svelte'
  import Backdrop from '$lib/site/backdrop.svelte'
  import Footer from '$lib/site/footer.svelte'
  import Header from '$lib/site/header.svelte'
  import Stage from '$lib/site/stage.svelte'

  interface HomePageData {
    presentation?: PresentationSelection
  }

  const { children } = $props()
  const presentation = $derived((page.data as HomePageData).presentation)
  const resolved_presentation = $derived(
    presentation ? resolve_presentation(presentation) : undefined,
  )
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
    {#if resolved_presentation?.stage}
      {#key page.url.pathname}
        <Stage
          component={resolved_presentation.stage.component}
          options={resolved_presentation.stage.options}
          on_progress={update_stage_progress}
          progress={fallback_progress}
        />
      {/key}
    {/if}
    <Article has_footer={resolved_presentation?.footer !== undefined}>
      {@render children()}
    </Article>
  </main>
  {#if resolved_presentation?.footer}
    {#key page.url.pathname}
      <Footer
        component={resolved_presentation.footer.component}
        options={resolved_presentation.footer.options}
      />
    {/key}
  {/if}
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

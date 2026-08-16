<script lang="ts">
  import Backdrop from '$lib/components/layout/backdrop.svelte'
  import Footer from '$lib/components/layout/footer.svelte'
  import PaperDeck from '$lib/components/layout/paper-deck.svelte'
  import Header from '$lib/components/navigation/header.svelte'
  import RelayFooter from '$lib/presentation/relay-footer/view.svelte'

  const { children } = $props()
</script>

<div class="library">
  <div class="scroll-chrome" style:--stage-progress={1}>
    <Backdrop />
    <Header />
  </div>
  <main class="library-main">
    <div class="library-surface">
      <PaperDeck edge>
        {@render children()}
      </PaperDeck>
    </div>
  </main>
  <Footer>
    {#snippet children(visible)}
      <RelayFooter {visible} />
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
</style>

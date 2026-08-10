<script lang="ts">
  import Scene from '$lib/components/observatory/scene.svelte'
  import Chrome from '$lib/components/station/chrome.svelte'
  import Content from '$lib/components/station/content.svelte'
  import Footer from '$lib/components/station/footer.svelte'
  import Header from '$lib/components/station/header.svelte'

  let fallback_progress = $state(0)

  function update_fallback_progress(progress: number) {
    fallback_progress = progress
  }
</script>

<svelte:head>
  <title>Caelyreth</title>
</svelte:head>

<div
  class="station-experience"
  style:--observatory-fallback-progress={fallback_progress}
>
  <Chrome />
  <Header />
  <main>
    <Scene on_progress={update_fallback_progress} />
    <div class="deck station-content">
      <Content />
    </div>
  </main>
  <Footer />
</div>

<style>
  @property --observatory-progress {
    syntax: '<number>';
    inherits: true;
    initial-value: 0;
  }

  .station-experience {
    --observatory-progress: var(--observatory-fallback-progress, 0);
    --observatory-opening: calc(1 - var(--observatory-progress));
    --observatory-panel-inset: calc(
      var(--observatory-frame-inset) * var(--observatory-opening)
    );
    --observatory-panel-top: calc(
      var(--header-block-size) * var(--observatory-opening)
    );
    --observatory-panel-radius: calc(
      var(--observatory-frame-radius) * var(--observatory-opening)
    );
    --observatory-panel-rule: color-mix(
      in oklab,
      var(--color-rule) calc(var(--observatory-opening) * 100%),
      transparent
    );
    --observatory-content-rule: color-mix(
      in oklab,
      var(--observatory-panel-rule),
      var(--color-rule) calc(var(--observatory-progress) * 100%)
    );
    --observatory-header-inset: calc(
      var(--observatory-frame-inset) +
        (var(--inline-gutter) - var(--observatory-frame-inset)) *
        var(--observatory-progress)
    );
    position: relative;
    z-index: 10;
    display: flex;
    min-height: 100vh;
    flex-direction: column;
  }

  @supports (animation-timeline: scroll(root block)) {
    .station-experience {
      animation: observatory-progress 1ms linear both;
      animation-range: 0 100dvh;
      animation-timeline: scroll(root block);
    }
  }

  main {
    position: relative;
    display: flex;
    flex: 1;
    flex-direction: column;
    min-height: 100vh;
  }

  .station-content {
    display: flex;
    flex: 1;
    flex-direction: column;
    width: 100%;
    margin: 0 auto;
    padding-inline: var(--inline-gutter);
  }

  @keyframes observatory-progress {
    to {
      --observatory-progress: 1;
    }
  }
</style>

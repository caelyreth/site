<script lang="ts">
  import Scene from '$lib/components/observatory/scene.svelte'

  import Chrome from './chrome.svelte'
  import Content from './content.svelte'
  import Footer from './footer.svelte'
  import Header from './header.svelte'

  let fallback_progress = $state(0)

  function update_fallback_progress(progress: number) {
    fallback_progress = progress
  }
</script>

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
    --observatory-frame-inset: clamp(0.5rem, 1.6vw, 1.25rem);
    --observatory-frame-radius: clamp(0.5rem, 1vw, 0.875rem);
    --observatory-progress: var(--observatory-fallback-progress, 0);
    --observatory-panel-opening: calc(1 - var(--observatory-progress));
    --observatory-rail-seam: 1px;
    --observatory-panel-inset: calc(
      var(--observatory-frame-inset) * var(--observatory-panel-opening)
    );
    --observatory-panel-top: calc(
      var(--header-block-size) - var(--observatory-rail-seam)
    );
    --observatory-panel-radius: calc(
      var(--observatory-frame-radius) * var(--observatory-panel-opening)
    );
    --observatory-panel-rule: color-mix(
      in oklab,
      var(--color-rule) calc(var(--observatory-panel-opening) * 100%),
      transparent
    );
    --observatory-content-rule: color-mix(
      in oklab,
      var(--observatory-panel-rule),
      var(--color-rule) calc(var(--observatory-progress) * 100%)
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
    width: 100%;
    margin: 0 auto;
    padding-inline: var(--inline-gutter);
    flex-direction: column;
  }

  @keyframes observatory-progress {
    to {
      --observatory-progress: 1;
    }
  }
</style>

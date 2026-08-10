<script lang="ts">
  import '../app.css'
  import 'virtual:uno.css'
  import Chrome from '$lib/components/station/chrome.svelte'
  import Footer from '$lib/components/station/footer.svelte'
  import Header from '$lib/components/station/header.svelte'
  import {
    set_station_state,
    type StationState,
  } from '$lib/context/station'
  import { SvelteTheme } from 'svelte-themes'

  const { children } = $props()

  const themes = ['light', 'dark', 'system'] as const
  const station = $state<StationState>({
    is_ready: false,
    scroll_progress: 0,
  })
  set_station_state(station)
</script>

<SvelteTheme attribute="class" defaultTheme="system" {themes}>
  <div
    class="shell"
    style:--observatory-live-progress={station.is_ready
      ? station.scroll_progress
      : undefined}
  >
    <Chrome />
    <Header />
    <main>
      {@render children()}
    </main>
    <Footer />
  </div>
</SvelteTheme>

<style>
  .shell {
    --observatory-progress: var(
      --observatory-live-progress,
      var(--observatory-initial-progress, 0)
    );
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

  main {
    position: relative;
    display: flex;
    flex: 1;
    flex-direction: column;
    min-height: 100vh;
  }
</style>

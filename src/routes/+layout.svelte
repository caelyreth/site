<script lang="ts">
  import '../app.css'
  import 'virtual:uno.css'
  import Chrome from '$lib/components/station/chrome.svelte'
  import Footer from '$lib/components/station/footer.svelte'
  import Header from '$lib/components/station/header.svelte'
  import { set_station_state, type StationState } from '$lib/context/station'
  import { SvelteTheme } from 'svelte-themes'

  const { children } = $props()

  const themes = ['light', 'dark', 'system'] as const
  const station = $state<StationState>({
    scroll_progress: 0,
  })
  set_station_state(station)
</script>

<SvelteTheme attribute="class" defaultTheme="system" {themes}>
  <div class="shell" style:--p={station.scroll_progress}>
    <Chrome />
    <Header />
    <main>
      <div class="deck">
        {@render children()}
      </div>
    </main>
    <Footer />
  </div>
</SvelteTheme>

<style>
  .shell {
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

  .deck {
    display: flex;
    flex: 1;
    flex-direction: column;
    width: 100%;
    margin: 0 auto;
    padding-inline: var(--inline-gutter);
    background-color: var(--color-paper);
  }
</style>

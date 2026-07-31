<script lang="ts">
  import '../app.css'
  import 'virtual:uno.css'
  import SlashBackground from '$lib/components/station/slash.svelte'
  import { SvelteTheme } from 'svelte-themes'

  const { children } = $props()

  const themes = ['light', 'dark', 'system'] as const
</script>

<SvelteTheme attribute="class" defaultTheme="system" {themes}>
  <SlashBackground />
  <main>
    <div class="deck">
      {@render children()}
    </div>
  </main>
</SvelteTheme>

<style>
  main {
    position: relative;
    display: flex;
    flex: 1;
    flex-direction: column;
    min-height: 100vh;
  }

  .deck {
    position: relative;
    display: flex;
    flex: 1;
    flex-direction: column;
    width: 100%;
    max-width: var(--frame-measure);
    margin: 0 auto;
    padding-inline: var(--inline-gutter);
    background-color: var(--color-paper);
  }

  .deck::before {
    content: '';
    position: absolute;
    inset: 0;
    pointer-events: none;
    opacity: 0.37;
    background-image: var(--noise-tile);
    background-size: 96px;
  }
</style>

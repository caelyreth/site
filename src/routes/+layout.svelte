<script lang="ts">
  import '../app.css'
  import 'virtual:uno.css'
  import Footer from '$lib/components/station/footer.svelte'
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
  <Footer />
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
    display: flex;
    flex: 1;
    flex-direction: column;
    width: 100%;
    margin: 0 auto;
    padding-inline: var(--inline-gutter);
    background-color: var(--color-paper);
  }
</style>

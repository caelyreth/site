<script lang="ts">
  import '../app.css'
  import 'virtual:uno.css'
  import { SvelteTheme } from 'svelte-themes'

  const { children } = $props()

  const themes = ['light', 'dark', 'system'] as const
</script>

<SvelteTheme attribute="class" defaultTheme="system" {themes}>
  {@render children()}
</SvelteTheme>

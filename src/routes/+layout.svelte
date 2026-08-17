<script lang="ts">
  import '../app.css'
  import 'virtual:uno.css'
  import { install_view_transitions } from '$lib/browser/view-transition'
  import PageScrollbar from '$lib/components/layout/page-scrollbar.svelte'
  import { listen_for_content_updates } from '$lib/content/hmr.client'
  import { onMount } from 'svelte'
  import { SvelteTheme } from 'svelte-themes'

  const { children } = $props()

  const themes = ['light', 'dark', 'system'] as const

  install_view_transitions()
  onMount(listen_for_content_updates)
</script>

<SvelteTheme attribute="class" defaultTheme="system" {themes}>
  {@render children()}
  <PageScrollbar />
</SvelteTheme>

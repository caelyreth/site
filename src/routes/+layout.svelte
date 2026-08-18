<script lang="ts">
  import '../app.css'
  import 'virtual:uno.css'
  import { install_view_transitions } from '$lib/browser/view-transition'
  import PageScrollbar from '$lib/components/layout/page-scrollbar.svelte'
  import { set_menu_controller } from '$lib/components/navigation/menu/controller'
  import Menu from '$lib/components/navigation/menu/menu.svelte'
  import { listen_for_content_updates } from '$lib/content/hmr.client'
  import { onMount } from 'svelte'
  import { SvelteTheme } from 'svelte-themes'

  const { children } = $props()

  const themes = ['light', 'dark', 'system'] as const
  const menu = $state({
    is_open: false,
    open: () => {},
  })

  set_menu_controller(menu)
  install_view_transitions(() => !menu.is_open)
  onMount(listen_for_content_updates)
</script>

<SvelteTheme attribute="class" defaultTheme="system" {themes}>
  <Menu />
  {@render children()}
  <PageScrollbar />
</SvelteTheme>

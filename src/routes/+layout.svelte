<script lang="ts">
  import '../app.css'
  import 'virtual:uno.css'
  import { install_view_transitions } from '$lib/browser/view-transition'
  import PageScrollbar from '$lib/components/layout/page-scrollbar.svelte'
  import { set_menu_controller } from '$lib/components/navigation/menu/controller'
  import Menu from '$lib/components/navigation/menu/menu.svelte'
  import { listen_for_content_updates } from '$lib/content/hmr.client'
  import { set_site_config } from '$lib/content/site'
  import { onMount, type Snippet } from 'svelte'
  import { SvelteTheme } from 'svelte-themes'

  import type { LayoutData } from './$types'

  interface Props {
    children: Snippet
    data: LayoutData
  }

  const { children, data }: Props = $props()

  const themes = ['light', 'dark', 'system'] as const
  const menu = $state({
    is_open: false,
    open: () => {},
  })
  const site = {
    get current() {
      return data.site
    },
  }

  set_menu_controller(menu)
  set_site_config(site)
  install_view_transitions(() => !menu.is_open)
  onMount(listen_for_content_updates)
</script>

<SvelteTheme attribute="class" defaultTheme="system" {themes}>
  <a class="skip-link" href="#main-content">跳至主要内容</a>
  <Menu />
  {@render children()}
  <PageScrollbar />
</SvelteTheme>

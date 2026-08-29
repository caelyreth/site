<script lang="ts">
  import '../app.css'
  import 'virtual:uno.css'
  import { resolve } from '$app/paths'
  import { install_view_transitions } from '$lib/browser/view-transition'
  import PageScrollbar from '$lib/components/layout/page-scrollbar.svelte'
  import Menu from '$lib/components/navigation/menu/menu.svelte'
  import { set_menu_state } from '$lib/components/navigation/menu/state'
  import { listen_for_content_updates } from '$lib/content/hmr.client'
  import { set_site_config } from '$lib/content/site'
  import { site_href } from '$lib/navigation/path'
  import { onMount, type Snippet } from 'svelte'
  import { SvelteTheme } from 'svelte-themes'

  import type { LayoutData } from './$types'

  interface Props {
    children: Snippet
    data: LayoutData
  }

  const { children, data }: Props = $props()

  const themes = ['light', 'dark', 'system'] as const
  const home_path = resolve('/')
  const menu = $state({
    is_open: false,
  })
  const site = {
    get current() {
      return data.site
    },
  }

  set_menu_state(menu)
  set_site_config(site)
  install_view_transitions((navigation) => {
    const touches_home =
      navigation.from?.url.pathname === home_path ||
      navigation.to?.url.pathname === home_path

    return !menu.is_open && !touches_home
  })
  onMount(listen_for_content_updates)
</script>

<svelte:head>
  <link
    rel="alternate"
    type="application/atom+xml"
    title={data.site.footer.atom_label}
    href={site_href(data.site.footer.atom_href)}
  />
  <link
    rel="alternate"
    type="application/rss+xml"
    title={data.site.footer.rss_label}
    href={site_href(data.site.footer.rss_href)}
  />
</svelte:head>

<SvelteTheme attribute="class" defaultTheme="system" {themes}>
  <a class="skip-link" href="#main-content">跳至主要内容</a>
  <Menu />
  {@render children()}
  <PageScrollbar />
</SvelteTheme>

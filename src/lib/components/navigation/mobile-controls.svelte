<script lang="ts">
  import { reduced_motion } from '$lib/browser/reduced-motion'
  import { scroll_activity } from '$lib/browser/scroll-activity'
  import { get_page_chrome } from '$lib/components/layout/page-chrome'
  import { onMount } from 'svelte'

  import HomeBrand from './home-brand.svelte'
  import MobileNavigationPanel from './mobile-navigation-panel.svelte'
  import MobileRail from './mobile-rail.svelte'
  import RailAction from './rail-action.svelte'
  import RailCell from './rail-cell.svelte'
  import TableOfContentsPanel from './table-of-contents-panel.svelte'
  import ThemeCycle from './theme-cycle.svelte'

  const entry_rail_delay = 640
  const rail_settle_delay = 1150
  const observatory_rail_delay = rail_settle_delay * 2
  const chrome = get_page_chrome()
  let scrolling = $state(false)
  let entry_rail_ready = $state(false)
  let active_panel = $state<'navigation' | 'toc'>('navigation')
  let observatory_rail_expanded = $state(false)
  let rail_panel_expanded = $state(false)
  const rail_visible = $derived(chrome.content_active || entry_rail_ready)
  const observatory_rail_compact = $derived(
    !chrome.content_active && !observatory_rail_expanded,
  )
  const rail_collapsed = $derived(scrolling || observatory_rail_compact)
  const compact_control = $derived(
    chrome.content_active ? 'return' : 'navigation',
  )
  const has_toc = $derived(chrome.toc.length > 0)
  const navigation_open = $derived(
    rail_panel_expanded && active_panel === 'navigation',
  )
  const toc_open = $derived(rail_panel_expanded && active_panel === 'toc')
  const navigation_icon = $derived(
    rail_collapsed ? 'i-ri-expand-diagonal-s-line' : 'i-ri-compass-line',
  )
  const navigation_label = $derived(
    observatory_rail_compact
      ? '展开导航栏'
      : navigation_open
        ? '关闭站点导航'
        : '打开站点导航',
  )
  const toc_icon = $derived(
    toc_open ? 'i-ri-close-line' : 'i-ri-list-unordered',
  )
  const toc_label = $derived(toc_open ? '关闭目录' : '打开目录')

  const observe_scroll = scroll_activity({
    idle_delay: rail_settle_delay,
    on_activity(active) {
      scrolling = active
      if (active) observatory_rail_expanded = false
    },
  })

  $effect(() => {
    if (!observatory_rail_expanded || rail_panel_expanded) return

    const timer = window.setTimeout(() => {
      observatory_rail_expanded = false
    }, observatory_rail_delay)

    return () => window.clearTimeout(timer)
  })

  function scroll_to_top() {
    window.scrollTo({ top: 0, behavior: 'auto' })
  }

  function toggle_rail_panel(
    panel: 'navigation' | 'toc',
    toggle: () => void,
  ) {
    if (active_panel !== panel) {
      active_panel = panel
      if (!rail_panel_expanded) toggle()
      return
    }

    toggle()
  }

  function toggle_navigation(toggle: () => void) {
    if (observatory_rail_compact) {
      observatory_rail_expanded = true
      return
    }
    toggle_rail_panel('navigation', toggle)
  }

  function toggle_toc(toggle: () => void) {
    toggle_rail_panel('toc', toggle)
  }

  onMount(() => {
    if (reduced_motion.current) {
      entry_rail_ready = true
      return
    }

    const timer = window.setTimeout(() => {
      entry_rail_ready = true
    }, entry_rail_delay)

    return () => window.clearTimeout(timer)
  })
</script>

{#snippet panel(close: () => void)}
  {#if active_panel === 'toc' && has_toc}
    <TableOfContentsPanel entries={chrome.toc} on_close={close} />
  {:else}
    <MobileNavigationPanel on_close={close} />
  {/if}
{/snippet}

<div {@attach observe_scroll} class="mobile-controls">
  <MobileRail
    visible={rail_visible}
    collapsed={rail_collapsed}
    cells={has_toc ? 5 : 4}
    {compact_control}
    bind:expanded={rail_panel_expanded}
    {panel}
  >
    {#snippet children(toggle_panel, panel_id)}
      <RailCell>
        <HomeBrand />
      </RailCell>

      <RailCell
        compact_control
        control="navigation"
        priority={compact_control === 'navigation'
          ? 'primary'
          : 'secondary'}
      >
        <RailAction
          controls={panel_id}
          expanded={navigation_open}
          icon={navigation_icon}
          label={navigation_label}
          on_activate={() => toggle_navigation(toggle_panel)}
        />
      </RailCell>

      {#if has_toc}
        <RailCell>
          <RailAction
            controls={panel_id}
            expanded={toc_open}
            icon={toc_icon}
            label={toc_label}
            on_activate={() => toggle_toc(toggle_panel)}
          />
        </RailCell>
      {/if}

      <RailCell>
        <ThemeCycle />
      </RailCell>

      <RailCell
        compact_control
        control="return"
        priority={compact_control === 'return' ? 'primary' : 'secondary'}
      >
        <RailAction
          icon="i-ri-arrow-up-line"
          label="返回顶部"
          on_activate={scroll_to_top}
        />
      </RailCell>
    {/snippet}
  </MobileRail>
</div>

<style>
  .mobile-controls {
    --header-ink: var(--color-text);
    display: contents;
    color: var(--color-text);
  }
</style>

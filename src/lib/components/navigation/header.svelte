<script lang="ts">
  import { goto } from '$app/navigation'
  import { resolve } from '$app/paths'
  import { page } from '$app/state'
  import { reduced_motion } from '$lib/browser/reduced-motion'
  import { scroll_activity } from '$lib/browser/scroll-activity'
  import { get_page_chrome } from '$lib/components/layout/page-chrome'
  import { onMount, tick } from 'svelte'

  import Brand from './header/brand.svelte'
  import MenuTrigger from './header/menu-trigger.svelte'
  import { get_menu_controller } from './menu/controller'
  import MobileNavigationPanel from './mobile-navigation-panel.svelte'
  import MobileRail from './mobile-rail.svelte'
  import RailCell from './rail-cell.svelte'
  import TableOfContentsPanel from './table-of-contents-panel.svelte'
  import ThemeCycle from './theme-cycle.svelte'

  const home_path = resolve('/')
  const chrome = get_page_chrome()
  const menu = get_menu_controller()
  const entry_rail_delay = 640
  const rail_settle_delay = 1150
  const observatory_rail_delay = rail_settle_delay * 2
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
  const mobile_menu_icon = $derived(
    rail_collapsed ? 'i-ri-expand-diagonal-s-line' : 'i-ri-compass-line',
  )
  const has_toc = $derived(chrome.toc.length > 0)

  const observe_scroll = scroll_activity({
    idle_delay: rail_settle_delay,
    on_activity(active) {
      scrolling = active
      if (active) collapse_observatory_rail()
    },
  })

  $effect(() => {
    if (!observatory_rail_expanded || rail_panel_expanded) return

    const timer = window.setTimeout(() => {
      observatory_rail_expanded = false
    }, observatory_rail_delay)

    return () => window.clearTimeout(timer)
  })

  function has_navigation_modifier(event: MouseEvent) {
    return event.metaKey || event.altKey || event.ctrlKey || event.shiftKey
  }

  function scroll_to_top() {
    window.scrollTo({ top: 0, behavior: 'auto' })
  }

  async function return_home() {
    if (page.url.pathname !== home_path) {
      await goto(home_path, { keepFocus: true, noScroll: true })
      await tick()
    }

    scroll_to_top()
  }

  function handle_brand_click(event: MouseEvent) {
    if (event.defaultPrevented || event.button !== 0) return
    if (has_navigation_modifier(event)) return
    event.preventDefault()
    void return_home()
  }

  function handle_return_click() {
    scroll_to_top()
  }

  function expand_observatory_rail() {
    observatory_rail_expanded = true
  }

  function collapse_observatory_rail() {
    observatory_rail_expanded = false
  }

  function toggle_rail_panel(
    panel: 'navigation' | 'toc',
    toggle: () => void,
    expanded: boolean,
  ) {
    if (active_panel !== panel) {
      active_panel = panel
      if (!expanded) toggle()
      return
    }

    toggle()
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

{#snippet mobile_panel(close_panel: () => void)}
  {#if active_panel === 'toc' && has_toc}
    <TableOfContentsPanel entries={chrome.toc} on_close={close_panel} />
  {:else}
    <MobileNavigationPanel on_close={close_panel} />
  {/if}
{/snippet}

<div
  {@attach observe_scroll}
  class="site-controls"
  data-content-active={chrome.content_active}
>
  <header class="header">
    <div class="inner">
      <Brand href={home_path} on_activate={handle_brand_click} />
      <MenuTrigger is_open={menu.is_open} on_open={menu.open} />
    </div>
  </header>

  <div
    aria-hidden={!chrome.content_active}
    class="desktop-actions"
    inert={!chrome.content_active}
    role="group"
    aria-label="页面工具"
  >
    <RailCell>
      <ThemeCycle />
    </RailCell>
    <RailCell>
      <button
        type="button"
        class="action return-button"
        aria-label="返回顶部"
        title="返回顶部"
        onclick={handle_return_click}
      >
        <span class="i-ri-arrow-up-line" aria-hidden="true"></span>
      </button>
    </RailCell>
  </div>

  <MobileRail
    visible={rail_visible}
    collapsed={rail_collapsed}
    cells={has_toc ? 5 : 4}
    {compact_control}
    bind:expanded={rail_panel_expanded}
    panel={mobile_panel}
  >
    {#snippet children(toggle_panel, expanded, panel_id)}
      <RailCell>
        <div class="mobile-brand">
          <Brand href={home_path} on_activate={handle_brand_click} />
        </div>
      </RailCell>

      <RailCell
        compact_control
        control="navigation"
        priority={compact_control === 'navigation'
          ? 'primary'
          : 'secondary'}
      >
        <div class="mobile-menu">
          <button
            type="button"
            class="action mobile-nav-toggle"
            aria-controls={panel_id}
            aria-expanded={expanded && active_panel === 'navigation'}
            aria-label={observatory_rail_compact
              ? '展开导航栏'
              : expanded && active_panel === 'navigation'
                ? '关闭站点导航'
                : '打开站点导航'}
            title={observatory_rail_compact
              ? '展开导航栏'
              : expanded && active_panel === 'navigation'
                ? '关闭站点导航'
                : '打开站点导航'}
            onclick={() =>
              observatory_rail_compact
                ? expand_observatory_rail()
                : toggle_rail_panel('navigation', toggle_panel, expanded)}
          >
            <span class={mobile_menu_icon} aria-hidden="true"></span>
          </button>
        </div>
      </RailCell>

      {#if has_toc}
        <RailCell>
          <div class="mobile-index">
            <button
              type="button"
              class="index-button"
              aria-controls={panel_id}
              aria-expanded={expanded && active_panel === 'toc'}
              aria-label={expanded && active_panel === 'toc'
                ? '关闭目录'
                : '打开目录'}
              title={expanded && active_panel === 'toc'
                ? '关闭目录'
                : '打开目录'}
              onclick={() =>
                toggle_rail_panel('toc', toggle_panel, expanded)}
            >
              <span
                class={expanded && active_panel === 'toc'
                  ? 'i-ri-close-line'
                  : 'i-ri-list-unordered'}
                aria-hidden="true"
              ></span>
            </button>
          </div>
        </RailCell>
      {/if}

      <RailCell>
        <div class="mobile-theme">
          <ThemeCycle />
        </div>
      </RailCell>

      <RailCell
        compact_control
        control="return"
        priority={compact_control === 'return' ? 'primary' : 'secondary'}
      >
        <div class="mobile-actions">
          <button
            type="button"
            class="action return-button"
            aria-label="返回顶部"
            title="返回顶部"
            onclick={handle_return_click}
          >
            <span class="i-ri-arrow-up-line" aria-hidden="true"></span>
          </button>
        </div>
      </RailCell>
    {/snippet}
  </MobileRail>
</div>

<style>
  .site-controls {
    display: contents;
  }

  .header {
    --header-ink: color-mix(
      in oklab,
      var(--color-stage-ink) calc((1 - var(--stage-progress)) * 100%),
      var(--color-text) calc(var(--stage-progress) * 100%)
    );
    --header-rule: var(--color-boundary);
    --header-surface: color-mix(
      in oklab,
      transparent,
      var(--color-paper-prime) calc(var(--stage-progress) * 100%)
    );
    --header-latch-rule: color-mix(
      in oklab,
      transparent,
      var(--color-guide) calc(var(--stage-progress) * 100%)
    );
    --header-latch-hover: color-mix(
      in oklab,
      transparent,
      var(--header-ink) calc(var(--stage-progress) * 6%)
    );
    position: fixed;
    top: 0;
    left: 50%;
    z-index: 50;
    box-sizing: border-box;
    width: min(100%, var(--frame-measure));
    border-inline: 1px solid var(--header-latch-rule);
    color: var(--header-ink);
    background-color: var(--header-surface);
    background-clip: padding-box;
    transform: translateX(-50%);
  }

  @supports (animation-timeline: scroll(root block)) {
    .header {
      animation: stage-progress 1ms linear both;
      animation-range: 0 var(--chrome-transition-span);
      animation-timeline: scroll(root block);
    }
  }

  .header::after {
    position: absolute;
    right: 0;
    bottom: 0;
    left: 0;
    height: 1px;
    pointer-events: none;
    content: '';
    background-color: var(--header-rule);
  }

  .inner {
    box-sizing: border-box;
    display: flex;
    width: 100%;
    height: var(--header-block-size);
    padding-inline-start: var(--inline-gutter);
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
  }

  .action {
    box-sizing: border-box;
    display: grid;
    width: 2.75rem;
    height: 2.75rem;
    padding: 0;
    cursor: pointer;
    border: 0;
    color: inherit;
    background-color: transparent;
    place-items: center;
    transition:
      background-color var(--dur-micro) var(--ease-out),
      color var(--dur-micro) var(--ease-out),
      opacity var(--dur-short) var(--ease-out);
  }

  .return-button .i-ri-arrow-up-line,
  .mobile-nav-toggle .i-ri-compass-line,
  .mobile-nav-toggle .i-ri-expand-diagonal-s-line,
  .index-button span {
    width: 1rem;
    height: 1rem;
    flex: none;
    opacity: 0.72;
    transition: opacity var(--dur-micro) var(--ease-out);
  }

  @media (hover: hover) {
    .action:hover,
    .index-button:hover {
      color: var(--color-paper-prime);
      background-color: var(--color-text);
    }

    .action:hover .i-ri-arrow-up-line,
    .action:hover .i-ri-compass-line,
    .action:hover .i-ri-expand-diagonal-s-line,
    .index-button:hover span {
      opacity: 1;
    }

    .action:active,
    .index-button:active {
      color: var(--color-paper-prime);
      background-color: var(--color-text);
    }
  }

  .action:focus-visible,
  .index-button:focus-visible {
    outline: 2px solid var(--color-focus);
    outline-offset: -2px;
  }

  .desktop-actions {
    display: none;
    box-sizing: border-box;
    color: var(--color-text);
    background-color: var(--color-paper-prime);
  }

  .mobile-brand,
  .mobile-menu,
  .mobile-index,
  .mobile-theme,
  .mobile-actions {
    color: var(--color-text);
  }

  .index-button {
    display: grid;
    width: 100%;
    height: 100%;
    padding: 0;
    cursor: pointer;
    border: 0;
    color: inherit;
    background: transparent;
    place-items: center;
    transition:
      background-color var(--dur-micro) var(--ease-out),
      color var(--dur-micro) var(--ease-out);
  }

  @media (width >= 40rem) {
    .desktop-actions {
      position: fixed;
      right: var(--inline-gutter);
      bottom: clamp(1.25rem, 4vw, 3rem);
      z-index: 49;
      display: flex;
      width: 2.75rem;
      border: 1px solid var(--color-boundary);
      flex-direction: column;
      transition:
        opacity var(--dur-short) var(--ease-out),
        transform var(--dur-short) var(--ease-out);
    }

    .desktop-actions > :global(.rail-cell) {
      display: grid;
      width: 100%;
      height: 2.75rem;
      place-items: center;
    }

    .desktop-actions > :global(.rail-cell + .rail-cell) {
      border-top: 1px solid var(--color-boundary);
    }

    .desktop-actions .action {
      width: 100%;
      height: 100%;
    }

    .site-controls[data-content-active='false'] .desktop-actions {
      pointer-events: none;
      opacity: 0;
      transform: translateY(0.5rem);
    }
  }

  @media (width >= 60rem) {
    .desktop-actions {
      right: auto;
      left: var(--content-rail-start);
    }
  }

  @media (width < 40rem) {
    .header,
    .desktop-actions {
      display: none;
    }

    .mobile-brand,
    .mobile-menu,
    .mobile-index,
    .mobile-theme,
    .mobile-actions {
      display: grid;
      width: 100%;
      height: 100%;
      min-width: 0;
      place-items: center;
    }

    .mobile-menu .action,
    .mobile-theme :global(.theme-cycle),
    .mobile-actions .action {
      width: 100%;
      height: 100%;
    }

    .mobile-brand :global(.brand),
    .mobile-menu .action,
    .mobile-index .index-button,
    .mobile-theme :global(.theme-cycle),
    .mobile-actions .action {
      -webkit-tap-highlight-color: transparent;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .action,
    .index-button,
    .return-button .i-ri-arrow-up-line,
    .mobile-nav-toggle .i-ri-compass-line,
    .mobile-nav-toggle .i-ri-expand-diagonal-s-line,
    .index-button span {
      transition-duration: 1ms;
    }
  }
</style>

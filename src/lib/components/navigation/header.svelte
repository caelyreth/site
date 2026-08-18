<script lang="ts">
  import { goto } from '$app/navigation'
  import { base } from '$app/paths'
  import { page } from '$app/state'
  import { reduced_motion } from '$lib/browser/reduced-motion'
  import { scroll_activity } from '$lib/browser/scroll-activity'
  import { get_page_chrome } from '$lib/components/layout/page-chrome'
  import { onMount, tick } from 'svelte'

  import Brand from './header/brand.svelte'
  import MenuTrigger from './header/menu-trigger.svelte'
  import { get_menu_controller } from './menu/controller'
  import MobileRail from './mobile-rail.svelte'
  import TableOfContentsPanel from './table-of-contents-panel.svelte'

  const home_path = base || '/'
  const chrome = get_page_chrome()
  const menu = get_menu_controller()
  const entry_rail_delay = 640
  let scrolling = $state(false)
  let entry_rail_ready = $state(false)
  const rail_visible = $derived(chrome.content_active || entry_rail_ready)
  const rail_collapsed = $derived(!chrome.content_active || scrolling)

  const observe_scroll = scroll_activity({
    idle_delay: 1150,
    on_activity(active) {
      scrolling = active
    },
  })
  function has_navigation_modifier(event: MouseEvent) {
    return event.metaKey || event.altKey || event.ctrlKey || event.shiftKey
  }

  async function return_to_top() {
    if (page.url.pathname !== home_path) {
      await goto(home_path, { keepFocus: true, noScroll: true })
      await tick()
    }

    window.scrollTo({ top: 0, behavior: 'auto' })
  }

  function handle_brand_click(event: MouseEvent) {
    if (event.defaultPrevented || event.button !== 0) return
    if (has_navigation_modifier(event)) return
    event.preventDefault()
    void return_to_top()
  }

  function handle_return_click() {
    void return_to_top()
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

{#snippet index_panel(close_panel: () => void)}
  <TableOfContentsPanel entries={chrome.toc} on_close={close_panel} />
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

  <div class="desktop-actions" role="group" aria-label="页面操作">
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

  <MobileRail
    visible={rail_visible}
    collapsed={rail_collapsed}
    cells={chrome.toc.length ? 4 : 3}
    panel={chrome.toc.length ? index_panel : undefined}
  >
    {#snippet children(toggle_panel, expanded, has_panel, panel_id)}
      <div
        class="mobile-brand"
        data-rail-cell
        data-rail-priority="secondary"
      >
        <Brand href={home_path} on_activate={handle_brand_click} />
      </div>

      <div
        class="mobile-menu"
        data-rail-cell
        data-rail-priority={chrome.content_active ? 'secondary' : 'primary'}
      >
        <MenuTrigger is_open={menu.is_open} on_open={menu.open} />
      </div>

      {#if has_panel}
        <div
          class="mobile-index"
          data-rail-cell
          data-rail-priority="secondary"
        >
          <button
            type="button"
            class="index-button"
            aria-controls={panel_id}
            aria-expanded={expanded}
            aria-label={expanded ? '关闭目录' : '打开目录'}
            title={expanded ? '关闭目录' : '打开目录'}
            onclick={toggle_panel}
          >
            <span
              class={expanded ? 'i-ri-close-line' : 'i-ri-list-unordered'}
              aria-hidden="true"
            ></span>
          </button>
        </div>
      {/if}

      <div
        class="mobile-actions"
        data-rail-cell
        data-rail-priority={chrome.content_active ? 'primary' : 'secondary'}
      >
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

  @media (width >= 60rem) {
    .desktop-actions {
      position: fixed;
      left: var(--content-rail-start);
      bottom: clamp(1.25rem, 4vw, 3rem);
      z-index: 49;
      display: flex;
      border: 1px solid var(--color-boundary);
      transition:
        opacity var(--dur-short) var(--ease-out),
        transform var(--dur-short) var(--ease-out);
    }

    .site-controls[data-content-active='false'] .desktop-actions {
      pointer-events: none;
      opacity: 0;
      transform: translateY(0.5rem);
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
    .mobile-actions {
      display: grid;
      min-width: 0;
      place-items: center;
    }

    .mobile-actions .action {
      width: 100%;
      height: 100%;
    }

    .mobile-brand :global(.brand),
    .mobile-menu :global(.menu-trigger),
    .mobile-index .index-button,
    .mobile-actions .action {
      -webkit-tap-highlight-color: transparent;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .action,
    .index-button,
    .return-button .i-ri-arrow-up-line,
    .index-button span {
      transition-duration: 1ms;
    }
  }
</style>

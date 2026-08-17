<script lang="ts">
  import { goto } from '$app/navigation'
  import { base } from '$app/paths'
  import { page } from '$app/state'
  import { scroll_activity } from '$lib/browser/scroll-activity'
  import { scroll_to_top } from '$lib/browser/scroll-to-top'
  import { observe_viewport_threshold } from '$lib/browser/viewport-threshold'
  import { tick } from 'svelte'

  import Brand from './header/brand.svelte'
  import MenuTrigger from './header/menu-trigger.svelte'
  import Menu from './menu/menu.svelte'

  const home_path = base || '/'
  const content_reveal_ratio = 0.6
  let content_active = $state(false)
  let scrolling = $state(false)

  const observe_scroll = scroll_activity({
    idle_delay: 1400,
    on_activity(active) {
      scrolling = active
    },
  })
  const observe_content = observe_viewport_threshold(
    'content',
    content_reveal_ratio,
    (active) => {
      content_active = active
    },
  )

  function has_navigation_modifier(event: MouseEvent) {
    return event.metaKey || event.altKey || event.ctrlKey || event.shiftKey
  }

  async function return_to_top() {
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
    void return_to_top()
  }

  function handle_return_click() {
    void return_to_top()
  }
</script>

<div
  {@attach observe_scroll}
  {@attach observe_content}
  class="site-controls"
  data-content-active={content_active}
  data-scrolling={scrolling}
>
  <header class="header">
    <div class="inner">
      <Brand href={home_path} on_activate={handle_brand_click} />
      <div class="menu-slot">
        <Menu>
          {#snippet children(open_menu, menu_open)}
            <MenuTrigger is_open={menu_open} on_open={open_menu} />
          {/snippet}
        </Menu>
      </div>
    </div>
  </header>

  <div class="actions" role="group" aria-label="Page actions">
    <button
      type="button"
      class="action return-button"
      aria-label="Return to top"
      title="Return to top"
      onclick={handle_return_click}
    >
      <span class="i-ri-arrow-up-line" aria-hidden="true"></span>
    </button>
  </div>
</div>

<style>
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
    padding-inline: var(--inline-gutter);
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
  }

  .menu-slot {
    display: inline-flex;
    min-width: 0;
    align-items: center;
  }

  .menu-slot {
    margin-right: calc(-1 * var(--inline-gutter));
  }

  .action span {
    flex: none;
  }

  .return-button .i-ri-arrow-up-line {
    width: 1rem;
    height: 1rem;
    opacity: 0.72;
    transition: opacity var(--dur-micro) var(--ease-out);
  }

  @media (hover: hover) {
    .return-button:hover .i-ri-arrow-up-line {
      opacity: 1;
    }
  }

  .action:focus-visible {
    outline: 2px solid var(--color-focus);
    outline-offset: -2px;
  }

  .actions {
    display: none;
  }

  .action {
    box-sizing: border-box;
    display: grid;
    width: 2.75rem;
    height: 2.75rem;
    padding: 0;
    cursor: pointer;
    border: 1px solid var(--color-boundary);
    color: var(--color-text);
    background-color: var(--color-paper-prime);
    place-items: center;
    transition:
      border-radius var(--dur-short) var(--ease-out),
      background-color var(--dur-micro) var(--ease-out),
      color var(--dur-micro) var(--ease-out),
      opacity var(--dur-short) var(--ease-out);
  }

  @media (hover: hover) {
    .action:hover {
      color: var(--color-paper-prime);
      background-color: var(--color-text);
    }
  }

  .action:active {
    color: var(--color-paper-prime);
    background-color: var(--color-text);
  }

  @media (min-width: 60rem) {
    .actions {
      position: fixed;
      left: calc(50% + var(--half-measure) + var(--content-rail-gap));
      bottom: clamp(1.25rem, 4vw, 3rem);
      z-index: 49;
      display: flex;
      transition:
        opacity var(--dur-short) var(--ease-out),
        transform var(--dur-short) var(--ease-out);
    }

    .site-controls[data-content-active='false'] .actions {
      pointer-events: none;
      opacity: 0;
      transform: translateY(0.5rem);
    }
  }

  @media (max-width: 40rem) {
    .site-controls {
      --mobile-control-size: 2.75rem;
      --control-block-size: var(--mobile-control-size);
      --mobile-control-edge: max(0.75rem, env(safe-area-inset-right));
      --dur-rail-collapse: 384ms;
      --dur-rail-expand: 520ms;
      --ease-rail-collapse: var(--ease-in-out);
      --ease-rail-expand: cubic-bezier(0.22, 1.28, 0.36, 1);
      --mobile-shell-width: min(
        8.5rem,
        calc(
          100vw - var(--mobile-control-size) -
            max(
              1.5rem,
              env(safe-area-inset-left) + env(safe-area-inset-right)
            )
        )
      );
      --mobile-rail-width: calc(
        var(--mobile-shell-width) + var(--control-block-size)
      );
      position: fixed;
      top: auto;
      left: 50%;
      bottom: max(0.75rem, env(safe-area-inset-bottom));
      z-index: 50;
      display: flex;
      width: var(--mobile-rail-width);
      height: var(--control-block-size);
      opacity: 0;
      pointer-events: none;
      transform: translateX(calc(50vw + var(--control-block-size)));
      transition:
        transform var(--dur-rail-expand) var(--ease-rail-expand),
        opacity var(--dur-short) var(--ease-out);
    }

    .header {
      --header-ink: var(--color-text);
      --header-latch-rule: var(--color-guide);
      position: absolute;
      top: 0;
      left: 0;
      z-index: auto;
      width: var(--mobile-shell-width);
      height: var(--control-block-size);
      min-width: 0;
      overflow: clip;
      border: 1px solid var(--color-boundary);
      border-inline-end: 0;
      border-radius: 0.25rem 0 0 0.25rem;
      background-color: var(--color-paper-prime);
      background-clip: padding-box;
      opacity: 1;
      pointer-events: auto;
      transform: none;
      transition:
        width var(--dur-rail-expand) var(--ease-rail-expand),
        opacity var(--dur-rail-expand) var(--ease-rail-expand);
      animation: none;
    }

    .header::after {
      display: none;
    }

    .inner {
      width: 100%;
      height: 100%;
      padding-inline: 0.625rem;
      gap: 0.5rem;
    }

    .menu-slot {
      margin-right: 0;
    }

    .actions {
      position: absolute;
      top: 0;
      right: 0;
      display: flex;
      height: var(--control-block-size);
      pointer-events: auto;
    }

    .action {
      width: var(--control-block-size);
      height: var(--control-block-size);
      border-radius: 0 0.25rem 0.25rem 0;
      transition-duration:
        var(--dur-rail-expand), var(--dur-micro), var(--dur-micro),
        var(--dur-micro);
      transition-timing-function:
        var(--ease-rail-expand), var(--ease-out), var(--ease-out),
        var(--ease-out);
    }

    .site-controls[data-content-active='false'] {
      pointer-events: none;
      opacity: 0;
    }

    .site-controls[data-content-active='true'][data-scrolling='false'] {
      opacity: 1;
      transform: translateX(-50%);
    }

    .site-controls[data-content-active='true'][data-scrolling='true'] {
      transform: translateX(calc(50vw - var(--mobile-control-edge) - 100%));
      opacity: 1;
      transition:
        transform var(--dur-rail-collapse) var(--ease-rail-collapse),
        opacity var(--dur-short) var(--ease-out);
    }

    .site-controls[data-content-active='true'][data-scrolling='true']
      .header {
      width: 0;
      opacity: 0;
      pointer-events: none;
      transition:
        width var(--dur-rail-collapse) var(--ease-rail-collapse),
        opacity var(--dur-micro) var(--ease-out);
    }

    .site-controls[data-content-active='true'][data-scrolling='true']
      .action:first-child {
      border-radius: 0.25rem;
      transition-duration:
        var(--dur-short), var(--dur-micro), var(--dur-micro),
        var(--dur-micro);
      transition-timing-function:
        var(--ease-out), var(--ease-out), var(--ease-out), var(--ease-out);
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .header,
    .inner,
    .actions,
    .action,
    .site-controls {
      transition-duration: 1ms;
    }
  }
</style>

<script lang="ts">
  import DesktopActions from './desktop-actions.svelte'
  import MenuTrigger from './header/menu-trigger.svelte'
  import HomeBrand from './home-brand.svelte'
  import { get_menu_state } from './menu/state'
  import MobileControls from './mobile-controls.svelte'

  const menu = get_menu_state()
</script>

<header class="header">
  <div class="inner">
    <HomeBrand />
    <MenuTrigger
      is_open={menu.is_open}
      on_open={() => (menu.is_open = true)}
    />
  </div>
</header>

<DesktopActions />
<MobileControls />

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
    padding-inline-start: var(--inline-gutter);
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
  }

  @media (width < 40rem) {
    .header {
      display: none;
    }
  }
</style>

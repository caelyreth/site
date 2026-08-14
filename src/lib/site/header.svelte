<script lang="ts">
  import { base } from '$app/paths'

  import Menu from './menu/menu.svelte'

  const home_path = base || '/'
</script>

<header class="header">
  <div class="inner">
    <a href={home_path} class="brand">
      <svg
        aria-hidden="true"
        class="brand-mark"
        viewBox="0 0 42 24"
        fill="none"
        preserveAspectRatio="none"
      >
        <rect x="3.75" y="2" width="7.5" height="20" fill="currentColor" />
        <rect x="13.25" y="2" width="12" height="20" fill="currentColor" />
        <rect x="27.25" y="2" width="6" height="20" fill="currentColor" />
        <rect x="35.25" y="2" width="3" height="20" fill="currentColor" />
      </svg>
      <span class="brand-name font-serif">Caelyreth</span>
    </a>
    <div class="menu-slot">
      <Menu />
    </div>
  </div>
</header>

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
      var(--color-boundary) calc(var(--stage-progress) * 100%)
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

  @media (max-width: 40rem) {
    .header {
      --header-ink: var(--color-text);
      --header-surface: var(--color-paper-prime);
      --header-latch-rule: var(--color-boundary);
      animation: none;
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
    display: flex;
    width: 100%;
    height: var(--header-block-size);
    padding-inline: var(--inline-gutter);
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
  }

  .brand,
  .menu-slot {
    display: inline-flex;
    min-width: 0;
    align-items: center;
  }

  .brand {
    gap: 0.75rem;
    color: var(--header-ink);
    line-height: 1;
    text-decoration: none;
  }

  .brand:hover {
    color: var(--header-ink);
  }

  .brand-mark {
    display: block;
    width: 3rem;
    height: 1.5rem;
    flex: none;
  }

  .brand-name {
    font-size: 1rem;
    font-weight: 700;
    line-height: 1;
  }

  .menu-slot {
    margin-right: calc(-1 * var(--inline-gutter));
  }

  @media (max-width: 40rem) {
    .header {
      --header-compact-gutter: 0.875rem;
      --header-menu-optical-offset: 0.75rem;

      border-inline: 0;
      background-clip: border-box;
    }

    .inner {
      padding-inline: var(--header-compact-gutter);
    }

    .menu-slot {
      margin-right: calc(-1 * var(--header-menu-optical-offset));
    }
  }

  @media (max-width: 24rem) {
    .header {
      --header-compact-gutter: 0.75rem;
      --header-menu-optical-offset: 0.625rem;
    }

    .inner {
      gap: 0.625rem;
    }

    .brand {
      gap: 0.625rem;
    }

    .brand-mark {
      width: 2.5rem;
      height: 1.25rem;
    }
  }

  @media (max-width: 20rem) {
    .brand-name {
      display: none;
    }
  }
</style>

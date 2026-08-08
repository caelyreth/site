<script lang="ts">
  import { base } from '$app/paths'

  import Menu from './menu.svelte'

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
    <div class="actions">
      <span class="sol">SOL ---</span>
      <Menu />
    </div>
  </div>
</header>

<style>
  .header {
    --opening-ink: var(--color-ink);
    --opening-muted: var(--color-muted);
    --header-ink: color-mix(
      in oklab,
      var(--opening-ink),
      var(--color-ink) calc(var(--p, 0) * 100%)
    );
    --header-muted: color-mix(
      in oklab,
      var(--opening-muted),
      var(--color-muted) calc(var(--p, 0) * 100%)
    );
    --header-rule: color-mix(
      in oklab,
      transparent,
      var(--color-rule) calc(var(--p, 0) * 100%)
    );
    position: fixed;
    top: 0;
    left: 50%;
    z-index: 50;
    width: 100%;
    max-width: calc(
      var(--frame-measure) + (100vw - var(--frame-measure)) *
        (1 - var(--p, 0))
    );
    border-bottom: 1px solid var(--header-rule);
    color: var(--header-ink);
    background-color: color-mix(
      in oklab,
      transparent,
      var(--color-paper) calc(var(--p, 0) * 100%)
    );
    transform: translateX(-50%);
  }

  .header::before,
  .header::after {
    position: absolute;
    top: 0;
    bottom: 0;
    width: 1px;
    pointer-events: none;
    content: '';
    background-color: var(--header-rule);
  }

  .header::before {
    left: 0;
  }

  .header::after {
    right: 0;
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
  .actions {
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

  .actions {
    gap: 1.25rem;
  }

  .sol {
    color: var(--header-muted);
    font-size: 0.625rem;
    font-variant-numeric: tabular-nums;
    line-height: 1.35;
  }

  @media (max-width: 38rem) {
    .sol {
      display: none;
    }
  }
</style>

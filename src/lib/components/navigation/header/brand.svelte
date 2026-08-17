<script lang="ts">
  interface Props {
    href: string
    on_activate: (event: MouseEvent) => void
  }

  const { href, on_activate }: Props = $props()
</script>

<a {href} class="brand" onclick={on_activate} title="Return to top">
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

<style>
  .brand {
    display: inline-flex;
    min-width: 0;
    gap: 0.75rem;
    color: var(--header-ink);
    line-height: 1;
    text-decoration: none;
    align-items: center;
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

  .brand:focus-visible {
    outline: 2px solid var(--color-focus);
    outline-offset: -2px;
  }

  @media (width < 40rem) {
    .brand {
      min-width: 0;
      gap: 0;
      overflow: hidden;
      white-space: nowrap;
    }

    .brand-mark {
      width: 2rem;
      height: 1rem;
    }

    .brand-name {
      display: none;
    }
  }
</style>

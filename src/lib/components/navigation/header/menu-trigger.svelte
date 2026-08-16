<script lang="ts">
  interface Props {
    is_open: boolean
    on_open: () => void
  }

  const { is_open, on_open }: Props = $props()
</script>

<button
  type="button"
  class="menu-trigger"
  aria-controls="site-menu"
  aria-expanded={is_open}
  aria-haspopup="dialog"
  aria-label={is_open ? 'Close menu' : 'Open menu'}
  title={is_open ? 'Close menu' : 'Open menu'}
  onclick={on_open}
>
  <span class="label">Index</span>
  <span class="i-ri-menu-line" aria-hidden="true"></span>
</button>

<style>
  .menu-trigger {
    position: relative;
    display: inline-flex;
    min-width: 4.75rem;
    height: var(--header-block-size);
    flex: none;
    padding-inline: 0.75rem;
    cursor: pointer;
    border: 0;
    border-inline-start: 1px solid var(--header-latch-rule);
    color: var(--header-ink);
    background-color: transparent;
    align-items: center;
    gap: 0.5rem;
    justify-content: center;
    transition:
      background-color var(--dur-micro) var(--ease-out),
      color var(--dur-micro) var(--ease-out);
  }

  .menu-trigger span {
    flex: none;
  }

  .label {
    font-size: 0.6875rem;
    font-weight: 500;
    letter-spacing: 0.08em;
    line-height: 1;
  }

  .i-ri-menu-line {
    width: 1rem;
    height: 1rem;
    opacity: 0.72;
    transition: opacity var(--dur-micro) var(--ease-out);
  }

  @media (hover: hover) {
    .menu-trigger:hover {
      background-color: var(--header-latch-hover);
    }

    .menu-trigger:hover .i-ri-menu-line {
      opacity: 1;
    }
  }

  .menu-trigger:focus-visible {
    outline: 2px solid var(--color-focus);
    outline-offset: -2px;
  }

  @media (max-width: 40rem) {
    .menu-trigger {
      width: auto;
      min-width: 4.25rem;
      height: 100%;
      padding-inline: 0.75rem;
      border: 0;
      border-inline-start: 1px solid var(--color-boundary);
      border-radius: 0;
      color: var(--color-text);
      background-color: transparent;
    }
  }
</style>

<script lang="ts">
  import { useTheme as use_theme } from 'svelte-themes'

  import { theme_slip_layout } from './content'
  import ThemeToggle from './theme-toggle.svelte'

  interface Props {
    is_closing: boolean
    is_open: boolean
    on_close: () => void
  }

  const { is_closing, is_open, on_close }: Props = $props()
  const theme = use_theme()
  const theme_label = $derived(
    theme.theme === 'system'
      ? `System relay / ${theme.resolvedTheme}`
      : `${theme.resolvedTheme} relay`,
  )
</script>

<section
  class:is-closing={is_closing}
  class:is-open={is_open}
  class="theme-slip"
  aria-label="Display mode"
  style:--slip-bottom={theme_slip_layout.bottom}
  style:--slip-enter-delay={theme_slip_layout.enter_delay}
  style:--slip-enter-x={theme_slip_layout.enter_x}
  style:--slip-enter-y={theme_slip_layout.enter_y}
  style:--slip-right={theme_slip_layout.right}
  style:--slip-rotation={theme_slip_layout.rotation}
>
  <div class="theme-heading">
    <span class="micro-label slip-code">SHIFT / 002</span>
    <button
      type="button"
      class="close"
      aria-label="Close menu"
      title="Close menu"
      onclick={on_close}
      ><span class="i-ri-close-line" aria-hidden="true"></span></button
    >
  </div>
  <span class="micro-label theme-label">{theme_label}</span>
  <ThemeToggle />
</section>

<style>
  .theme-slip {
    --theme-toggle-size: 2.5rem;
    --toggle-rule: color-mix(in oklab, var(--slip-ink) 45%, transparent);
    --toggle-ink: var(--slip-ink);
    --toggle-active-ink: var(--slip-surface);
    --toggle-hover-ink: var(--menu-highlight);

    position: absolute;
    right: var(--slip-right);
    bottom: var(--slip-bottom);
    left: var(--slip-left);
    z-index: 3;
    display: flex;
    box-sizing: border-box;
    width: 10.5rem;
    min-height: 7.5rem;
    min-width: 0;
    padding: 0.9rem 1rem 1rem;
    border: 1px solid transparent;
    color: var(--slip-ink);
    background-color: var(--slip-surface);
    align-items: flex-start;
    flex-direction: column;
    gap: 0.5rem;
    justify-content: space-between;
    pointer-events: auto;
    transform: rotate(var(--slip-effective-rotation, var(--slip-rotation)));
    transition: bottom var(--dur-long) var(--ease-out);
    white-space: nowrap;
  }

  .theme-heading {
    display: flex;
    width: 100%;
    align-items: center;
    gap: 0.75rem;
    justify-content: space-between;
  }

  .slip-code {
    letter-spacing: 0.11em;
    opacity: 0.7;
  }

  .theme-label {
    width: 100%;
    line-height: 1.3;
  }

  .close {
    display: grid;
    width: 1.5rem;
    height: 1.5rem;
    flex: none;
    padding: 0;
    cursor: pointer;
    border: 1px solid var(--toggle-rule);
    color: var(--toggle-ink);
    background: transparent;
    place-items: center;
    transition:
      background-color var(--dur-micro) var(--ease-out),
      color var(--dur-micro) var(--ease-out);
  }

  .close span {
    width: 0.875rem;
    height: 0.875rem;
  }

  @media (hover: hover) {
    .close:hover {
      color: var(--toggle-active-ink);
      background-color: var(--toggle-ink);
    }
  }

  .close:focus-visible {
    outline: 2px solid var(--color-focus);
    outline-offset: 2px;
  }

  @keyframes slip-enter {
    from {
      opacity: 0;
      transform: translate3d(var(--slip-enter-x), var(--slip-enter-y), 0)
        rotate(var(--slip-effective-rotation, var(--slip-rotation)));
    }
    to {
      opacity: 1;
      transform: translate3d(0, 0, 0)
        rotate(var(--slip-effective-rotation, var(--slip-rotation)));
    }
  }

  @keyframes slip-leave {
    to {
      opacity: 0;
      transform: translate3d(var(--slip-enter-x), var(--slip-enter-y), 0)
        rotate(var(--slip-effective-rotation, var(--slip-rotation)));
    }
  }

  .theme-slip.is-open:not(.is-closing) {
    animation: slip-enter var(--dur-long) var(--ease-out)
      var(--slip-enter-delay) backwards;
  }

  .theme-slip.is-closing {
    animation: slip-leave var(--dur-long) var(--ease-out) both;
  }

  @media (width < 40rem) {
    .theme-slip {
      --slip-effective-rotation: 0deg;
      --theme-toggle-size: 2.25rem;

      top: auto;
      right: var(--menu-inset-right);
      bottom: var(--menu-inset-bottom);
      left: var(--menu-inset-left);
      width: auto;
      min-height: 5.625rem;
      padding: 0.75rem 0.875rem;
    }

    .close {
      width: 2.25rem;
      height: 2.25rem;
    }

    .close span {
      width: 1rem;
      height: 1rem;
    }

    @keyframes mobile-slip-enter {
      from {
        opacity: 0;
        transform: translate3d(0, 1.25rem, 0);
      }
      to {
        opacity: 1;
        transform: translate3d(0, 0, 0);
      }
    }

    @keyframes mobile-slip-leave {
      to {
        opacity: 0;
        transform: translate3d(0, 1.25rem, 0);
      }
    }

    .theme-slip.is-open:not(.is-closing) {
      animation-name: mobile-slip-enter;
    }

    .theme-slip.is-closing {
      animation-name: mobile-slip-leave;
    }
  }

  @media (height < 42rem) and (width < 40rem) {
    .theme-slip {
      min-height: 4.875rem;
      gap: 0.35rem;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .theme-slip.is-open {
      animation: none;
    }
  }
</style>

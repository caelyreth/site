<script lang="ts">
  import { get_site_config } from '$lib/content/site'
  import { useTheme as use_theme } from 'svelte-themes'

  import { theme_slip_layout } from './content'
  import ThemeToggle from './theme-toggle.svelte'

  interface Props {
    is_closing: boolean
    is_open: boolean
    on_close: () => void
  }

  const { is_closing, is_open, on_close }: Props = $props()
  const site = get_site_config()
  const theme = use_theme()
  const mode_label = $derived(
    theme.theme === 'system'
      ? `跟随系统 / ${theme.resolvedTheme === 'dark' ? '深色' : '浅色'}`
      : `${theme.resolvedTheme === 'dark' ? '深色' : '浅色'}模式`,
  )
</script>

<section
  class:is-closing={is_closing}
  class:is-open={is_open}
  class="theme-slip"
  aria-label={site.current.menu.theme_label}
  style:--slip-bottom={theme_slip_layout.bottom}
  style:--slip-enter-delay={theme_slip_layout.enter_delay}
  style:--slip-enter-x={theme_slip_layout.enter_x}
  style:--slip-enter-y={theme_slip_layout.enter_y}
  style:--slip-right={theme_slip_layout.right}
  style:--slip-rotation={theme_slip_layout.rotation}
>
  <div aria-hidden="true" class="theme-copy" data-nosnippet="">
    <span class="micro-label slip-code">{site.current.menu.theme_code}</span
    >
    <span class="micro-label theme-label">{mode_label}</span>
  </div>
  <div class="theme-controls">
    <ThemeToggle fill />
    <button
      type="button"
      class="close"
      aria-label="关闭菜单"
      title="关闭菜单"
      onclick={on_close}
      ><span class="i-ri-close-line" aria-hidden="true"></span></button
    >
  </div>
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
    display: block;
    box-sizing: border-box;
    width: 14rem;
    padding: 0;
    border: 1px solid transparent;
    color: var(--slip-ink);
    background-color: var(--slip-surface);
    pointer-events: auto;
    transform: rotate(var(--slip-effective-rotation, var(--slip-rotation)));
    transition: bottom var(--dur-long) var(--ease-out);
    white-space: nowrap;
  }

  .theme-copy {
    display: flex;
    box-sizing: border-box;
    width: 100%;
    padding: 0.75rem 0.875rem;
    align-items: flex-start;
    flex-direction: column;
    gap: 0.3rem;
    justify-content: center;
  }

  .slip-code {
    letter-spacing: 0.11em;
    opacity: 0.7;
  }

  .theme-label {
    width: 100%;
    line-height: 1.3;
  }

  .theme-controls {
    display: flex;
    width: calc(100% + 2px);
    min-height: 2.5rem;
    margin-right: -1px;
    margin-bottom: -1px;
    margin-left: -1px;
    border-top: 1px solid var(--toggle-rule);
    align-items: stretch;
  }

  .close {
    display: grid;
    width: 2.5rem;
    flex: none;
    padding: 0;
    cursor: pointer;
    border: 0;
    border-inline-start: 1px solid var(--toggle-rule);
    color: var(--toggle-ink);
    background: transparent;
    place-items: center;
    transition:
      background-color var(--dur-micro) var(--ease-out),
      color var(--dur-micro) var(--ease-out);
  }

  .close span {
    width: 1rem;
    height: 1rem;
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

  @media (prefers-reduced-motion: reduce) {
    .theme-slip.is-open {
      animation: none;
    }
  }
</style>

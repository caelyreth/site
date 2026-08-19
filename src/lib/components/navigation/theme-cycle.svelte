<script lang="ts">
  import { reduced_motion } from '$lib/browser/reduced-motion'
  import { get_site_config } from '$lib/content/site'
  import { flushSync as flush_sync } from 'svelte'
  import { useTheme as use_theme } from 'svelte-themes'

  type ThemeMode = 'system' | 'light' | 'dark'

  const modes = [
    { icon: 'i-ri-computer-line', label: '跟随系统', value: 'system' },
    { icon: 'i-ri-sun-line', label: '浅色模式', value: 'light' },
    { icon: 'i-ri-moon-line', label: '深色模式', value: 'dark' },
  ] as const satisfies ReadonlyArray<{
    icon: string
    label: string
    value: ThemeMode
  }>

  const site = get_site_config()
  const theme = use_theme()
  const active_index = $derived(
    Math.max(
      0,
      modes.findIndex((mode) => mode.value === theme.theme),
    ),
  )
  const active = $derived(modes[active_index]!)
  const next = $derived(modes[(active_index + 1) % modes.length]!)
  const label = $derived(
    `${site.current.theme.label}：${active.label}。切换至${next.label}`,
  )

  function apply_theme(mode: ThemeMode) {
    flush_sync(() => {
      theme.theme = mode
    })
  }

  function cycle_theme() {
    const next_theme = next.value
    const resolved_next =
      next_theme === 'system' ? theme.systemTheme : next_theme

    if (
      resolved_next === theme.resolvedTheme ||
      !document.startViewTransition ||
      reduced_motion.current
    ) {
      apply_theme(next_theme)
      return
    }

    document.startViewTransition(() => apply_theme(next_theme))
  }
</script>

<button
  type="button"
  class="theme-cycle"
  aria-label={label}
  title={label}
  onclick={cycle_theme}
>
  <span class={active.icon} aria-hidden="true"></span>
</button>

<style>
  .theme-cycle {
    display: grid;
    width: 100%;
    height: 100%;
    min-width: 0;
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

  .theme-cycle span {
    width: 1rem;
    height: 1rem;
    opacity: 0.72;
    transition: opacity var(--dur-micro) var(--ease-out);
  }

  @media (hover: hover) {
    .theme-cycle:hover {
      color: var(--color-paper-prime);
      background-color: var(--color-text);
    }

    .theme-cycle:hover span {
      opacity: 1;
    }
  }

  .theme-cycle:focus-visible {
    outline: 2px solid var(--color-focus);
    outline-offset: -2px;
  }

  @media (prefers-reduced-motion: reduce) {
    .theme-cycle,
    .theme-cycle span {
      transition-duration: 1ms;
    }
  }
</style>

<script lang="ts">
  import { reduced_motion } from '$lib/browser/reduced-motion'
  import { flushSync as flush_sync } from 'svelte'
  import { useTheme as use_theme } from 'svelte-themes'

  type ThemeMode = 'system' | 'light' | 'dark'

  const modes = [
    {
      value: 'system',
      label: 'Use system appearance',
      icon: 'i-ri-computer-line',
    },
    {
      value: 'light',
      label: 'Use light appearance',
      icon: 'i-ri-sun-line',
    },
    { value: 'dark', label: 'Use dark appearance', icon: 'i-ri-moon-line' },
  ] as const satisfies ReadonlyArray<{
    value: ThemeMode
    label: string
    icon: string
  }>

  const theme = use_theme()
  const active_theme = $derived((theme.theme ?? 'system') as ThemeMode)

  function apply_theme(next: ThemeMode) {
    flush_sync(() => {
      theme.theme = next
    })
  }

  function should_skip_transition(next: ThemeMode) {
    const resolved_next = next === 'system' ? theme.systemTheme : next
    return (
      resolved_next === theme.resolvedTheme ||
      !document.startViewTransition ||
      reduced_motion.current
    )
  }

  function set_theme(next: ThemeMode) {
    if (next === active_theme) return

    if (should_skip_transition(next)) {
      apply_theme(next)
      return
    }

    document.startViewTransition(() => apply_theme(next))
  }
</script>

<div class="theme-toggle" role="group" aria-label="Display mode">
  {#each modes as mode (mode.value)}
    <button
      type="button"
      class:active={active_theme === mode.value}
      aria-label={mode.label}
      aria-pressed={active_theme === mode.value}
      title={mode.label}
      onclick={() => set_theme(mode.value)}
    >
      <span class={mode.icon} aria-hidden="true"></span>
    </button>
  {/each}
</div>

<style>
  .theme-toggle {
    display: inline-grid;
    height: var(--theme-toggle-size, 2.25rem);
    border: 1px solid var(--toggle-rule, var(--color-rule));
    grid-auto-columns: var(--theme-toggle-size, 2.25rem);
    grid-auto-flow: column;
  }

  .theme-toggle button {
    display: grid;
    min-width: 0;
    padding: 0;
    cursor: pointer;
    border: 0;
    border-left: 1px solid var(--toggle-rule, var(--color-rule));
    color: var(--toggle-ink, var(--color-text));
    background: transparent;
    place-items: center;
    transition:
      color var(--dur-micro) var(--ease-out),
      background-color var(--dur-micro) var(--ease-out);
  }

  .theme-toggle button:first-child {
    border-left: 0;
  }

  .theme-toggle button.active {
    color: var(--toggle-active-ink, var(--color-paper));
    background-color: var(--toggle-ink, var(--color-ink-prime));
  }

  .theme-toggle button:focus-visible {
    position: relative;
    z-index: 1;
  }

  .theme-toggle span {
    width: 1rem;
    height: 1rem;
  }

  @media (hover: hover) {
    .theme-toggle button:hover:not(.active) {
      color: var(--toggle-hover-ink, var(--color-text-link));
    }
  }

  @media (max-width: 24rem) {
    .theme-toggle {
      height: var(--theme-toggle-size, 2rem);
      grid-auto-columns: var(--theme-toggle-size, 2rem);
    }
  }
</style>

<script lang="ts">
  import { flushSync } from 'svelte'
  import { useTheme } from 'svelte-themes'

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

  const theme = useTheme()
  const activeTheme = $derived((theme.theme ?? 'system') as ThemeMode)

  function applyTheme(next: ThemeMode) {
    flushSync(() => {
      theme.theme = next
    })
  }

  function shouldSkipTransition(next: ThemeMode) {
    const resolvedNext = next === 'system' ? theme.systemTheme : next
    return (
      resolvedNext === theme.resolvedTheme ||
      !document.startViewTransition ||
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    )
  }

  function setTheme(next: ThemeMode) {
    if (next === activeTheme) return

    if (shouldSkipTransition(next)) {
      applyTheme(next)
      return
    }

    document.startViewTransition(() => applyTheme(next))
  }
</script>

<div class="theme-toggle" role="group" aria-label="Display mode">
  {#each modes as mode (mode.value)}
    <button
      type="button"
      class:active={activeTheme === mode.value}
      aria-label={mode.label}
      aria-pressed={activeTheme === mode.value}
      title={mode.label}
      onclick={() => setTheme(mode.value)}
    >
      <span class={mode.icon} aria-hidden="true"></span>
    </button>
  {/each}
</div>

<style>
  .theme-toggle {
    display: inline-grid;
    height: 2.25rem;
    border: 1px solid var(--toggle-rule, var(--color-rule));
    grid-auto-columns: 2.25rem;
    grid-auto-flow: column;
  }

  .theme-toggle button {
    display: grid;
    min-width: 0;
    padding: 0;
    cursor: pointer;
    border: 0;
    border-left: 1px solid var(--toggle-rule, var(--color-rule));
    color: var(--toggle-ink, var(--color-ink-prime));
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

  .theme-toggle :global(span) {
    width: 1rem;
    height: 1rem;
  }

  @media (hover: hover) {
    .theme-toggle button:hover:not(.active) {
      color: var(--color-accent);
    }
  }

  @media (max-width: 24rem) {
    .theme-toggle {
      height: 2rem;
      grid-auto-columns: 2rem;
    }
  }
</style>

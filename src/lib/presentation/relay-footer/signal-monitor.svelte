<script lang="ts">
  import type { EntryLink } from '$lib/content/entries'
  import type { SiteConfig } from '$lib/content/schema'
  import { site_href } from '$lib/navigation/path'
  import { flip } from 'svelte/animate'
  import { fly } from 'svelte/transition'

  import { next_signal_entry } from './signal'
  import { text_refresh_in, text_refresh_out } from './transitions'

  interface Props {
    entries: readonly EntryLink[]
    is_active: boolean
    signal: SiteConfig['footer']['signal']
  }

  const { entries, is_active, signal }: Props = $props()

  const initial_signals = $derived(
    entries.slice(0, 3).map((entry, index) => ({ id: index, entry })),
  )
  let signal_sequence = $state(3)
  let signals = $state<typeof initial_signals>([])
  let transmission_paused = $state(false)
  const visible_signals = $derived(
    signals.length ? signals : initial_signals,
  )

  function advance_signal() {
    const entry = next_signal_entry(
      entries,
      new Set(visible_signals.map((signal) => signal.entry.id)),
    )
    if (!entry) {
      if (visible_signals.length > 1) {
        signals = [visible_signals.at(-1)!, ...visible_signals.slice(0, -1)]
      }
      return
    }

    signals = [{ id: signal_sequence, entry }, ...visible_signals].slice(
      0,
      3,
    )
    signal_sequence += 1
  }

  function toggle_transmission() {
    transmission_paused = !transmission_paused
  }

  $effect(() => {
    if (!signals.length && initial_signals.length) {
      signals = initial_signals
    }
    if (transmission_paused || !is_active) return
    const interval = window.setInterval(advance_signal, 1_600)
    return () => window.clearInterval(interval)
  })
</script>

<div class="signal-monitor">
  <div class="module-head">
    <p class="micro-label signal-label">{signal.label}</p>
    <button
      type="button"
      class="signal-toggle"
      aria-label={transmission_paused
        ? signal.resume_label
        : signal.pause_label}
      aria-pressed={transmission_paused}
      title={transmission_paused ? signal.resume_label : signal.pause_label}
      onclick={toggle_transmission}
    >
      {#if transmission_paused}<span
          class="i-ri-play-fill"
          aria-hidden="true"
        ></span>{:else}<span class="i-ri-pause-fill" aria-hidden="true"
        ></span>{/if}
    </button>
  </div>
  <p class="status">{signal.status}</p>
  <div class="signal-log">
    {#each visible_signals as signal, index (signal.id)}
      <a
        animate:flip={{ duration: 360 }}
        class="signal"
        href={site_href(signal.entry.href)}
        in:fly={text_refresh_in}
        out:fly={text_refresh_out}
        style:--signal-opacity={1 - index * 0.3}
      >
        <span class="signal-collection">{signal.entry.collection}</span>
        <span class="signal-title">{signal.entry.title}</span>
      </a>
    {/each}
  </div>
</div>

<style>
  .signal-monitor {
    width: 100%;
  }

  .module-head {
    display: flex;
    width: 100%;
    align-items: center;
    justify-content: space-between;
    gap: 0.5rem;
  }

  .signal-label {
    margin: 0;
    color: var(--muted);
    letter-spacing: 0.12em;
    transition: color var(--dur-long) var(--ease-out);
  }

  .status {
    margin: 1rem 0 0;
    color: var(--primary);
    font-size: 0.75rem;
  }

  .signal-log {
    display: flex;
    flex-direction: column-reverse;
    width: 100%;
    height: 3.2rem;
    margin-top: 0.5rem;
    gap: 0.25rem;
    overflow: hidden;
    font-variant-numeric: tabular-nums;
  }

  .signal {
    display: flex;
    width: 100%;
    color: var(--accent);
    font-size: 0.75rem;
    line-height: 1.2;
    opacity: var(--signal-opacity);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    will-change: opacity, transform;
    text-decoration: none;
    transition: opacity var(--dur-long) var(--ease-out);
  }

  .signal-collection {
    flex: none;
    color: var(--secondary);
  }

  .signal-collection::after {
    margin-inline: 0.35rem;
    content: '/';
    color: var(--muted);
  }

  .signal-title {
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .signal:focus-visible {
    outline: 2px solid var(--primary);
    outline-offset: 0.15rem;
  }

  @media (hover: hover) {
    .signal:hover {
      color: var(--primary);
      opacity: 1;
    }
  }

  .signal-toggle {
    display: grid;
    width: 1.75rem;
    height: 1.75rem;
    padding: 0;
    cursor: pointer;
    border: 1px solid var(--rule);
    color: var(--secondary);
    background: transparent;
    place-items: center;
    transition:
      border-color var(--dur-long) var(--ease-out),
      color var(--dur-long) var(--ease-out),
      transform var(--dur-micro) var(--ease-out);
  }

  .signal-toggle span {
    width: 0.75rem;
    height: 0.75rem;
  }

  .signal-toggle:active {
    transform: translateY(1px);
  }

  @media (hover: hover) {
    .signal-toggle:hover {
      border-color: var(--primary);
      color: var(--primary);
    }
  }
</style>

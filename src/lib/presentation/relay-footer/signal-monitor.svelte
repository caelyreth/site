<script lang="ts">
  import { flip } from 'svelte/animate'
  import { fly } from 'svelte/transition'

  import { next_signal } from './signal'
  /* oxlint-disable prefer-const -- a Svelte rune must remain mutable. */
  import { text_refresh_in, text_refresh_out } from './transitions'

  interface Props {
    is_active: boolean
  }

  const { is_active }: Props = $props()

  let signal_sequence = $state(1)
  let signals = $state([
    {
      id: 0,
      value: 'RX//A72-ORBIT-0001',
    },
  ])
  let transmission_paused = $state(false)

  function advance_signal() {
    signals = [
      { id: signal_sequence, value: next_signal() },
      ...signals,
    ].slice(0, 3)
    signal_sequence += 1
  }

  function toggle_transmission() {
    transmission_paused = !transmission_paused
  }

  $effect(() => {
    if (transmission_paused || !is_active) return
    const interval = window.setInterval(advance_signal, 1_600)
    return () => window.clearInterval(interval)
  })
</script>

<div class="signal-monitor">
  <div class="module-head">
    <p class="micro-label signal-label">Signal monitor</p>
    <button
      type="button"
      class="signal-toggle"
      aria-label={transmission_paused
        ? 'Resume signal rotation'
        : 'Pause signal rotation'}
      aria-pressed={transmission_paused}
      title={transmission_paused
        ? 'Resume signal rotation'
        : 'Pause signal rotation'}
      onclick={toggle_transmission}
    >
      {#if transmission_paused}<span
          class="i-ri-play-fill"
          aria-hidden="true"
        ></span>{:else}<span class="i-ri-pause-fill" aria-hidden="true"
        ></span>{/if}
    </button>
  </div>
  <p class="status">Carrier retained</p>
  <div aria-hidden="true" class="signal-log">
    {#each signals as signal, index (signal.id)}
      <span
        animate:flip={{ duration: 360 }}
        class="signal"
        in:fly={text_refresh_in}
        out:fly={text_refresh_out}
        style:--signal-opacity={1 - index * 0.3}>{signal.value}</span
      >
    {/each}
  </div>
</div>

<style>
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
    display: block;
    width: 100%;
    color: var(--accent);
    font-size: 0.75rem;
    line-height: 1.2;
    opacity: var(--signal-opacity);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    will-change: opacity, transform;
    transition: opacity var(--dur-long) var(--ease-out);
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

<script lang="ts">
  /* oxlint-disable prefer-const -- a Svelte rune must remain mutable. */
  import { textRefreshIn, textRefreshOut } from '$lib/motion/text-refresh'
  import { fly } from 'svelte/transition'

  const barcodeBars = [
    1, 2, 1, 3, 1, 1, 2, 1, 3, 1, 2, 1, 1, 3, 2, 1, 2, 1, 3, 1, 1, 2, 1, 3,
    1, 2, 1, 1, 3, 1, 2, 1, 2, 1,
  ]
  const placeholderMap = [
    'Observation archive',
    'Field register',
    'Transmission ledger',
    'Material index',
  ]
  const signalGlyphs = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let transmission = $state('RX//A72-ORBIT-0001')
  let transmissionPaused = $state(false)
  let footerVisible = $state(false)

  function nextTransmission() {
    const code = Array.from(
      { length: 3 },
      () => signalGlyphs[Math.floor(Math.random() * signalGlyphs.length)],
    ).join('')
    const sequence = String(Math.floor(Math.random() * 10_000)).padStart(
      4,
      '0',
    )
    return `RX//${code}-ORBIT-${sequence}`
  }

  function observeFooter(node: HTMLElement) {
    if (typeof IntersectionObserver === 'undefined') {
      footerVisible = true
      return () => {
        footerVisible = false
      }
    }

    const observer = new IntersectionObserver(
      ([entry]) => (footerVisible = entry.isIntersecting),
      { rootMargin: '200px 0px' },
    )
    observer.observe(node)
    return () => {
      observer.disconnect()
      footerVisible = false
    }
  }

  $effect(() => {
    if (transmissionPaused || !footerVisible) return
    const interval = window.setInterval(
      () => (transmission = nextTransmission()),
      1_600,
    )
    return () => window.clearInterval(interval)
  })
</script>

{#snippet footerLabel(text: string)}
  <p class="label">{text}</p>
{/snippet}

<footer class="station-footer" {@attach observeFooter}>
  <div class="deck station-inner">
    <div class="heading">
      <div>
        {@render footerLabel('Archive transmission')}
        <p class="title font-serif">Caelyreth relay station</p>
      </div>
      <p class="statement">
        Field notes, status signals, and future paths held at the edge of
        the station.
      </p>
    </div>
    <div class="grid">
      <section class="module">
        {@render footerLabel('Site map')}
        <ul class="sitemap" aria-label="Placeholder site map">
          {#each placeholderMap as item}<li>{item}</li>{/each}
        </ul>
        <p class="detail">Placeholder index only</p>
      </section>
      <section class="module">
        {@render footerLabel('Archive marker')}
        <div aria-hidden="true" class="barcode">
          {#each barcodeBars as width}<span style:--bar-width={width}
            ></span>{/each}
        </div>
        <p class="detail">RBK / 2026 / YU</p>
      </section>
      <div aria-hidden="true" class="module base-module">
        <svg class="base-asterisk" viewBox="0 0 48 48" fill="none"
          ><path
            d="M24 3v42M3 24h42M9.15 9.15l29.7 29.7M38.85 9.15 9.15 38.85"
            stroke="currentColor"
          /></svg
        >
      </div>
      <section class="module">
        <div class="module-head">
          {@render footerLabel('Signal monitor')}
          <button
            type="button"
            class="signal-toggle"
            aria-label={transmissionPaused
              ? 'Resume signal rotation'
              : 'Pause signal rotation'}
            aria-pressed={transmissionPaused}
            title={transmissionPaused
              ? 'Resume signal rotation'
              : 'Pause signal rotation'}
            onclick={() => (transmissionPaused = !transmissionPaused)}
          >
            {#if transmissionPaused}<span
                class="i-ri-play-fill"
                aria-hidden="true"
              ></span>{:else}<span
                class="i-ri-pause-fill"
                aria-hidden="true"
              ></span>{/if}
          </button>
        </div>
        <p class="status">Carrier retained</p>
        {#key transmission}<span
            aria-hidden="true"
            class="signal"
            in:fly={textRefreshIn}
            out:fly={textRefreshOut}>{transmission}</span
          >{/key}
        <p class="detail">Rotating relay identifier</p>
      </section>
    </div>
    <div class="tail">
      <span>© 2026 Yu</span><span>Rainbook program - Caelyreth relay</span
      ><span>Station log / no public uplink</span>
    </div>
  </div>
</footer>

<style>
  .station-footer {
    position: relative;
    border-top: 1px solid var(--color-rule);
  }
  .station-inner {
    width: 100%;
    margin: 0 auto;
    padding: 1.5rem var(--inline-gutter) 1.25rem;
  }
  .heading {
    display: grid;
    gap: 1rem;
    align-items: center;
    padding-bottom: 1.5rem;
  }
  .label {
    margin: 0;
    color: var(--color-muted);
    font-size: 0.625rem;
    font-weight: 500;
    letter-spacing: 0.12em;
    line-height: 1.2;
    text-transform: uppercase;
  }
  .title {
    margin: 0.5rem 0 0;
    color: var(--color-ink);
    font-size: 1.25rem;
    font-weight: 700;
    line-height: 1.1;
  }
  .statement {
    max-width: 36ch;
    margin: 0;
    color: var(--color-ink-prime);
    font-size: 0.75rem;
    line-height: 1.55;
  }
  .grid {
    display: grid;
    grid-template-columns: minmax(0, 1fr);
    border-block: 1px solid var(--color-rule);
  }
  .module {
    --primary: var(--color-ink);
    --secondary: var(--color-ink-prime);
    --muted: var(--color-muted);
    --accent: var(--color-accent);
    --rule: var(--color-rule);
    display: flex;
    min-width: 0;
    min-height: 9.75rem;
    padding: 1.25rem 0;
    flex-direction: column;
    align-items: flex-start;
    transition:
      background-color var(--dur-long) var(--ease-out),
      box-shadow var(--dur-long) var(--ease-out),
      color var(--dur-long) var(--ease-out);
  }
  .module + .module {
    border-top: 1px solid var(--color-rule);
  }
  .module .label {
    color: var(--muted);
    transition: color var(--dur-long) var(--ease-out);
  }
  .module-head {
    display: flex;
    width: 100%;
    align-items: center;
    justify-content: space-between;
    gap: 0.5rem;
  }
  .sitemap {
    display: grid;
    width: 100%;
    gap: 0.5rem;
    margin: 0.875rem 0 0;
    padding: 0;
    color: var(--secondary);
    font-size: 0.75rem;
    line-height: 1.2;
    list-style: none;
  }
  .sitemap li {
    display: grid;
    grid-template-columns: auto minmax(0, 1fr);
    gap: 0.375rem;
  }
  .sitemap li::before {
    content: '-';
    color: var(--muted);
  }
  .barcode {
    display: flex;
    width: 100%;
    min-height: 2.5rem;
    gap: 1px;
    margin-top: 1rem;
    overflow: hidden;
  }
  .barcode span {
    flex: var(--bar-width) 1 0;
    background: var(--primary);
  }
  .base-module {
    align-items: center;
    justify-content: center;
    color: var(--secondary);
  }
  .base-asterisk {
    width: 2.75rem;
    height: 2.75rem;
  }
  .status {
    margin: 1rem 0 0;
    color: var(--primary);
    font-size: 0.75rem;
  }
  .signal {
    display: block;
    width: 100%;
    margin-top: 0.5rem;
    overflow-wrap: anywhere;
    color: var(--accent);
    font-size: 0.75rem;
    font-variant-numeric: tabular-nums;
  }
  .detail {
    margin: auto 0 0;
    color: var(--muted);
    font-size: 0.625rem;
    letter-spacing: 0.04em;
    line-height: 1.3;
    text-transform: uppercase;
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
  .signal-toggle :global(span) {
    width: 0.75rem;
    height: 0.75rem;
  }
  .signal-toggle:active {
    transform: translateY(1px);
  }
  .tail {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem 1.5rem;
    padding-top: 1rem;
    color: var(--color-muted);
    font-size: 0.625rem;
    line-height: 1.3;
  }
  @media (hover: hover) {
    .module:hover {
      --primary: var(--color-paper);
      --secondary: var(--color-paper);
      --muted: color-mix(in oklab, var(--color-paper) 68%, transparent);
      --accent: var(--color-paper);
      --rule: color-mix(in oklab, var(--color-paper) 65%, transparent);
      color: var(--color-paper);
      background: var(--color-ink);
    }
    .signal-toggle:hover {
      border-color: var(--primary);
      color: var(--primary);
    }
  }
  @media (min-width: 40rem) {
    .heading {
      grid-template-columns: minmax(0, 1fr) minmax(12rem, 0.8fr);
      gap: 2rem;
    }
  }
  @media (min-width: 48rem) {
    .grid {
      grid-template-columns: 1.1fr 1.25fr 0.85fr 1.25fr;
    }
    .module {
      padding: 1.25rem 1rem;
    }
    .module:first-child {
      padding-left: 0;
      box-shadow: -1.5rem 0 0 transparent;
    }
    .module:last-child {
      padding-right: 0;
      box-shadow: 1.5rem 0 0 transparent;
    }
    .module + .module {
      border-top: 0;
      border-inline-start: 1px solid var(--color-rule);
    }
  }
  @media (hover: hover) and (min-width: 48rem) {
    .module:first-child:hover {
      box-shadow: -1.5rem 0 0 var(--color-ink);
    }
    .module:last-child:hover {
      box-shadow: 1.5rem 0 0 var(--color-ink);
    }
  }
</style>

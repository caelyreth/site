<script lang="ts">
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

  function nextTransmission() {
    const code = Array.from(
      { length: 3 },
      () => signalGlyphs[Math.floor(Math.random() * signalGlyphs.length)],
    ).join('')
    const sequence = String(Math.floor(Math.random() * 10_000)).padStart(4, '0')
    return `RX//${code}-ORBIT-${sequence}`
  }

  $effect(() => {
    if (transmissionPaused) return

    const id = window.setInterval(() => (transmission = nextTransmission()), 1_600)
    return () => window.clearInterval(id)
  })
</script>

<footer class="station-footer">
  <div mx-auto w-full max-w-3xl px-6 class="deck station-footer-inner">
    <div class="footer-heading">
      <div>
        <p class="footer-label">Archive transmission</p>
        <p class="footer-title">Caelyreth relay station</p>
      </div>
      <p class="footer-statement">
        Field notes, status signals, and future paths held at the edge of the station.
      </p>
    </div>

    <div class="footer-grid">
      <section class="footer-module">
        <p class="footer-label">Site map</p>
        <ul class="footer-sitemap" aria-label="Placeholder site map">
          {#each placeholderMap as item}
            <li>{item}</li>
          {/each}
        </ul>
        <p pt-2 class="footer-detail">Placeholder index only</p>
      </section>

      <section class="footer-module">
        <p class="footer-label">Archive marker</p>
        <div aria-hidden="true" class="footer-barcode">
          {#each barcodeBars as width}
            <span style:--bar-width={width}></span>
          {/each}
        </div>
        <p class="footer-detail">RBK / 2026 / YU</p>
      </section>

      <div aria-hidden="true" class="footer-module footer-base-module">
        <svg class="footer-base-asterisk" viewBox="0 0 48 48" fill="none">
          <path
            d="M24 3v42M3 24h42M9.15 9.15l29.7 29.7M38.85 9.15 9.15 38.85"
            stroke="currentColor"
          />
        </svg>
      </div>

      <section class="footer-module">
        <div class="footer-module-head">
          <p class="footer-label">Signal monitor</p>
          <button
            type="button"
            class="footer-signal-toggle"
            aria-label={transmissionPaused
              ? 'Resume signal rotation'
              : 'Pause signal rotation'}
            aria-pressed={transmissionPaused}
            title={transmissionPaused
              ? 'Resume signal rotation'
              : 'Pause signal rotation'}
            onclick={() => (transmissionPaused = !transmissionPaused)}
          >
            <svg aria-hidden="true" viewBox="0 0 12 12" fill="none">
              {#if transmissionPaused}
                <path d="m4 2 5 4-5 4V2Z" fill="currentColor" />
              {:else}
                <path d="M3.5 2v8M8.5 2v8" stroke="currentColor" stroke-width="1.5" />
              {/if}
            </svg>
          </button>
        </div>
        <p class="footer-status">Carrier retained</p>
        {#key transmission}
          <span aria-hidden="true" class="footer-signal">{transmission}</span>
        {/key}
        <p class="footer-detail">Rotating relay identifier</p>
      </section>
    </div>

    <div class="footer-tail">
      <span>© 2026 Yu</span>
      <span>Rainbook program — Caelyreth relay</span>
      <span>Station log / no public uplink</span>
    </div>
  </div>
</footer>

<style>
/* The station footer closes as a working index rather than a link grid. */
.station-footer {
  position: relative;
  border-top: 1px solid var(--color-rule);
}
.station-footer-inner {
  padding-block: 1.5rem 1.25rem;
}
.footer-heading {
  display: grid;
  gap: 1rem;
  align-items: center;
  padding-bottom: 1.5rem;
}
.footer-label {
  margin: 0;
  color: var(--color-muted);
  font-size: 0.625rem;
  font-weight: 500;
  line-height: 1.2;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}
.footer-title {
  margin: 0.5rem 0 0;
  color: var(--color-ink);
  font-family: var(--font-stack-serif);
  font-size: 1.25rem;
  font-style: normal;
  font-weight: 700;
  line-height: 1.1;
}
.footer-statement {
  max-width: 36ch;
  margin: 0;
  color: var(--color-ink-2);
  font-size: 0.75rem;
  line-height: 1.55;
}
.footer-grid {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  border-block: 1px solid var(--color-rule);
}
.footer-module {
  --footer-primary: var(--color-ink);
  --footer-secondary: var(--color-ink-2);
  --footer-muted: var(--color-muted);
  --footer-accent: var(--color-accent);
  --footer-rule: var(--color-rule);

  display: flex;
  min-width: 0;
  min-height: 9.75rem;
  flex-direction: column;
  align-items: flex-start;
  padding: 1.25rem 0;
  box-shadow: 0 0 0 transparent;
  transition:
    background-color var(--dur-long) var(--ease-out),
    box-shadow var(--dur-long) var(--ease-out),
    color var(--dur-long) var(--ease-out);
}
@media (hover: hover) {
  .footer-module:hover {
    --footer-primary: var(--color-paper);
    --footer-secondary: var(--color-paper);
    --footer-muted: color-mix(
      in oklab,
      var(--color-paper) 68%,
      transparent
    );
    --footer-accent: var(--color-paper);
    --footer-rule: color-mix(in oklab, var(--color-paper) 65%, transparent);

    color: var(--color-paper);
    background-color: var(--color-ink);
  }
}
@media (min-width: 48rem) {
  .footer-module:first-child {
    box-shadow: -1.5rem 0 0 transparent;
  }
  .footer-module:last-child {
    box-shadow: 1.5rem 0 0 transparent;
  }
}
@media (hover: hover) and (min-width: 48rem) {
  .footer-module:first-child:hover {
    box-shadow: -1.5rem 0 0 var(--color-ink);
  }
  .footer-module:last-child:hover {
    box-shadow: 1.5rem 0 0 var(--color-ink);
  }
}
.footer-module .footer-label,
.footer-module .footer-status,
.footer-module .footer-signal,
.footer-module .footer-sitemap,
.footer-module .footer-detail {
  transition: color var(--dur-long) var(--ease-out);
}
.footer-module .footer-label {
  color: var(--footer-muted);
}
.footer-module-head {
  display: flex;
  width: 100%;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
}
.footer-module + .footer-module {
  border-top: 1px solid var(--color-rule);
}
.footer-base-module {
  align-items: center;
  justify-content: center;
  color: var(--footer-secondary);
}
.footer-base-asterisk {
  width: 2.75rem;
  height: 2.75rem;
}
.footer-barcode {
  display: flex;
  width: 100%;
  min-height: 2.5rem;
  align-items: stretch;
  gap: 1px;
  margin-top: 1rem;
  overflow: hidden;
}
.footer-barcode > span {
  flex: var(--bar-width) 1 0;
  background: var(--footer-primary);
  transition: background-color var(--dur-long) var(--ease-out);
}
.footer-status {
  margin: 1rem 0 0;
  color: var(--footer-primary);
  font-size: 0.75rem;
  line-height: 1.2;
}
.footer-signal {
  display: block;
  width: 100%;
  margin-top: 0.5rem;
  overflow-wrap: anywhere;
  color: var(--footer-accent);
  font-size: 0.75rem;
  font-variant-numeric: tabular-nums;
  line-height: 1.2;
  animation: footer-signal-refresh var(--dur-short) var(--ease-out) both;
}
.footer-signal-toggle {
  display: grid;
  width: 1.75rem;
  height: 1.75rem;
  flex: none;
  place-items: center;
  padding: 0;
  cursor: pointer;
  border: 1px solid var(--footer-rule);
  color: var(--footer-secondary);
  background: transparent;
  transition:
    border-color var(--dur-long) var(--ease-out),
    color var(--dur-long) var(--ease-out),
    transform var(--dur-micro) var(--ease-out);
}
.footer-signal-toggle svg {
  width: 0.75rem;
  height: 0.75rem;
}
.footer-signal-toggle:hover {
  border-color: var(--footer-primary);
  color: var(--footer-primary);
}
.footer-signal-toggle:active {
  transform: translateY(1px);
}
.footer-signal-toggle:disabled {
  cursor: not-allowed;
  opacity: 0.55;
}
@media (pointer: coarse) {
  .footer-signal-toggle {
    width: 2.25rem;
    height: 2.25rem;
  }
}
@keyframes footer-signal-refresh {
  from {
    opacity: 0;
    transform: translateY(3px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
.footer-sitemap {
  display: grid;
  width: 100%;
  gap: 0.5rem;
  margin: 0.875rem 0 0;
  padding: 0;
  color: var(--footer-secondary);
  font-size: 0.75rem;
  line-height: 1.2;
  list-style: none;
}
.footer-sitemap li {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr);
  align-items: baseline;
  column-gap: 0.375rem;
}
.footer-sitemap li::before {
  content: '—';
  color: var(--footer-muted);
}
.footer-detail {
  margin: auto 0 0;
  color: var(--footer-muted);
  font-size: 0.625rem;
  letter-spacing: 0.04em;
  line-height: 1.3;
  text-transform: uppercase;
}
.footer-tail {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem 1.5rem;
  padding-top: 1rem;
  color: var(--color-muted);
  font-size: 0.625rem;
  line-height: 1.3;
}
@media (min-width: 40rem) {
  .footer-heading {
    grid-template-columns: minmax(0, 1fr) minmax(12rem, 0.8fr);
    gap: 2rem;
  }
}
@media (min-width: 48rem) {
  .footer-grid {
    grid-template-columns: 1.1fr 1.25fr 0.85fr 1.25fr;
  }
  .footer-module {
    padding: 1.25rem 1rem;
  }
  .footer-module:first-child {
    padding-left: 0;
  }
  .footer-module:last-child {
    padding-right: 0;
  }
  .footer-module + .footer-module {
    border-top: 0;
    border-inline-start: 1px solid var(--color-rule);
  }
}
</style>

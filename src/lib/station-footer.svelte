<script lang="ts">
  const barcodeBars = [
    2, 1, 3, 1, 1, 2, 4, 1, 2, 1, 3, 2, 1, 4, 1, 2, 2, 1, 3, 1, 2, 4,
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
        <p class="footer-label">Archive marker</p>
        <div aria-hidden="true" class="footer-barcode">
          {#each barcodeBars as width}
            <span style:--bar-width={width}></span>
          {/each}
        </div>
        <p class="footer-detail">RBK / 2026 / YU</p>
      </section>

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

      <div aria-hidden="true" class="footer-module footer-base-module">
        <svg class="footer-base-asterisk" viewBox="0 0 48 48" fill="none">
          <path
            d="M24 3v42M3 24h42M9.15 9.15l29.7 29.7M38.85 9.15 9.15 38.85"
            stroke="currentColor"
          />
        </svg>
      </div>

      <section class="footer-module">
        <p class="footer-label">Site map</p>
        <ul class="footer-sitemap" aria-label="Placeholder site map">
          {#each placeholderMap as item}
            <li>{item}</li>
          {/each}
        </ul>
        <p pt-2 class="footer-detail">Placeholder index only</p>
      </section>
    </div>

    <div class="footer-tail">
      <span>© 2026 Yu</span>
      <span>Rainbook program — Caelyreth relay</span>
      <span>Station log / no public uplink</span>
    </div>
  </div>
</footer>

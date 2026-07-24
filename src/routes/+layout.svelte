<script lang="ts">
  import 'virtual:uno.css'
  import '../app.css'
  import ThemeToggle from '$lib/theme-toggle.svelte'

  const { children } = $props()

  // station time — Sol 0 is the day the repository came online
  const EPOCH = Date.UTC(2026, 6, 12)
  let now = $state<Date | null>(null)

  $effect(() => {
    const tick = () => (now = new Date())
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  })

  const sol = $derived(
    now ? Math.floor((now.getTime() - EPOCH) / 86_400_000) : null,
  )
  const clock = $derived(
    now?.toLocaleTimeString('en-GB', { hour12: false }) ?? null,
  )

  function handleBrandClick(event: MouseEvent) {
    if (
      window.location.pathname !== '/' ||
      event.button !== 0 ||
      event.metaKey ||
      event.ctrlKey ||
      event.shiftKey ||
      event.altKey
    ) {
      return
    }

    event.preventDefault()
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  // rare lamp pulse — 2s fade every 12s, not a 60fps animation loop
  let dim = $state(false)

  $effect(() => {
    const id = setInterval(() => (dim = !dim), 12_000)
    return () => clearInterval(id)
  })

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

  // opening progress — 0: full width over the window, 1: docked to the deck
  const CAPTURE_SCROLL_RATIO = 1
  let p = $state<number | undefined>(undefined)

  $effect(() => {
    let frame: number | undefined

    const updateProgress = () => {
      frame = undefined
      const next = Math.min(
        1,
        Math.max(
          0,
          window.scrollY / (window.innerHeight * CAPTURE_SCROLL_RATIO),
        ),
      )
      if (next !== p) p = next
    }

    const onScroll = () => {
      if (frame !== undefined) return
      frame = requestAnimationFrame(updateProgress)
    }

    updateProgress()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      window.removeEventListener('scroll', onScroll)
      if (frame !== undefined) cancelAnimationFrame(frame)
    }
  })
</script>

<div
  relative
  z-10
  min-h-screen
  flex="~ col"
  style:--capture-progress={CAPTURE_SCROLL_RATIO}
  style:--p={p}
>
  <!-- station chrome — the hatch field is always there; the rest
       assembles as you descend from the window to the deck -->
  <div aria-hidden="true" class="hatch"></div>
  <div aria-hidden="true" class="guide guide-left chrome-fade"></div>
  <div aria-hidden="true" class="guide guide-right chrome-fade"></div>
  <div aria-hidden="true" class="vignette"></div>
  <div aria-hidden="true" class="bolt chrome-fade" top-4 left-4></div>
  <div aria-hidden="true" class="bolt chrome-fade" top-4 right-4></div>
  <div aria-hidden="true" class="bolt chrome-fade" bottom-4 left-4></div>
  <div aria-hidden="true" class="bolt chrome-fade" bottom-4 right-4></div>
  <svg
    aria-hidden="true"
    class="chrome-fade"
    fixed
    top-5
    left-9
    z-30
    width="12"
    height="14"
    viewBox="0 0 12 14"
    fill="none"
  >
    <path d="M6 2v12" stroke="var(--color-rule)" />
    <path d="M2.5 6.5 6 2l3.5 4.5" stroke="var(--color-rule)" fill="none" />
  </svg>

  <!-- background geometry — faint construction figures in the margins,
       visible only on wide viewports where the hatch fields breathe -->
  <div
    aria-hidden="true"
    fixed
    top-20vh
    pointer-events-none
    class="chrome-fade -right-24 hidden lg:block"
  >
    <svg width="440" height="320" viewBox="0 0 340 220" fill="none">
      <path
        d="M120 0v220"
        stroke="var(--color-deco)"
        stroke-dasharray="4 4"
      />
      <path
        d="M60 170 180 50"
        stroke="var(--color-deco)"
        stroke-dasharray="4 4"
      />
      <circle cx="120" cy="110" r="85" stroke="var(--color-deco)" />
      <rect
        x="60"
        y="50"
        width="120"
        height="120"
        stroke="var(--color-deco)"
      />
    </svg>
  </div>
  <div
    aria-hidden="true"
    fixed
    bottom-15vh
    pointer-events-none
    class="chrome-fade -left-20 hidden lg:block"
  >
    <svg width="340" height="300" viewBox="0 0 200 200" fill="none">
      <circle cx="100" cy="100" r="28" stroke="var(--color-deco)" />
      <circle
        cx="100"
        cy="100"
        r="52"
        stroke="var(--color-deco)"
        stroke-dasharray="4 4"
      />
      <circle
        cx="100"
        cy="100"
        r="76"
        stroke="var(--color-deco)"
        stroke-dasharray="4 4"
      />
      <circle cx="100" cy="100" r="1.5" fill="var(--color-deco)" />
    </svg>
  </div>

  <!-- the docking header stays pinned as the observation becomes the deck -->
  <header class="hdr" fixed top-0 z-50>
    <div class="hdr-inner">
      <a href="/" class="hdr-brand" onclick={handleBrandClick} decoration-none>
        <svg
          aria-hidden="true"
          class="hdr-brand-mark"
          viewBox="0 0 42 24"
          fill="none"
          preserveAspectRatio="none"
        >
          <rect x="3.75" y="2" width="7.5" height="20" fill="currentColor" />
          <rect x="13.25" y="2" width="12" height="20" fill="currentColor" />
          <rect x="27.25" y="2" width="6" height="20" fill="currentColor" />
          <rect x="35.25" y="2" width="3" height="20" fill="currentColor" />
        </svg>
        <span class="hdr-brand-copy">
          <span font-serif text-base font-bold tracking-tight>Caelyreth</span>
        </span>
      </a>
      <div flex="~ items-center gap-5">
        <div class="hdr-meta" tabular-nums text-right>
          <div>SOL {sol ?? '———'}</div>
          <div class="hdr-sub">{clock ?? '——:——:——'}</div>
        </div>
        <ThemeToggle />
      </div>
    </div>
  </header>

  <main flex="~ col 1">
    <div mx-auto w-full max-w-3xl px-6 class="deck" flex="~ col 1">
      {@render children()}
    </div>
  </main>

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
          <svg
            class="footer-base-asterisk"
            viewBox="0 0 48 48"
            fill="none"
          >
            <path d="M24 3v42M3 24h42M9.15 9.15l29.7 29.7M38.85 9.15 9.15 38.85" stroke="currentColor" />
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
</div>

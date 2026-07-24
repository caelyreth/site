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

  // rare lamp pulse — 2s fade every 12s, not a 60fps animation loop
  let dim = $state(false)

  $effect(() => {
    const id = setInterval(() => (dim = !dim), 12_000)
    return () => clearInterval(id)
  })
</script>

<!-- station chrome -->
<div aria-hidden="true" class="hatch"></div>
<div aria-hidden="true" class="guide guide-left"></div>
<div aria-hidden="true" class="guide guide-right"></div>
<div aria-hidden="true" class="vignette"></div>
<div aria-hidden="true" class="bolt" top-4 left-4></div>
<div aria-hidden="true" class="bolt" top-4 right-4></div>
<div aria-hidden="true" class="bolt" bottom-4 left-4></div>
<div aria-hidden="true" class="bolt" bottom-4 right-4></div>
<svg
  aria-hidden="true"
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
  class="-right-24 hidden lg:block"
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
  class="-left-20 hidden lg:block"
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

<div relative z-10 min-h-screen flex="~ col">
  <header border="b rule">
    <div
      mx-auto
      w-full
      max-w-3xl
      px-6
      py-4
      class="deck"
      flex="~ items-center justify-between gap-4"
    >
      <div flex="~ col gap-0.5">
        <a
          href="/"
          flex="~ items-center gap-2"
          font-serif
          text-lg
          font-bold
          tracking-tight
          decoration-none
        >
          <span
            aria-hidden="true"
            class="lamp"
            class:is-dim={dim}
            inline-block
            size-2
            bg-accent
          ></span>
          Caelyreth
        </a>
        <span text="xs muted" uppercase tracking-widest>
          Rainbook · relay station
        </span>
      </div>
      <div flex="~ items-center gap-5">
        <div text="sm ink-2" tabular-nums text-right leading-tight>
          <div>SOL {sol ?? '———'}</div>
          <div text-muted>{clock ?? '——:——:——'}</div>
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

  <footer border="t rule">
    <div mx-auto w-full max-w-3xl px-6 py-8 class="deck" text="sm muted">
      <div mb-5 flex="~ items-end gap-4">
        <div aria-hidden="true" h-1.5 w-24 border="1 rule" flex="~">
          <div flex-1 bg-ink-2></div>
          <div flex-1></div>
          <div flex-1 bg-ink-2></div>
          <div flex-1></div>
        </div>
        <div aria-hidden="true" flex="~ items-end gap-0.5">
          <div w-1 h-1 bg-ink-2></div>
          <div w-1 h-2 bg-ink-2></div>
          <div w-1 h-3 bg-ink-2></div>
          <div w-1 h-4 bg-ink-2></div>
          <div class="lamp" class:is-dim={dim} w-1 h-5 bg-accent></div>
        </div>
      </div>
      <div flex="~ wrap gap-x-6 gap-y-1">
        <span>© 2026 Yu</span>
        <span>Rainbook program — Caelyreth relay</span>
        <span>Svelte 5 + UnoCSS</span>
        <span>Fraunces &amp; Space Grotesk</span>
      </div>
    </div>
  </footer>
</div>

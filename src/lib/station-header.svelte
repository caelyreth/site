<script lang="ts">
  import StationMenu from '$lib/station-menu.svelte'

  const EPOCH = Date.UTC(2026, 6, 12)
  let now = $state<Date | null>(null)

  $effect(() => {
    const tick = () => (now = new Date())
    tick()
    const id = setInterval(tick, 60_000)
    return () => clearInterval(id)
  })

  const sol = $derived(
    now ? Math.floor((now.getTime() - EPOCH) / 86_400_000) : null,
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
</script>

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
      </div>
      <StationMenu />
    </div>
  </div>
</header>

<style>
/* The docking header shares the deck's frame measure and edge rules.
   It stays full-width over the window, then docks as --p reaches 1. */
.hdr {
  --hdr-opening-ink: var(--color-ink);
  --hdr-opening-ink-2: var(--color-muted);
  --hdr-ink: color-mix(
    in oklab,
    var(--hdr-opening-ink),
    var(--color-ink) calc(var(--p, 0) * 100%)
  );
  --hdr-ink-2: color-mix(
    in oklab,
    var(--hdr-opening-ink-2),
    var(--color-muted) calc(var(--p, 0) * 100%)
  );
  --hdr-line: color-mix(
    in oklab,
    transparent,
    var(--color-rule) calc(var(--p, 0) * 100%)
  );
  --toggle-line: var(--hdr-line);
  --toggle-ink: var(--hdr-ink-2);
  background-color: color-mix(
    in oklab,
    transparent,
    var(--color-paper) calc(var(--p, 0) * 100%)
  );
  border-bottom: 1px solid var(--hdr-line);
  color: var(--hdr-ink);
  position: fixed;
  top: 0;
  left: 50%;
  width: 100%;
  max-width: calc(
    var(--station-frame-measure) +
      (100vw - var(--station-frame-measure)) * (1 - var(--p, 0))
  );
  transform: translateX(-50%);
}
.hdr::before,
.hdr::after {
  content: '';
  position: absolute;
  top: 0;
  bottom: 0;
  width: 1px;
  pointer-events: none;
  background: var(--hdr-line);
}
.hdr::before {
  left: 0;
}
.hdr::after {
  right: 0;
}
:global(.dark) .hdr {
  --hdr-opening-ink: oklch(88% 0 0);
  --hdr-opening-ink-2: oklch(60% 0 0);
}
.hdr-inner {
  margin-inline: auto;
  width: 100%;
  height: 3.25rem;
  padding-inline: 1.5rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
}
.hdr-brand {
  display: inline-flex;
  align-items: center;
  gap: 0.75rem;
  min-width: 0;
  color: var(--hdr-ink);
  line-height: 1;
}
.hdr-brand:hover {
  color: var(--hdr-ink);
}
.hdr-brand-mark {
  display: block;
  flex: none;
  width: 3rem;
  height: 1.5rem;
}
.hdr-brand-copy {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 0.25rem;
  min-width: 0;
}
.hdr-meta {
  font-size: 0.625rem;
  line-height: 1.35;
}

@media (max-width: 38rem) {
  .hdr-inner {
    padding-inline: 0.75rem;
  }
  .hdr-meta {
    display: none;
  }
}
</style>

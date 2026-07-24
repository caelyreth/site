<script lang="ts">
  import ThemeToggle from '$lib/theme-toggle.svelte'

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
      <ThemeToggle />
    </div>
  </div>
</header>

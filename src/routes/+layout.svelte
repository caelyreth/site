<script lang="ts">
  import 'virtual:uno.css'
  import '../app.css'
  import ThemeToggle from '$lib/theme-toggle.svelte'

  const { children } = $props()
</script>

<!-- drafting-sheet chrome -->
<div aria-hidden="true" class="hatch"></div>
<div aria-hidden="true" class="guide guide-left"></div>
<div aria-hidden="true" class="guide guide-right"></div>
<div aria-hidden="true" class="grain"></div>
<div aria-hidden="true" class="reg-mark" top-4 left-4></div>
<div aria-hidden="true" class="reg-mark" top-4 right-4></div>
<div aria-hidden="true" class="reg-mark" bottom-4 left-4></div>
<div aria-hidden="true" class="reg-mark" bottom-4 right-4></div>
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
      py-5
      bg-paper
      flex="~ items-center justify-between"
    >
      <a
        href="/"
        flex="~ items-center gap-2"
        font-serif
        text-lg
        font-bold
        tracking-tight
        decoration-none
      >
        Caelyreth
        <span
          aria-hidden="true"
          inline-block
          size-1.5
          rounded-full
          bg-accent
        ></span>
      </a>
      <ThemeToggle />
    </div>
  </header>

  <main flex="~ col 1">
    <div mx-auto w-full max-w-3xl px-6 bg-paper flex="~ col 1">
      {@render children()}
    </div>
  </main>

  <footer border="t rule">
    <div mx-auto w-full max-w-3xl px-6 py-8 bg-paper text="sm muted">
      <div aria-hidden="true" mb-5 h-1.5 w-24 border="1 rule" flex="~">
        <div flex-1 bg-ink-2></div>
        <div flex-1></div>
        <div flex-1 bg-ink-2></div>
        <div flex-1></div>
      </div>
      <div flex="~ wrap gap-x-6 gap-y-1">
        <span>© 2026 Yu</span>
        <span>Svelte 5 + UnoCSS, attributify-first</span>
        <span>Fraunces &amp; Space Grotesk</span>
      </div>
    </div>
  </footer>
</div>

<script lang="ts">
  import ThemeToggle from '$lib/ThemeToggle.svelte'

  const swatches = [
    { name: 'paper', token: '--color-paper' },
    { name: 'paper-2', token: '--color-paper-2' },
    { name: 'rule', token: '--color-rule' },
    { name: 'muted', token: '--color-muted' },
    { name: 'ink-2', token: '--color-ink-2' },
    { name: 'ink', token: '--color-ink' },
    { name: 'accent', token: '--color-accent' },
  ]
</script>

<div min-h-screen flex="~ col">
  <header flex="~ items-center justify-between" px-6 py-5 md:px-10>
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
      <span aria-hidden="true" inline-block size-1.5 rounded-full bg-accent
      ></span>
    </a>
    <ThemeToggle />
  </header>

  <main flex="~ col 1" px-6 md:px-10>
    <section max-w-2xl pt-16 pb-14 md:pt-24>
      <h1
        font-serif
        text="4xl ink md:5xl"
        font-bold
        tracking-tight
        leading-tight
      >
        Writing, making, and the space between.
      </h1>
      <p mt-5 max-w-prose text="md ink-2" leading-relaxed>
        The personal corner of Yu — notes, experiments, and works in
        progress. This page is a placeholder while the foundations settle.
      </p>
    </section>

    <section max-w-2xl pb-10>
      <h2 font-serif text="xl ink" font-bold tracking-tight>
        The groundwork, this round
      </h2>

      <h3 mt-8 text="sm ink" font-bold>Palette</h3>
      <p mt-1 text="sm muted" leading-relaxed>
        Surfaces stay pure grayscale; the single accent is
        <span text-accent font-medium>vermilion</span>.
      </p>
      <div mt-4 flex="~ wrap" gap-4>
        {#each swatches as sw (sw.token)}
          <div flex="~ col gap-1.5">
            <div
              size-9
              rounded-md
              border="1 rule"
              style="background: var({sw.token})"
            ></div>
            <span text="xs muted">{sw.name}</span>
          </div>
        {/each}
      </div>

      <h3 mt-10 text="sm ink" font-bold>Type</h3>
      <p mt-1 text="sm muted" leading-relaxed>
        One serif, one sans — both variable, nothing else.
      </p>
      <div mt-4 flex="~ col gap-2">
        <p font-serif text="2xl ink" font-bold tracking-tight>
          Fraunces
          <span ml-2 font-sans text="sm muted" font-normal tracking-normal
            >display serif, roman only</span
          >
        </p>
        <p font-sans text="lg ink">
          Space Grotesk
          <span ml-2 text="sm muted">text sans, body &amp; UI</span>
        </p>
      </div>

      <h3 mt-10 text="sm ink" font-bold>Dark mode</h3>
      <p mt-1 max-w-prose text="sm muted" leading-relaxed>
        Class-based, so it can be toggled by hand — same hue, only lightness
        and chroma move. Try the switch up top.
      </p>
    </section>
  </main>

  <footer px-6 py-8 md:px-10>
    <div
      max-w-2xl
      pt-6
      border="t rule"
      text="sm muted"
      flex="~ wrap gap-x-6 gap-y-1"
    >
      <span>© 2026 Yu</span>
      <span>Svelte 5 + UnoCSS, attributify-first</span>
      <span>Fraunces &amp; Space Grotesk</span>
    </div>
  </footer>
</div>

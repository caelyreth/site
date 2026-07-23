<script lang="ts">
  const materials = [
    {
      name: 'paper',
      token: '--color-paper',
      light: 'oklch(98% 0 0)',
      dark: 'oklch(15% 0 0)',
    },
    {
      name: 'paper-2',
      token: '--color-paper-2',
      light: 'oklch(95% 0 0)',
      dark: 'oklch(18.5% 0 0)',
    },
    {
      name: 'hatch',
      token: '--color-hatch',
      light: 'oklch(93.5% 0 0)',
      dark: 'oklch(27% 0 0)',
    },
    {
      name: 'deco',
      token: '--color-deco',
      light: 'oklch(92% 0 0)',
      dark: 'oklch(25% 0 0)',
    },
    {
      name: 'rule',
      token: '--color-rule',
      light: 'oklch(91% 0 0)',
      dark: 'oklch(27% 0 0)',
    },
    {
      name: 'muted',
      token: '--color-muted',
      light: 'oklch(48% 0 0)',
      dark: 'oklch(63% 0 0)',
    },
    {
      name: 'ink-2',
      token: '--color-ink-2',
      light: 'oklch(34% 0 0)',
      dark: 'oklch(76% 0 0)',
    },
    {
      name: 'ink',
      token: '--color-ink',
      light: 'oklch(19% 0 0)',
      dark: 'oklch(93% 0 0)',
    },
    {
      name: 'accent',
      token: '--color-accent',
      light: 'oklch(57% 0.17 40)',
      dark: 'oklch(65% 0.15 40)',
    },
  ]
</script>

<section pt="16 md:24" pb-14>
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
    Yu’s corner for notes on architecture, geometry, and the philosophy of <span
      text-accent
      font-medium>space</span
    > — drafts, drawings, and works in progress.
  </p>
</section>

<div aria-hidden="true" border="t rule"></div>

<section pt-10 pb-14>
  <h2 font-serif text="xl ink" font-bold tracking-tight>Index</h2>
  <div mt-6 flex="~ col">
    <div
      py-4
      border="t rule"
      flex="~ baseline justify-between gap-4"
      text="md ink"
    >
      <span font-serif font-bold tracking-tight>Notes</span>
      <span text="sm muted" text-right>
        writing on architecture, geometry, space — forthcoming
      </span>
    </div>
    <div
      py-4
      border="t rule"
      flex="~ baseline justify-between gap-4"
      text="md ink"
    >
      <span font-serif font-bold tracking-tight>Works</span>
      <span text="sm muted" text-right>things made — forthcoming</span>
    </div>
    <div
      py-4
      border="y rule"
      flex="~ baseline justify-between gap-4"
      text="md ink"
    >
      <span font-serif font-bold tracking-tight>About</span>
      <span text="sm muted" text-right>who — forthcoming</span>
    </div>
  </div>
</section>

<div aria-hidden="true" border="t rule"></div>

<section pt-10 pb-16>
  <h2 font-serif text="xl ink" font-bold tracking-tight>
    Material &amp; method
  </h2>

  <h3 mt-8 text="sm ink" font-bold>Material schedule</h3>
  <p mt-1 text="sm muted" leading-relaxed>
    Surfaces stay pure grayscale; the single accent is
    <span text-accent font-medium>vermilion</span>. Values as drawn, light
    and dark.
  </p>
  <table mt-4 w-full text="sm" border="t rule">
    <thead>
      <tr text="xs muted" border="b rule">
        <th scope="col" py-2 pr-4 text-left font-normal></th>
        <th scope="col" py-2 pr-4 text-left font-normal>token</th>
        <th scope="col" py-2 pr-4 text-left font-normal>light</th>
        <th
          scope="col"
          py-2
          text-left
          font-normal
          class="hidden sm:table-cell">dark</th
        >
      </tr>
    </thead>
    <tbody>
      {#each materials as m (m.token)}
        <tr border="b rule">
          <td py-2.5 pr-4>
            <div
              size-5
              rounded-sm
              border="1 rule"
              style="background: var({m.token})"
            ></div>
          </td>
          <td py-2.5 pr-4 text-ink>{m.name}</td>
          <td py-2.5 pr-4 text-muted tabular-nums>{m.light}</td>
          <td py-2.5 text-muted tabular-nums class="hidden sm:table-cell"
            >{m.dark}</td
          >
        </tr>
      {/each}
    </tbody>
  </table>

  <h3 mt-10 text="sm ink" font-bold>Lettering</h3>
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
    <p mt-2 font-serif text="xl ink" tracking-widest aria-label="Figures">
      0 1 2 3 4 5 6 7 8 9
    </p>
  </div>

  <h3 mt-10 text="sm ink" font-bold>Dark mode</h3>
  <p mt-1 max-w-prose text="sm muted" leading-relaxed>
    Class-based, so it can be toggled by hand — same hue, only lightness and
    chroma move. Try the switch up top.
  </p>
</section>

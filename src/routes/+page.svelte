<script lang="ts">
  import IsoCube from '$lib/iso-cube.svelte'

  const materials = [
    {
      name: 'paper',
      token: '--color-paper',
      light: 'oklch(96.5% 0 0)',
      dark: 'oklch(15% 0 0)',
    },
    {
      name: 'paper-2',
      token: '--color-paper-2',
      light: 'oklch(93.5% 0 0)',
      dark: 'oklch(18.5% 0 0)',
    },
    {
      name: 'field',
      token: '--color-field',
      light: 'oklch(93.5% 0 0)',
      dark: 'oklch(13% 0 0)',
    },
    {
      name: 'hatch',
      token: '--color-hatch',
      light: 'oklch(92% 0 0)',
      dark: 'oklch(27% 0 0)',
    },
    {
      name: 'deco',
      token: '--color-deco',
      light: 'oklch(90.5% 0 0)',
      dark: 'oklch(25% 0 0)',
    },
    {
      name: 'rule',
      token: '--color-rule',
      light: 'oklch(89.5% 0 0)',
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

<!-- page 1 — the observation window remains in frame while it shrinks
     to deck width and dims into the paper background -->
<div class="capture">
  <section class="scene full-bleed" flex="~ items-center justify-center">
    <div class="scene-debris">
      <!-- starfields, two depths -->
      <div aria-hidden="true" class="stars stars-far"></div>
      <div aria-hidden="true" class="stars"></div>

      <!-- machine labels -->
      <span
        class="scene-label v-text hidden sm:block"
        absolute
        right-3
        style="top: 50%"
      >
        Rainbook program
      </span>
      <span
        class="scene-label v-text-left hidden sm:block"
        absolute
        left-3
        style="top: 50%"
      >
        Kept by Yu
      </span>

      <!-- floating solids — varied orientations and depths -->
      <div
        absolute
        w-28
        class="hidden -rotate-8 sm:block"
        style="top: 5%; left: 22%"
      >
        <IsoCube />
      </div>
      <div
        absolute
        w-16
        class="hidden rotate-10 sm:block"
        style="top: 12%; right: 22%"
      >
        <IsoCube />
      </div>
      <div
        absolute
        w-12
        class="hidden -scale-x-100 sm:block"
        style="top: 60%; left: 16%"
      >
        <IsoCube />
      </div>
      <div
        absolute
        w-10
        class="hidden rotate-6 blur-[1.5px] sm:block"
        style="bottom: 8%; right: 24%"
      >
        <IsoCube />
      </div>
      <div
        absolute
        w-32
        class="hidden rotate-3 blur-[2.5px] md:block"
        style="bottom: 10%; left: 62%"
      >
        <IsoCube />
      </div>

      <!-- wireframes -->
      <div
        absolute
        w-20
        class="hidden -rotate-12 sm:block"
        style="top: 38%; right: 5%"
      >
        <IsoCube wire />
      </div>
      <div
        absolute
        w-10
        class="hidden rotate-6 sm:block"
        style="top: 26%; left: 3%"
      >
        <IsoCube wire />
      </div>
      <div
        absolute
        w-8
        class="hidden -rotate-4 md:block"
        style="bottom: 6%; left: 38%"
      >
        <IsoCube wire />
      </div>

      <!-- orbits -->
      <div
        aria-hidden="true"
        class="orbit hidden sm:block"
        absolute
        size-36
        style="bottom: 16%; left: 8%"
      ></div>
      <div
        aria-hidden="true"
        class="orbit hidden md:block"
        absolute
        size-20
        style="top: 24%; right: 30%"
      ></div>

      <!-- pixel clusters + square markers -->
      <div
        aria-hidden="true"
        class="pixels hidden md:block"
        absolute
        style="top: 17%; right: 30%"
      ></div>
      <div
        aria-hidden="true"
        class="pixels hidden sm:block"
        absolute
        style="top: 68%; left: 22%"
      ></div>
      <div
        aria-hidden="true"
        class="pixels hidden md:block"
        absolute
        style="top: 58%; right: 10%"
      ></div>
      <span
        aria-hidden="true"
        class="marker"
        absolute
        style="top: 28%; left: 28%"
      ></span>
      <span
        aria-hidden="true"
        class="marker hidden sm:block"
        absolute
        style="top: 34%; right: 20%"
      ></span>
      <span
        aria-hidden="true"
        class="marker hidden md:block"
        absolute
        style="bottom: 30%; right: 26%"
      ></span>
      <span
        aria-hidden="true"
        class="marker hidden sm:block"
        absolute
        style="top: 47%; right: 18%; background: var(--color-accent)"
      ></span>

      <!-- streaks + stripe blocks -->
      <div
        aria-hidden="true"
        class="streaks hidden sm:block"
        absolute
        style="left: 5%; top: 64%"
      ></div>
      <div
        aria-hidden="true"
        class="stripe-block hidden sm:block"
        absolute
        style="right: 14%; bottom: 24%"
      ></div>
      <div
        aria-hidden="true"
        class="stripe-block sm hidden md:block"
        absolute
        style="left: 7%; top: 42%"
      ></div>
    </div>

    <!-- corner labels remain with the window as it docks to the deck -->
    <span
      class="scene-label scene-corner scene-corner-left"
      absolute
      top-20
    >
      Caelyreth — observation window
    </span>
    <span
      class="scene-label scene-corner scene-corner-right"
      absolute
      top-20
    >
      Field 044° 12′
    </span>
    <span
      class="scene-label scene-corner scene-corner-left"
      absolute
      bottom-5
    >
      Transmission 001
    </span>
    <a
      href="#station"
      class="scene-label scene-corner scene-corner-right"
      absolute
      bottom-5
    >
      Descend to the station ↓
    </a>

    <!-- the observation itself — preserved through the capture -->
    <figure relative z-10 flex="~ col items-center" px-6>
      <div relative>
        <img
          src="/observation.jpg"
          alt="An abstract painting in deep blue — cloud bands over the planet’s day side"
          width="1200"
          height="1200"
          fetchpriority="high"
          block
          w-64
          sm:w-80
          aspect-square
          object-cover
        />
        <span aria-hidden="true" class="tick tick-tl"></span>
        <span aria-hidden="true" class="tick tick-tr"></span>
        <span aria-hidden="true" class="tick tick-bl"></span>
        <span aria-hidden="true" class="tick tick-br"></span>
      </div>
      <figcaption mt-4 class="scene-label">
        Obs. 001 — cloud bands, day side
      </figcaption>
    </figure>
  </section>
</div>

<!-- page 2 — the station, where the deck and hatch begin -->
<section id="station" scroll-mt-20 pt="16 md:24" pb-14>
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
    A relay station on an isolated survey planet. Field notes on
    architecture, geometry, and the philosophy of
    <span text-accent font-medium>space</span> — kept by Yu, the one who stayed.
  </p>
</section>

<div aria-hidden="true" border="t rule"></div>

<section pt-10 pb-14>
  <h2 font-serif text="xl ink" font-bold tracking-tight>
    Station directory
  </h2>
  <div mt-6 flex="~ col">
    <div
      py-4
      border="t rule"
      flex="~ baseline justify-between gap-4"
      text="md ink"
    >
      <span font-serif font-bold tracking-tight>Field log</span>
      <span text="sm muted" text-right>
        notes on architecture, geometry, space — forthcoming
      </span>
    </div>
    <div
      py-4
      border="t rule"
      flex="~ baseline justify-between gap-4"
      text="md ink"
    >
      <span font-serif font-bold tracking-tight>Instruments</span>
      <span text="sm muted" text-right>
        things made, still running — forthcoming
      </span>
    </div>
    <div
      py-4
      border="y rule"
      flex="~ baseline justify-between gap-4"
      text="md ink"
    >
      <span font-serif font-bold tracking-tight>Manifest</span>
      <span text="sm muted" text-right>crew of one — forthcoming</span>
    </div>
  </div>
</section>

<div aria-hidden="true" border="t rule"></div>

<section pt-10 pb-16>
  <h2 font-serif text="xl ink" font-bold tracking-tight>
    Station specifications
  </h2>

  <h3 mt-8 text="sm ink" font-bold>Panel &amp; paint schedule</h3>
  <p mt-1 text="sm muted" leading-relaxed>
    Surfaces stay pure grayscale, poured concrete. The single accent is the <span
      text-accent
      font-medium>signal lamp</span
    >. Values as drawn, day and night shift.
  </p>
  <table mt-4 w-full text="sm" border="t rule">
    <thead>
      <tr text="xs muted" border="b rule">
        <th scope="col" py-2 pr-4 text-left font-normal></th>
        <th scope="col" py-2 pr-4 text-left font-normal>token</th>
        <th scope="col" py-2 pr-4 text-left font-normal>day</th>
        <th
          scope="col"
          py-2
          text-left
          font-normal
          class="hidden sm:table-cell">night</th
        >
      </tr>
    </thead>
    <tbody>
      {#each materials as m (m.token)}
        <tr border="b rule">
          <td py-2.5 pr-4>
            <div
              size-5
              rounded-none
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

  <h3 mt-10 text="sm ink" font-bold>Stencil &amp; lettering</h3>
  <p mt-1 text="sm muted" leading-relaxed>
    Two voices: the keeper’s serif for the log, the station’s grotesque for
    labels and readings. Both variable, nothing else.
  </p>
  <div mt-4 flex="~ col gap-2">
    <p font-serif text="2xl ink" font-bold tracking-tight>
      Fraunces
      <span ml-2 font-sans text="sm muted" font-normal tracking-normal
        >the keeper’s hand, roman only</span
      >
    </p>
    <p font-sans text="lg ink">
      Space Grotesk
      <span ml-2 text="sm muted">
        the machine’s voice, labels &amp; readings
      </span>
    </p>
    <p mt-2 font-serif text="xl ink" tracking-widest aria-label="Figures">
      0 1 2 3 4 5 6 7 8 9
    </p>
  </div>

  <h3 mt-10 text="sm ink" font-bold>Night shift</h3>
  <p mt-1 max-w-prose text="sm muted" leading-relaxed>
    The station after lights-out — same hue, only lightness and chroma move.
    Class-based, toggled by hand from the status panel.
  </p>
</section>

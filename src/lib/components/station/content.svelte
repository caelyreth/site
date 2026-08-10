<script lang="ts">
  type Material = {
    token: `--${string}`
    light: `--${string}`
    dark: `--${string}`
  }

  const materials = [
    {
      token: '--color-paper',
      light: '--color-paper-light',
      dark: '--color-paper-dark',
    },
    {
      token: '--color-paper-prime',
      light: '--color-paper-prime-light',
      dark: '--color-paper-prime-dark',
    },
    {
      token: '--color-field',
      light: '--color-field-light',
      dark: '--color-field-dark',
    },
    {
      token: '--color-hatch',
      light: '--color-hatch-light',
      dark: '--color-hatch-dark',
    },
    {
      token: '--color-deco',
      light: '--color-deco-light',
      dark: '--color-deco-dark',
    },
    {
      token: '--color-rule',
      light: '--color-rule-light',
      dark: '--color-rule-dark',
    },
    {
      token: '--color-muted',
      light: '--color-muted-light',
      dark: '--color-muted-dark',
    },
    {
      token: '--color-ink-prime',
      light: '--color-ink-prime-light',
      dark: '--color-ink-prime-dark',
    },
    {
      token: '--color-ink',
      light: '--color-ink-light',
      dark: '--color-ink-dark',
    },
    {
      token: '--color-accent',
      light: '--color-accent-light',
      dark: '--color-accent-dark',
    },
  ] as const satisfies readonly Material[]
</script>

{#snippet directory_row(title: string, detail: string, last = false)}
  <div class:directory-row-last={last} class="directory-row">
    <span class="directory-name font-serif">{title}</span>
    <span class="directory-detail">{detail}</span>
  </div>
{/snippet}

<section id="station" class="introduction">
  <h1 class="heading font-serif">
    Writing, making, and the space between.
  </h1>
  <p class="lead">
    A relay station on an isolated survey planet. Field notes on
    architecture, geometry, and the philosophy of <span>space</span> - kept by
    Yu, the one who stayed.
  </p>
</section>

<div aria-hidden="true" class="content-rule"></div>

<section class="content-section">
  <h2 class="section-heading font-serif">Station directory</h2>
  <div class="directory">
    {@render directory_row(
      'Field log',
      'notes on architecture, geometry, space - forthcoming',
    )}
    {@render directory_row(
      'Instruments',
      'things made, still running - forthcoming',
    )}
    {@render directory_row('Manifest', 'crew of one - forthcoming', true)}
  </div>
</section>

<div aria-hidden="true" class="content-rule"></div>

<section class="content-section specifications">
  <h2 class="section-heading font-serif">Station specifications</h2>
  <h3>Panel &amp; paint schedule</h3>
  <p>
    Surfaces stay pure grayscale, poured concrete. The single accent is the
    <span>signal lamp</span>. Values as drawn, day and night shift.
  </p>
  <table>
    <thead>
      <tr>
        <th scope="col">token</th>
        <th scope="col">day</th>
        <th scope="col" class="night-column">night</th>
      </tr>
    </thead>
    <tbody>
      {#each materials as material (material.token)}
        <tr>
          <td>{material.token}</td>
          <td>
            <span
              class="material-swatch"
              title={material.light}
              style:background={`var(${material.light})`}
            ></span>
          </td>
          <td class="night-column">
            <span
              class="material-swatch"
              title={material.dark}
              style:background={`var(${material.dark})`}
            ></span>
          </td>
        </tr>
      {/each}
    </tbody>
  </table>
  <h3>Stencil &amp; lettering</h3>
  <p>
    Two voices: the keeper's serif for the log, the station's grotesque for
    labels and readings. Both variable, nothing else.
  </p>
  <div class="type-samples">
    <p class="serif-sample font-serif">
      Fraunces <small>the keeper's hand, roman only</small>
    </p>
    <p class="sans-sample">
      Space Grotesk <small>the machine's voice, labels &amp; readings</small
      >
    </p>
    <p class="figures-sample font-serif">0 1 2 3 4 5 6 7 8 9</p>
  </div>
  <h3>Night shift</h3>
  <p>
    The station after lights-out - same hue, only lightness and chroma move.
    Class-based, toggled by hand from the status panel.
  </p>
</section>

<style>
  .introduction {
    padding: 4rem 0 3.5rem;
    scroll-margin-top: var(--header-safe-inset);
  }

  .heading,
  .section-heading {
    margin: 0;
    color: var(--color-ink);
    font-weight: 700;
    letter-spacing: 0;
    line-height: 1.08;
  }

  .heading {
    max-width: 18ch;
    font-size: clamp(2.25rem, 7vw, 3rem);
  }

  .lead {
    max-width: 65ch;
    margin: 1.25rem 0 0;
    color: var(--color-ink-prime);
    font-size: 1rem;
    line-height: 1.65;
  }

  .lead span,
  .specifications span {
    color: var(--color-accent);
    font-weight: 500;
  }

  .content-rule {
    height: 1px;
    background: var(--color-rule);
  }

  .content-section {
    padding-block: 2.5rem 3.5rem;
  }

  .section-heading {
    font-size: 1.25rem;
  }

  .directory {
    margin-top: 1.5rem;
  }

  .directory-row {
    display: grid;
    grid-template-columns: minmax(0, 1fr) minmax(8rem, 1fr);
    gap: 1rem;
    padding-block: 1rem;
    border-top: 1px solid var(--color-rule);
    align-items: baseline;
  }

  .directory-row-last {
    border-bottom: 1px solid var(--color-rule);
  }

  .directory-name {
    font-weight: 700;
    color: var(--color-ink);
  }

  .directory-detail {
    color: var(--color-muted);
    font-size: 0.875rem;
    text-align: right;
  }

  .specifications h3 {
    margin: 2rem 0 0;
    color: var(--color-ink);
    font-size: 0.875rem;
  }

  .specifications p {
    max-width: 65ch;
    margin: 0.25rem 0 0;
    color: var(--color-muted);
    font-size: 0.875rem;
    line-height: 1.65;
  }

  .specifications table {
    width: 100%;
    margin-top: 1rem;
    border-collapse: collapse;
    border-top: 1px solid var(--color-rule);
    color: var(--color-muted);
    font-size: 0.875rem;
    font-variant-numeric: tabular-nums;
  }

  .specifications th,
  .specifications td {
    padding: 0.625rem 1rem 0.625rem 0;
    border-bottom: 1px solid var(--color-rule);
    text-align: left;
    font-weight: 400;
  }

  .specifications th {
    font-size: 0.75rem;
  }

  .material-swatch {
    display: block;
    width: 1.25rem;
    height: 1.25rem;
    border: 1px solid var(--color-rule);
  }

  .type-samples {
    margin-top: 1rem;
  }

  .type-samples p {
    margin-top: 0.5rem;
  }

  .serif-sample {
    font-size: 1.5rem;
    font-weight: 700;
    color: var(--color-ink);
  }

  .sans-sample {
    font-size: 1.125rem;
    color: var(--color-ink);
  }

  .type-samples small {
    margin-left: 0.5rem;
    color: var(--color-muted);
    font-family: var(--font-stack-sans);
    font-size: 0.875rem;
    font-weight: 400;
  }

  .figures-sample {
    margin-top: 1rem;
    color: var(--color-ink);
    font-size: 1.25rem;
    letter-spacing: 0.12em;
  }

  @media (max-width: 38rem) {
    .introduction {
      padding-top: 4rem;
    }
    .directory-row {
      grid-template-columns: minmax(0, 1fr);
      gap: 0.35rem;
    }
    .directory-detail {
      text-align: left;
    }
    .night-column {
      display: none;
    }
  }
</style>

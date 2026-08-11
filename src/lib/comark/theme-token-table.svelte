<script lang="ts">
  type Material = {
    dark: `--${string}`
    light: `--${string}`
    token: `--${string}`
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

<table>
  <thead>
    <tr
      ><th scope="col">token</th><th scope="col">day</th><th
        class="night-column"
        scope="col">night</th
      ></tr
    >
  </thead>
  <tbody>
    {#each materials as material (material.token)}
      <tr>
        <td>{material.token}</td>
        <td
          ><span
            class="material-swatch"
            title={material.light}
            style:background={`var(${material.light})`}
          ></span></td
        >
        <td class="night-column"
          ><span
            class="material-swatch"
            title={material.dark}
            style:background={`var(${material.dark})`}
          ></span></td
        >
      </tr>
    {/each}
  </tbody>
</table>

<style>
  table {
    width: 100%;
    margin-top: 1rem;
    border-collapse: collapse;
    border-top: 1px solid var(--color-rule);
    color: var(--color-muted);
    font-size: 0.875rem;
    font-variant-numeric: tabular-nums;
  }
  th,
  td {
    padding: 0.625rem 1rem 0.625rem 0;
    border-bottom: 1px solid var(--color-rule);
    text-align: left;
    font-weight: 400;
  }
  th {
    font-size: 0.75rem;
  }
  .material-swatch {
    display: block;
    width: 1.25rem;
    height: 1.25rem;
    border: 1px solid var(--color-rule);
  }
  @media (max-width: 38rem) {
    .night-column {
      display: none;
    }
  }
</style>

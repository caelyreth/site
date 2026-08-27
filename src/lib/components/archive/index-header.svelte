<script lang="ts">
  interface Props {
    description: string
    kind_label: string
    total: number
    title: string
  }

  let { description, kind_label, title, total }: Props = $props()
</script>

<header class="archive-index-header">
  <div aria-label={kind_label} class="archive-register" role="group">
    <span class="register-kind">{kind_label}</span>
    <span class="register-total">{total}</span>
  </div>
  <div class="archive-index-header-copy">
    <h1>{title}</h1>
    <p>{description}</p>
  </div>
</header>

<style>
  .archive-index-header {
    min-width: 0;
  }

  .archive-index-header-copy {
    min-width: 0;
    padding-top: clamp(1.75rem, 4vw, 2.75rem);
  }

  .archive-register {
    display: inline-grid;
    min-height: 2.25rem;
    border-block: 1px solid var(--color-boundary);
    grid-template-columns: repeat(2, auto);
    align-items: stretch;
    color: var(--color-muted);
    font-size: 0.625rem;
    font-variant-numeric: tabular-nums;
    letter-spacing: 0.08em;
    line-height: 1.2;
  }

  .archive-register span {
    display: inline-flex;
    padding-inline: 0.75rem;
    align-items: center;
  }

  .register-total {
    border-inline-start: 1px solid var(--color-boundary);
  }

  .register-total {
    color: var(--color-text-secondary);
    font-size: 0.8125rem;
    justify-content: center;
  }

  h1 {
    margin: 0;
    color: var(--color-text);
    font-family: var(--font-stack-serif);
    font-size: clamp(1.875rem, 3.1vw, 2.75rem);
    font-weight: 700;
    letter-spacing: 0;
    line-height: 1.18;
    min-width: 0;
    overflow-wrap: anywhere;
  }

  p {
    max-width: 37rem;
    margin: 0.875rem 0 0;
    color: var(--color-text-secondary);
    font-size: 0.9375rem;
    line-height: 1.6;
  }
</style>

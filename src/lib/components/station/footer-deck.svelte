<script lang="ts">
  import FooterSignalMonitor from './footer-signal-monitor.svelte'

  interface Props {
    is_footer_visible: boolean
  }

  const { is_footer_visible }: Props = $props()

  const barcode_bars = [
    1, 2, 1, 3, 1, 1, 2, 1, 3, 1, 2, 1, 1, 3, 2, 1, 2, 1, 3, 1, 1, 2, 1, 3,
    1, 2, 1, 1, 3, 1, 2, 1, 2, 1,
  ]
  const placeholder_map = [
    'Observation archive',
    'Field register',
    'Transmission ledger',
    'Material index',
  ]
</script>

{#snippet footer_label(text: string)}
  <p class="micro-label footer-label">{text}</p>
{/snippet}

<div class="deck station-inner footer-deck">
  <div class="heading">
    <div>
      {@render footer_label('Archive transmission')}
      <p class="title font-serif">Caelyreth relay station</p>
    </div>
    <p class="statement">
      Field notes, status signals, and future paths held at the edge of the
      station.
    </p>
  </div>
  <div class="grid">
    <section class="footer-module">
      {@render footer_label('Site map')}
      <ul class="sitemap" aria-label="Placeholder site map">
        {#each placeholder_map as item}<li>{item}</li>{/each}
      </ul>
      <p class="detail">Placeholder index only</p>
    </section>
    <section class="footer-module">
      {@render footer_label('Archive marker')}
      <div aria-hidden="true" class="barcode">
        {#each barcode_bars as width}<span style:--bar-width={width}
          ></span>{/each}
      </div>
      <p class="detail">RBK / 2026 / YU</p>
    </section>
    <div aria-hidden="true" class="footer-module base-module">
      <svg class="base-asterisk" viewBox="0 0 48 48" fill="none"
        ><path
          d="M24 3v42M3 24h42M9.15 9.15l29.7 29.7M38.85 9.15 9.15 38.85"
          stroke="currentColor"
        /></svg
      >
    </div>
    <section class="footer-module">
      <FooterSignalMonitor is_active={is_footer_visible} />
    </section>
  </div>
  <div class="tail">
    <span>© 2026 Yu</span><span>Rainbook program - Caelyreth relay</span
    ><span>Station log / no public uplink</span>
  </div>
</div>

<style>
  .station-inner {
    width: 100%;
    margin: 0 auto;
    padding: 1.5rem var(--inline-gutter) 1.25rem;
  }

  .heading {
    display: grid;
    gap: 1rem;
    align-items: center;
    padding-bottom: 1.5rem;
  }

  .footer-label {
    margin: 0;
    color: var(--color-muted);
    letter-spacing: 0.12em;
  }

  .title {
    margin: 0.5rem 0 0;
    color: var(--color-ink);
    font-size: 1.25rem;
    font-weight: 700;
    line-height: 1.1;
  }

  .statement {
    max-width: 36ch;
    margin: 0;
    color: var(--color-ink-prime);
    font-size: 0.75rem;
    line-height: 1.55;
  }

  .grid {
    display: grid;
    grid-template-columns: minmax(0, 1fr);
    border-block: 1px solid var(--color-rule);
  }

  .footer-module {
    --primary: var(--color-ink);
    --secondary: var(--color-ink-prime);
    --muted: var(--color-muted);
    --accent: var(--color-accent);
    --rule: var(--color-rule);
    display: flex;
    min-width: 0;
    min-height: 9.75rem;
    padding: 1.25rem 0;
    flex-direction: column;
    align-items: flex-start;
    transition:
      background-color var(--dur-long) var(--ease-out),
      box-shadow var(--dur-long) var(--ease-out),
      color var(--dur-long) var(--ease-out);
  }

  .footer-module + .footer-module {
    border-top: 1px solid var(--color-rule);
  }

  .footer-module .footer-label {
    color: var(--muted);
    transition: color var(--dur-long) var(--ease-out);
  }

  .sitemap {
    display: grid;
    width: 100%;
    gap: 0.5rem;
    margin: 0.875rem 0 0;
    padding: 0;
    color: var(--secondary);
    font-size: 0.75rem;
    line-height: 1.2;
    list-style: none;
  }

  .sitemap li {
    display: grid;
    grid-template-columns: auto minmax(0, 1fr);
    gap: 0.375rem;
  }

  .sitemap li::before {
    content: '-';
    color: var(--muted);
  }

  .barcode {
    display: flex;
    width: 100%;
    min-height: 2.5rem;
    gap: 1px;
    margin-top: 1rem;
    overflow: hidden;
  }

  .barcode span {
    flex: var(--bar-width) 1 0;
    background: var(--primary);
  }

  .base-module {
    align-items: center;
    justify-content: center;
    color: var(--secondary);
  }

  .base-asterisk {
    width: 2.75rem;
    height: 2.75rem;
  }

  .detail {
    margin: auto 0 0;
    color: var(--muted);
    font-size: 0.625rem;
    letter-spacing: 0.04em;
    line-height: 1.3;
    text-transform: uppercase;
  }

  .tail {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem 1.5rem;
    padding-top: 1rem;
    color: var(--color-muted);
    font-size: 0.625rem;
    line-height: 1.3;
  }

  @media (hover: hover) {
    .footer-module:hover {
      --primary: var(--color-paper);
      --secondary: var(--color-paper);
      --muted: color-mix(in oklab, var(--color-paper) 68%, transparent);
      --accent: var(--color-paper);
      --rule: color-mix(in oklab, var(--color-paper) 65%, transparent);
      color: var(--color-paper);
      background: var(--color-ink);
    }
  }

  @media (min-width: 40rem) {
    .heading {
      grid-template-columns: minmax(0, 1fr) minmax(12rem, 0.8fr);
      gap: 2rem;
    }
  }

  @media (min-width: 48rem) {
    .grid {
      grid-template-columns: 1.1fr 1.25fr 0.85fr 1.25fr;
    }

    .footer-module {
      padding: 1.25rem 1rem;
    }

    .footer-module:first-child {
      padding-left: 0;
      box-shadow: -1.5rem 0 0 transparent;
    }

    .footer-module:last-child {
      padding-right: 0;
      box-shadow: 1.5rem 0 0 transparent;
    }

    .footer-module + .footer-module {
      border-top: 0;
      border-inline-start: 1px solid var(--color-rule);
    }
  }

  @media (hover: hover) and (min-width: 48rem) {
    .footer-module:first-child:hover {
      box-shadow: -1.5rem 0 0 var(--color-ink);
    }

    .footer-module:last-child:hover {
      box-shadow: 1.5rem 0 0 var(--color-ink);
    }
  }
</style>

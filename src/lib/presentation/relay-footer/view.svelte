<script lang="ts">
  import PaperEdge from '$lib/components/layout/paper-edge.svelte'

  import { footer_barcode, footer_index } from './content'
  import FooterSignalMonitor from './signal-monitor.svelte'

  interface Props {
    visible: boolean
  }

  /* oxlint-disable prefer-const -- Visibility is owned by the footer observer. */
  let { visible }: Props = $props()
</script>

{#snippet footer_label(text: string)}
  <p class="micro-label footer-label">{text}</p>
{/snippet}

<div class="footer-inner">
  <PaperEdge side="top" />
  <div class="deck footer-deck footer-content">
    <div class="heading">
      <div>
        {@render footer_label('Archive transmission')}
        <p class="title font-serif">Caelyreth relay station</p>
      </div>
      <p class="statement">
        Field notes, status signals, and future paths held at the edge of
        the station.
      </p>
    </div>
    <div class="grid">
      <section class="footer-module">
        {@render footer_label('Site map')}
        <ul class="sitemap" aria-label="Placeholder site map">
          {#each footer_index as item}<li>{item}</li>{/each}
        </ul>
        <p class="detail">Placeholder index only</p>
      </section>
      <section class="footer-module">
        {@render footer_label('Archive marker')}
        <div aria-hidden="true" class="barcode">
          {#each footer_barcode as width}<span style:--bar-width={width}
            ></span>{/each}
        </div>
        <p class="detail">RBK / 2026 / YU</p>
      </section>
      <div aria-hidden="true" class="footer-module base-module">
        <svg class="base-mark" viewBox="0 0 512 512" fill="none"
          ><path
            d="M256 32v448M32 256h448M97.6 97.6l316.8 316.8m0-316.8L97.6 414.4"
            stroke="currentColor"
            stroke-width="48"
          /></svg
        >
      </div>
      <section class="footer-module">
        <FooterSignalMonitor is_active={visible} />
      </section>
    </div>
    <div class="tail">
      <span>© 2026 Yu</span><span>Rainbook program - Caelyreth relay</span
      ><span>Station log / no public uplink</span>
    </div>
  </div>
</div>

<style>
  .footer-inner {
    --footer-hover-outset: 1.5rem;
    --footer-surface: var(--color-footer-surface);
    --footer-ink: var(--color-paper);
    --footer-secondary: color-mix(
      in oklab,
      var(--footer-ink) 78%,
      var(--footer-surface)
    );
    --footer-muted: color-mix(
      in oklab,
      var(--footer-ink) 62%,
      var(--footer-surface)
    );
    --footer-rule: color-mix(
      in oklab,
      var(--footer-ink) 42%,
      var(--footer-surface)
    );
    --paper-edge-surface: var(--footer-surface);
    width: 100%;
    max-width: var(--frame-measure);
    margin: 0 auto;
  }

  .footer-content {
    padding: 1.5rem var(--inline-gutter) 1.25rem;
    color: var(--footer-ink);
    background-color: var(--footer-surface);
  }

  .heading {
    display: grid;
    gap: 1rem;
    align-items: center;
    padding-bottom: 1.5rem;
  }

  .footer-label {
    margin: 0;
    color: var(--footer-secondary);
    letter-spacing: 0.12em;
  }

  .title {
    margin: 0.5rem 0 0;
    color: var(--footer-ink);
    font-size: 1.25rem;
    font-weight: 700;
    line-height: 1.1;
  }

  .statement {
    max-width: 36ch;
    margin: 0;
    color: var(--footer-secondary);
    font-size: 0.75rem;
    line-height: 1.55;
  }

  .grid {
    display: grid;
    grid-template-columns: minmax(0, 1fr);
    border-block: 1px solid var(--footer-rule);
  }

  .footer-module {
    --primary: var(--footer-ink);
    --secondary: var(--footer-secondary);
    --muted: var(--footer-muted);
    --accent: var(--footer-ink);
    --rule: var(--footer-rule);
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
    border-top: 1px solid var(--footer-rule);
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

  .base-mark {
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
    color: var(--footer-secondary);
    font-size: 0.625rem;
    line-height: 1.3;
  }

  @media (hover: hover) {
    .footer-module:hover {
      --primary: var(--footer-surface);
      --secondary: var(--footer-surface);
      --muted: color-mix(
        in oklab,
        var(--footer-surface) 68%,
        var(--footer-ink)
      );
      --accent: var(--footer-surface);
      --rule: color-mix(
        in oklab,
        var(--footer-surface) 65%,
        var(--footer-ink)
      );
      color: var(--footer-surface);
      background: var(--footer-ink);
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
      position: relative;
      padding-left: 0;
      box-shadow: calc(-1 * var(--footer-hover-outset)) 0 0 transparent;
    }

    .footer-module:last-child {
      position: relative;
      padding-right: 0;
      box-shadow: var(--footer-hover-outset) 0 0 transparent;
    }

    .footer-module + .footer-module {
      border-top: 0;
      border-inline-start: 1px solid var(--footer-rule);
    }
  }

  @media (hover: hover) and (min-width: 48rem) {
    .footer-module:first-child:hover {
      box-shadow: calc(-1 * var(--footer-hover-outset)) 0 0
        var(--footer-ink);
    }

    .footer-module:first-child:hover::before,
    .footer-module:first-child:hover::after,
    .footer-module:last-child:hover::before,
    .footer-module:last-child:hover::after {
      position: absolute;
      z-index: 1;
      width: var(--footer-hover-outset);
      height: 1px;
      pointer-events: none;
      content: '';
      background-color: var(--footer-rule);
    }

    .footer-module:first-child:hover::before,
    .footer-module:first-child:hover::after {
      left: calc(-1 * var(--footer-hover-outset));
    }

    .footer-module:last-child:hover::before,
    .footer-module:last-child:hover::after {
      right: calc(-1 * var(--footer-hover-outset));
    }

    .footer-module:first-child:hover::before,
    .footer-module:last-child:hover::before {
      top: -1px;
    }

    .footer-module:first-child:hover::after,
    .footer-module:last-child:hover::after {
      bottom: -1px;
    }

    .footer-module:last-child:hover {
      box-shadow: var(--footer-hover-outset) 0 0 var(--footer-ink);
    }
  }
</style>

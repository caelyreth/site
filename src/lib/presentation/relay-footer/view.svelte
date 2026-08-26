<script lang="ts">
  import { page } from '$app/state'
  import PaperEdge from '$lib/components/layout/paper-edge.svelte'
  import type { EntryLink } from '$lib/content/entries'
  import { get_site_config } from '$lib/content/site'
  import { site_href } from '$lib/navigation/path'

  import FooterSignalMonitor from './signal-monitor.svelte'

  interface Props {
    entries: readonly EntryLink[]
    visible: boolean
  }

  let { entries, visible }: Props = $props()
  const site = get_site_config()
  const footer = $derived(site.current.footer)
  const footer_qr = $derived((page.data as { footer_qr: string }).footer_qr)

  function is_current(href: string) {
    const route = page.route.id
    return route === href || (href !== '/' && route?.startsWith(`${href}/`))
  }
</script>

{#snippet footer_label(text: string)}
  <p class="micro-label footer-label">{text}</p>
{/snippet}

<div class="footer-inner">
  <PaperEdge side="top" />
  <div class="deck footer-deck footer-content">
    <div class="heading">
      <div>
        {@render footer_label(footer.label)}
        <h2 class="title">{footer.title}</h2>
      </div>
      <div class="statement-row">
        <p class="statement">
          {footer.statement}
        </p>
        <span aria-hidden="true" class="statement-mark"></span>
      </div>
    </div>
    <div class="grid">
      <section class="footer-module" aria-label={footer.index_label}>
        {@render footer_label(footer.index_label)}
        <nav aria-label={footer.index_label}>
          <ul class="sitemap">
            {#each footer.navigation as item}
              <li>
                <a
                  aria-current={is_current(item.href) ? 'page' : undefined}
                  href={site_href(item.href)}>{item.label}</a
                >
              </li>
            {/each}
            <li>
              <a href={site_href(footer.sitemap_href)} data-sveltekit-reload
                >{footer.sitemap_label}</a
              >
            </li>
            <li>
              <a href={site_href(footer.atom_href)} data-sveltekit-reload
                >{footer.atom_label}</a
              >
            </li>
            <li>
              <a href={site_href(footer.rss_href)} data-sveltekit-reload
                >{footer.rss_label}</a
              >
            </li>
          </ul>
        </nav>
      </section>
      <section
        class="footer-module footer-archive"
        aria-label={footer.archive_label}
      >
        {@render footer_label(footer.archive_label)}
        <div class="archive-mark">
          <div aria-hidden="true" class="qr" data-nosnippet="">
            {@html footer_qr}
          </div>
          <div class="archive-copy">
            <p class="micro-label qr-label">{footer.qr_label}</p>
            <p class="archive-path" data-nosnippet="">
              {page.url.pathname}
            </p>
            <p class="detail archive-detail" data-nosnippet="">
              {footer.archive_detail}
            </p>
          </div>
        </div>
      </section>
      <section class="footer-module">
        <FooterSignalMonitor
          {entries}
          is_active={visible}
          signal={footer.signal}
        />
      </section>
    </div>
    <div class="tail">
      <span>{footer.copyright}</span>
      <a class="tail-link" href={footer.license_href}
        >{footer.license_label}</a
      >
      <span class="tail-signature">{footer.signature}</span>
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
    --color-selection-surface: var(--color-footer-selection-surface);
    --color-selection-ink: var(--color-footer-selection-ink);
    padding: 1.5rem var(--inline-gutter) 1rem;
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
    font-family: var(--font-stack-serif);
    font-size: 1.25rem;
    font-weight: 700;
    line-height: 1.1;
  }

  .statement-row {
    display: flex;
    align-items: center;
    gap: 0.75rem;
  }

  .statement {
    flex: 0 1 36ch;
    max-width: 36ch;
    margin: 0;
    color: var(--footer-secondary);
    font-size: 0.75rem;
    line-height: 1.55;
  }

  .statement-mark {
    display: block;
    width: 1.5rem;
    flex: none;
    aspect-ratio: 1;
    background-color: var(--footer-secondary);
    -webkit-mask: url('/favicon.svg') center / contain no-repeat;
    mask: url('/favicon.svg') center / contain no-repeat;
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
    grid-template-columns: repeat(2, minmax(0, 1fr));
    width: 100%;
    gap: 0.5rem 1rem;
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

  .sitemap a {
    color: inherit;
    text-decoration: none;
    transition: color var(--dur-micro) var(--ease-out);
  }

  .sitemap a:focus-visible {
    outline: 2px solid currentcolor;
    outline-offset: 0.2rem;
  }

  @media (hover: hover) {
    .sitemap a:hover {
      color: var(--primary);
    }
  }

  .archive-mark {
    display: grid;
    grid-template-columns: var(--archive-qr-size) minmax(0, 1fr);
    width: 100%;
    margin-top: auto;
    gap: 0.875rem;
    align-items: end;
  }

  .qr {
    display: grid;
    width: var(--archive-qr-size);
    padding: 0.25rem;
    color: var(--primary);
    aspect-ratio: 1;
    box-shadow: 0 0 0 1px var(--rule);
    place-items: center;
  }

  .qr :global(svg) {
    display: block;
    width: 100%;
    height: 100%;
  }

  .qr :global(path) {
    stroke: currentColor;
  }

  .archive-copy {
    display: flex;
    min-width: 0;
    min-height: var(--archive-qr-size);
    padding-bottom: 0.1rem;
    flex-direction: column;
    align-items: flex-start;
  }

  .qr-label {
    margin: 0;
    color: var(--muted);
    letter-spacing: 0.1em;
  }

  .archive-path {
    width: 100%;
    margin: 0.375rem 0 0;
    overflow: hidden;
    color: var(--secondary);
    font-family: var(--font-stack-mono);
    font-size: 0.6875rem;
    line-height: 1.3;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .archive-detail {
    margin: auto 0 0;
  }

  .detail {
    margin: auto 0 0;
    color: var(--muted);
    font-size: 0.625rem;
    letter-spacing: 0.04em;
    line-height: 1.3;
    text-transform: uppercase;
  }

  .footer-archive {
    --archive-qr-size: 4.75rem;
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

  .tail-link {
    color: inherit;
    text-decoration: underline;
    text-decoration-thickness: 1px;
    text-underline-offset: 0.2em;
  }

  .tail-signature {
    margin-inline-start: auto;
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

  @media (width >= 40rem) {
    .heading {
      grid-template-columns: minmax(0, 1fr) minmax(12rem, 0.8fr);
      gap: 2rem;
    }
  }

  @media (width < 40rem) {
    .statement-row {
      width: 100%;
      justify-content: space-between;
    }
  }

  @media (width >= 48rem) {
    .grid {
      grid-template-columns: repeat(3, minmax(0, 1fr));
    }

    .footer-module {
      padding: 1.25rem 1rem;
    }

    .footer-archive {
      --archive-qr-size: 5rem;
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

  @media (width < 24rem) {
    .footer-archive {
      --archive-qr-size: 4.25rem;
    }

    .archive-mark {
      gap: 0.7rem;
    }
  }

  @media (hover: hover) and (width >= 48rem) {
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

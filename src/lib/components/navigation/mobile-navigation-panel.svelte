<script lang="ts">
  import { page } from '$app/state'
  import { get_site_config } from '$lib/content/site'
  import { site_href } from '$lib/navigation/path'

  import ThemeToggle from './menu/theme-toggle.svelte'

  interface Props {
    on_close: () => void
  }

  const { on_close }: Props = $props()
  const site = get_site_config()

  function is_current(path: string) {
    const route = page.route.id
    return route === path || (path !== '/' && route?.startsWith(`${path}/`))
  }
</script>

<div class="navigation-panel">
  <nav aria-label="站点导航">
    <p class="label">站点导航</p>
    <ul class="entries">
      {#each site.current.menu.entries as entry}
        <li>
          {#if entry.href}
            <a
              aria-current={is_current(entry.href) ? 'page' : undefined}
              href={site_href(entry.href)}
              onclick={on_close}
            >
              <span aria-hidden="true" class="marker"></span>
              <span class="title">{entry.title}</span>
              <span aria-hidden="true" class="detail" data-nosnippet=""
                >{entry.code}</span
              >
            </a>
          {:else}
            <span aria-disabled="true" class="entry unavailable">
              <span aria-hidden="true" class="marker"></span>
              <span class="title">{entry.title}</span>
              <span aria-hidden="true" class="detail" data-nosnippet=""
                >{entry.code}</span
              >
            </span>
          {/if}
        </li>
      {/each}
    </ul>
  </nav>

  <section aria-label={site.current.menu.theme_label} class="display">
    <p class="label">{site.current.menu.theme_label}</p>
    <div class="theme-control">
      <ThemeToggle fill />
    </div>
  </section>
</div>

<style>
  .navigation-panel {
    display: grid;
    min-width: 0;
    gap: 0.875rem;
  }

  .label {
    margin: 0 0 0.5rem;
    color: var(--color-muted);
    font-family: var(--font-stack-mono);
    font-size: 0.625rem;
    font-weight: 600;
    letter-spacing: 0.08em;
    line-height: 1;
    text-transform: uppercase;
  }

  .entries {
    margin: 0;
    padding: 0;
    list-style: none;
  }

  .entries li {
    min-width: 0;
  }

  .entry,
  .entries a {
    display: flex;
    min-width: 0;
    min-height: 2.125rem;
    padding-inline: 0.25rem;
    align-items: center;
    gap: 0.625rem;
    color: var(--color-text-secondary);
    text-decoration: none;
    transition:
      color var(--dur-micro) var(--ease-out),
      background-color var(--dur-micro) var(--ease-out);
  }

  .marker {
    width: 0.375rem;
    height: 2px;
    flex: none;
    background: var(--color-guide);
  }

  .title {
    min-width: 0;
    flex: 1;
    overflow: hidden;
    font-size: 0.8125rem;
    line-height: 1.3;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .detail {
    flex: none;
    color: var(--color-muted);
    font-family: var(--font-stack-mono);
    font-size: 0.5625rem;
    font-weight: 600;
    letter-spacing: 0.06em;
    line-height: 1;
    white-space: nowrap;
  }

  .entries a[aria-current='page'] {
    color: var(--color-text);
  }

  .entries a[aria-current='page'] .marker {
    background: var(--color-text);
  }

  .unavailable {
    opacity: 0.48;
  }

  .display {
    padding-top: 0.875rem;
    border-top: 1px solid var(--color-rule);
  }

  .theme-control {
    --theme-toggle-size: 2.375rem;
    --toggle-rule: var(--color-rule);

    overflow: hidden;
    border: 1px solid var(--color-rule);
  }

  .entries a:hover,
  .entries a:focus-visible {
    color: var(--color-text);
    background-color: color-mix(
      in oklab,
      var(--color-text) 5%,
      transparent
    );
  }

  .entries a:hover .marker,
  .entries a:focus-visible .marker {
    background: var(--color-text);
  }

  .entries a:focus-visible {
    outline: 2px solid var(--color-focus);
    outline-offset: 0.125rem;
  }
</style>

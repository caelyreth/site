<script lang="ts">
  import { page } from '$app/state'
  import { get_site_config } from '$lib/content/site'
  import { site_href } from '$lib/navigation/path'

  import { menu_slip_entrances } from './content'

  interface Props {
    is_closing: boolean
    is_open: boolean
    on_navigate: () => void
  }

  const { is_closing, is_open, on_navigate }: Props = $props()
  const site = get_site_config()
  const previews = $derived(
    site.current.menu.entries.map((entry, index) => ({
      ...entry,
      entrance: menu_slip_entrances[index]!,
      index: String(index + 1).padStart(3, '0'),
    })),
  )
  const primary_previews = $derived(previews.slice(0, 4))
  const utility_previews = $derived(previews.slice(4))

  function is_primary_navigation(event: MouseEvent) {
    return (
      event.button === 0 &&
      ![
        event.defaultPrevented,
        event.metaKey,
        event.altKey,
        event.ctrlKey,
        event.shiftKey,
      ].some(Boolean)
    )
  }

  function close_on_navigation(event: MouseEvent) {
    if (is_primary_navigation(event)) on_navigate()
  }

  function is_current(path: string) {
    const route = page.route.id
    return route === path || (path !== '/' && route?.startsWith(`${path}/`))
  }
</script>

<div
  class:is-closing={is_closing}
  class:is-open={is_open}
  class="collection-previews"
>
  <div class="slip-bundle">
    {#snippet slip(item: (typeof previews)[number], compact = false)}
      {#snippet contents()}
        <span class="slip-heading">
          <span
            aria-hidden="true"
            class="micro-label slip-code"
            data-nosnippet="">{item.code}</span
          >
          <span class="slip-title">{item.title}</span>
        </span>
        <span class="slip-register">
          <span
            aria-hidden="true"
            class="micro-label slip-detail"
            data-nosnippet="">{item.detail}</span
          >
          <span class="slip-note">{item.note}</span>
          <span aria-hidden="true" class="slip-trace" data-nosnippet="">
            {#each Array(7) as _}
              <i></i>
            {/each}
          </span>
        </span>
        <span aria-hidden="true" class="slip-index" data-nosnippet=""
          >{item.index}</span
        >
      {/snippet}
      {#if item.href}
        <a
          aria-current={is_current(item.href) ? 'page' : undefined}
          aria-label={item.title}
          class="slip"
          class:compact
          href={site_href(item.href)}
          onclick={close_on_navigation}
          style:--slip-enter-delay={item.entrance.enter_delay}
          style:--slip-enter-x={item.entrance.enter_x}
          style:--slip-enter-y={item.entrance.enter_y}
        >
          {@render contents()}
        </a>
      {:else}
        <span
          aria-hidden="true"
          class="slip"
          class:compact
          data-nosnippet=""
          style:--slip-enter-delay={item.entrance.enter_delay}
          style:--slip-enter-x={item.entrance.enter_x}
          style:--slip-enter-y={item.entrance.enter_y}
        >
          {@render contents()}
        </span>
      {/if}
    {/snippet}

    <div class="primary-slips">
      {#each primary_previews as item}
        {@render slip(item)}
      {/each}
    </div>
    <div class="utility-slips">
      {#each utility_previews as item}
        {@render slip(item, true)}
      {/each}
    </div>
  </div>
</div>

<style>
  .collection-previews {
    position: absolute;
    inset: 0;
    z-index: 3;
    display: grid;
    padding-inline: var(--menu-inset-left) var(--menu-inset-right);
    place-items: center;
    pointer-events: none;
  }

  .slip-bundle {
    display: grid;
    width: min(100%, 52rem);
    gap: 1.75rem;
    pointer-events: auto;
    transform: translateY(-6%) rotate(-1.5deg);
    transform-origin: center;
  }

  .primary-slips {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: clamp(0.75rem, 1.25vw, 1rem);
  }

  .utility-slips {
    display: flex;
    justify-content: center;
    gap: 0.5rem;
  }

  .slip {
    position: relative;
    overflow: hidden;
    box-sizing: border-box;
    display: flex;
    min-width: 0;
    min-height: clamp(7.25rem, 11vw, 9.25rem);
    padding: clamp(0.75rem, 1.3vw, 1rem);
    border: 1px solid transparent;
    color: var(--slip-ink);
    background-color: var(--slip-surface);
    align-items: flex-start;
    flex-direction: column;
    justify-content: space-between;
    transform: translateY(var(--slip-offset-y, 0));
    white-space: nowrap;
    pointer-events: auto;
    text-decoration: none;
    transition:
      color var(--dur-short) var(--ease-out),
      background-color var(--dur-short) var(--ease-out);
  }

  .slip:focus-visible {
    outline: 2px solid var(--color-focus);
    outline-offset: 0.25rem;
  }

  .slip-code {
    letter-spacing: 0.11em;
    opacity: 0.7;
  }

  .slip-heading,
  .slip-register {
    position: relative;
    z-index: 1;
    display: grid;
    justify-items: start;
  }

  .slip-heading {
    gap: 0.5rem;
  }

  .slip-register {
    width: min(100%, 17rem);
    gap: 0.3rem;
    padding-top: 0.3rem;
  }

  .slip-title {
    min-width: 0;
    font-family: var(--font-stack-serif);
    font-size: clamp(1.4rem, 2.15vw, 2.1rem);
    font-style: normal;
    font-weight: 700;
    letter-spacing: 0;
    line-height: 0.9;
  }

  .slip-detail {
    line-height: 1.3;
    opacity: 0.65;
  }

  .slip-note {
    max-width: 100%;
    font-size: 0.75rem;
    line-height: 1.5;
    opacity: 0.75;
    white-space: normal;
  }

  .slip-trace {
    display: flex;
    width: 100%;
    margin-top: 0.3rem;
    align-items: center;
    gap: 0.25rem;
    opacity: 0.55;
  }

  .slip-trace::before {
    width: 1.75rem;
    height: 1px;
    content: '';
    background-color: currentColor;
  }

  .slip-trace i {
    display: block;
    width: 1px;
    height: 0.35rem;
    background-color: currentColor;
  }

  .slip-trace i:nth-child(2n) {
    height: 0.6rem;
  }

  .slip-index {
    position: absolute;
    right: clamp(0.75rem, 1.3vw, 1rem);
    bottom: clamp(0.45rem, 0.8vw, 0.75rem);
    z-index: 0;
    color: currentColor;
    font-family: var(--font-stack-serif);
    font-size: clamp(4.5rem, 7vw, 6.75rem);
    font-weight: 700;
    line-height: 0.75;
    opacity: 0.1;
  }

  .primary-slips .slip:nth-child(2) {
    --slip-offset-y: 0.75rem;
  }

  .primary-slips .slip:nth-child(3) {
    --slip-offset-y: 0.5rem;
  }

  .primary-slips .slip:nth-child(4) {
    --slip-offset-y: 1.25rem;
  }

  .slip.compact {
    --slip-offset-y: 0;
    width: max-content;
    max-width: 100%;
    min-height: 0;
    margin-top: 1.75rem;
    padding: 0.55rem 0.8rem;
    background: var(--slip-surface);
    align-items: center;
    justify-content: center;
  }

  .slip.compact .slip-heading {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.55rem;
  }

  .slip.compact .slip-title {
    font-family: var(--font-stack-serif);
    font-size: clamp(0.9375rem, 1.25vw, 1.125rem);
    font-weight: 700;
    letter-spacing: 0;
    line-height: 1;
  }

  .slip.compact .slip-register,
  .slip.compact .slip-index {
    display: none;
  }

  @media (hover: hover) {
    a.slip:hover {
      color: var(--slip-surface);
      background-color: var(--menu-highlight);
    }
  }

  @keyframes slip-enter {
    from {
      opacity: 0;
      transform: translate3d(
        var(--slip-enter-x),
        calc(var(--slip-enter-y) + var(--slip-offset-y, 0)),
        0
      );
    }
    to {
      opacity: 1;
      transform: translateY(var(--slip-offset-y, 0));
    }
  }

  @keyframes slip-leave {
    to {
      opacity: 0;
      transform: translate3d(
        var(--slip-enter-x),
        calc(var(--slip-enter-y) + var(--slip-offset-y, 0)),
        0
      );
    }
  }

  .collection-previews.is-open:not(.is-closing) .slip {
    animation: slip-enter var(--dur-long) var(--ease-out)
      var(--slip-enter-delay) backwards;
  }

  .collection-previews.is-closing .slip {
    animation: slip-leave var(--dur-long) var(--ease-out) both;
  }

  @media (prefers-reduced-motion: reduce) {
    .collection-previews.is-open .slip,
    .slip {
      animation: none;
      transition: none;
    }
  }
</style>

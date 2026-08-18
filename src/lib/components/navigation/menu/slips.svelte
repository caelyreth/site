<script lang="ts">
  import { page } from '$app/state'
  import { get_site_config } from '$lib/content/site'
  import { site_href } from '$lib/navigation/path'

  import { menu_preview_layouts } from './content'

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
      layout: menu_preview_layouts[index]!,
    })),
  )

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
  {#each previews as item}
    {#snippet contents()}
      <span
        aria-hidden="true"
        class="micro-label slip-code"
        data-nosnippet="">{item.code}</span
      >
      <span class="slip-title">{item.title}</span>
      <span
        aria-hidden="true"
        class="micro-label slip-detail"
        data-nosnippet="">{item.detail}</span
      >
    {/snippet}
    {#if item.href}
      <a
        aria-current={is_current(item.href) ? 'page' : undefined}
        aria-label={item.title}
        class="slip"
        href={site_href(item.href)}
        onclick={close_on_navigation}
        style:--slip-bottom={item.layout.bottom}
        style:--slip-enter-delay={item.layout.enter_delay}
        style:--slip-enter-x={item.layout.enter_x}
        style:--slip-enter-y={item.layout.enter_y}
        style:--slip-left={item.layout.left}
        style:--slip-right={item.layout.right}
        style:--slip-rotation={item.layout.rotation}
        style:--slip-top={item.layout.top}
      >
        {@render contents()}
      </a>
    {:else}
      <span
        aria-hidden="true"
        class="slip"
        data-nosnippet=""
        style:--slip-bottom={item.layout.bottom}
        style:--slip-enter-delay={item.layout.enter_delay}
        style:--slip-enter-x={item.layout.enter_x}
        style:--slip-enter-y={item.layout.enter_y}
        style:--slip-left={item.layout.left}
        style:--slip-right={item.layout.right}
        style:--slip-rotation={item.layout.rotation}
        style:--slip-top={item.layout.top}
      >
        {@render contents()}
      </span>
    {/if}
  {/each}
</div>

<style>
  .collection-previews {
    position: absolute;
    inset: 0;
    z-index: 3;
    pointer-events: none;
  }

  .slip {
    position: absolute;
    top: var(--slip-top);
    right: var(--slip-right);
    bottom: var(--slip-bottom);
    left: var(--slip-left);
    display: flex;
    width: max-content;
    max-width: calc(
      100vw - var(--menu-inset-left) - var(--menu-inset-right)
    );
    min-width: min(
      14rem,
      calc(100vw - var(--menu-inset-left) - var(--menu-inset-right))
    );
    padding: 0.9rem 1rem 1rem;
    border: 1px solid transparent;
    color: var(--slip-ink);
    background-color: var(--slip-surface);
    align-items: flex-start;
    flex-direction: column;
    gap: 0.5rem;
    transform: rotate(var(--slip-effective-rotation, var(--slip-rotation)));
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

  .slip-title {
    min-width: 0;
    font-family: var(--font-stack-serif);
    font-size: clamp(1.45rem, 3vw, 2.5rem);
    font-style: normal;
    font-weight: 700;
    letter-spacing: 0;
    line-height: 0.9;
  }

  .slip-detail {
    line-height: 1.3;
    opacity: 0.65;
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
      transform: translate3d(var(--slip-enter-x), var(--slip-enter-y), 0)
        rotate(var(--slip-effective-rotation, var(--slip-rotation)));
    }
    to {
      opacity: 1;
      transform: translate3d(0, 0, 0)
        rotate(var(--slip-effective-rotation, var(--slip-rotation)));
    }
  }

  @keyframes slip-leave {
    to {
      opacity: 0;
      transform: translate3d(var(--slip-enter-x), var(--slip-enter-y), 0)
        rotate(var(--slip-effective-rotation, var(--slip-rotation)));
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

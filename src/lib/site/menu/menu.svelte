<script lang="ts">
  import { lock_page_scroll } from '$lib/site/page-lock'
  import { flushSync as flush_sync } from 'svelte'

  import MenuPanel from './panel.svelte'

  let dialog: HTMLDialogElement | undefined
  let menu_open = $state(false)
  let closing = $state(false)
  let close_timer: number | undefined
  const close_fallback = 500

  function clear_close_timer() {
    if (close_timer !== undefined) window.clearTimeout(close_timer)
    close_timer = undefined
  }

  function manage_dialog(node: HTMLDialogElement) {
    dialog = node

    return () => {
      if (dialog === node) dialog = undefined
      clear_close_timer()
    }
  }

  function open_menu() {
    if (!dialog || dialog.open) return

    closing = false
    menu_open = true
    dialog.showModal()
  }

  function request_close() {
    if (!dialog?.open || closing) return

    flush_sync(() => {
      closing = true
    })
    close_timer = window.setTimeout(() => {
      if (dialog?.open) dialog.close()
    }, close_fallback)
  }

  function handle_cancel(event: Event) {
    event.preventDefault()
    request_close()
  }

  function handle_close() {
    clear_close_timer()
    closing = false
    menu_open = false
  }

  function handle_animation_end(event: AnimationEvent) {
    if (
      event.target !== dialog ||
      event.animationName !== 'menu-leave' ||
      !closing
    ) {
      return
    }

    dialog?.close()
  }

  // Keep the page fixed for the full modal lifecycle, including its exit.
  $effect(() => {
    if (!menu_open) return
    return lock_page_scroll()
  })
</script>

<button
  type="button"
  class="trigger"
  aria-controls="site-menu"
  aria-expanded={menu_open}
  aria-haspopup="dialog"
  aria-label={menu_open ? 'Close menu' : 'Open menu'}
  title={menu_open ? 'Close menu' : 'Open menu'}
  onclick={open_menu}
>
  <span class="label">Index</span>
  <span class="i-ri-menu-line" aria-hidden="true"></span>
</button>

<dialog
  {@attach manage_dialog}
  id="site-menu"
  class="menu"
  class:is-closing={closing}
  aria-label="Site menu"
  oncancel={handle_cancel}
  onclose={handle_close}
  onanimationend={handle_animation_end}
>
  <button
    type="button"
    class="dismiss"
    aria-label="Close menu"
    tabindex="-1"
    onpointerdown={request_close}
    onclick={request_close}
  ></button>

  <MenuPanel
    is_closing={closing}
    is_open={menu_open}
    on_select={request_close}
  />
</dialog>

<style>
  .trigger {
    position: relative;
    display: inline-flex;
    min-width: 4.75rem;
    height: var(--header-block-size);
    flex: none;
    padding-inline: 0.75rem;
    cursor: pointer;
    border: 0;
    border-inline-start: 1px solid var(--header-latch-rule);
    color: var(--header-ink);
    background-color: transparent;
    align-items: center;
    gap: 0.5rem;
    justify-content: center;
    transition: background-color var(--dur-micro) var(--ease-out);
  }

  .trigger span {
    flex: none;
  }

  .label {
    font-size: 0.6875rem;
    font-weight: 500;
    letter-spacing: 0.08em;
    line-height: 1;
  }

  .trigger .i-ri-menu-line {
    width: 1rem;
    height: 1rem;
    opacity: 0.72;
    transition: opacity var(--dur-micro) var(--ease-out);
  }

  @media (hover: hover) {
    .trigger:hover {
      background-color: var(--header-latch-hover);
    }

    .trigger:hover .i-ri-menu-line {
      opacity: 1;
    }
  }

  .trigger:focus-visible {
    outline: 2px solid var(--color-focus);
    outline-offset: -2px;
  }

  @media (max-width: 24rem) {
    .trigger {
      min-width: 3.5rem;
      padding-inline: 0.75rem;
    }

    .label {
      position: absolute;
      width: 1px;
      height: 1px;
      overflow: hidden;
      clip: rect(0 0 0 0);
      clip-path: inset(50%);
      white-space: nowrap;
    }
  }

  .menu {
    --menu-highlight: var(--color-text-link-dark);
    --slip-surface: var(--color-ink);
    --slip-ink: var(--color-paper);
    --drift-ink: var(--color-ink);
    --focus-duration: 600ms;

    position: fixed;
    inset: 0;
    box-sizing: border-box;
    width: 100vw;
    min-width: 100vw;
    max-width: 100vw;
    height: 100dvh;
    min-height: 100dvh;
    max-height: 100dvh;
    margin: 0;
    padding: 0;
    overflow: hidden;
    border: 0;
    color: var(--color-text);
    background-color: color-mix(
      in oklab,
      var(--color-paper) 88%,
      transparent
    );
    backdrop-filter: blur(5px);
  }

  :global(.dark) .menu {
    --menu-highlight: var(--color-text-link-light);
  }

  .menu::before,
  .menu::after {
    position: absolute;
    inset: 0;
    z-index: 0;
    pointer-events: none;
    content: '';
  }

  .menu::before {
    opacity: var(--noise-menu-opacity);
    background-image: var(--noise-tile);
    background-size: var(--noise-size);
  }

  .menu::after {
    opacity: 0.1;
    background-image:
      radial-gradient(
        circle at 1px 1px,
        var(--color-paper) 0 0.75px,
        transparent 0.9px
      ),
      radial-gradient(
        circle at 1px 1px,
        var(--color-paper) 0 0.55px,
        transparent 0.75px
      );
    background-position:
      0 0,
      8px 11px;
    background-size:
      19px 23px,
      29px 31px;
    mix-blend-mode: screen;
  }

  .menu::backdrop {
    background: color-mix(in oklab, var(--color-ink) 20%, transparent);
  }

  .menu.is-closing::backdrop {
    background: transparent;
    transition: background-color var(--dur-long) var(--ease-out);
  }

  .dismiss {
    position: absolute;
    inset: 0;
    z-index: 1;
    width: 100%;
    height: 100%;
    padding: 0;
    cursor: default;
    border: 0;
    background: transparent;
  }

  @keyframes menu-leave {
    to {
      opacity: 0;
    }
  }

  @keyframes menu-focus {
    from {
      backdrop-filter: blur(0);
    }
    to {
      backdrop-filter: blur(5px);
    }
  }

  .menu[open]:not(.is-closing) {
    animation: menu-focus var(--focus-duration) var(--ease-in-out) both;
  }

  .menu.is-closing {
    animation: menu-leave var(--dur-long) var(--ease-out) both;
  }

  @media (prefers-reduced-motion: reduce) {
    .menu {
      backdrop-filter: none;
    }

    .menu[open]:not(.is-closing) {
      animation: none;
    }
  }
</style>

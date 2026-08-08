<script lang="ts">
  import { flushSync as flush_sync } from 'svelte'

  import MenuStage from './menu-stage.svelte'

  let dialog: HTMLDialogElement | undefined
  let menu_open = $state(false)
  let closing = $state(false)
  let close_timer: number | undefined
  const close_fallback = 500

  // MARK: - dialog lifecycle
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

  // MARK: - scroll lock
  $effect(() => {
    if (!menu_open) return

    const root = document.documentElement
    const previous_padding_right = root.style.paddingRight
    const scrollbar_width = window.innerWidth - root.clientWidth
    if (scrollbar_width > 0) {
      root.style.paddingRight = `${scrollbar_width}px`
    }
    root.classList.add('station-scroll-locked')

    return () => {
      root.classList.remove('station-scroll-locked')
      root.style.paddingRight = previous_padding_right
    }
  })
</script>

<button
  type="button"
  class="trigger"
  aria-controls="station-menu"
  aria-expanded={menu_open}
  aria-haspopup="dialog"
  aria-label={menu_open ? 'Close station menu' : 'Open station menu'}
  title={menu_open ? 'Close menu' : 'Open menu'}
  onclick={open_menu}
>
  <span class="i-ri-menu-4-line" aria-hidden="true"></span>
</button>

<dialog
  {@attach manage_dialog}
  id="station-menu"
  class="menu"
  class:is-closing={closing}
  aria-label="Station menu"
  oncancel={handle_cancel}
  onclose={handle_close}
  onanimationend={handle_animation_end}
>
  <button
    type="button"
    class="dismiss"
    aria-label="Close station menu"
    tabindex="-1"
    onpointerdown={request_close}
    onclick={request_close}
  ></button>

  <MenuStage on_select={request_close} />
</dialog>

<style>
  .trigger {
    display: grid;
    width: 2.25rem;
    height: 2.25rem;
    flex: none;
    padding: 0;
    cursor: pointer;
    border: 1px solid
      color-mix(in oklab, var(--header-ink) 35%, transparent);
    color: var(--header-ink);
    background: transparent;
    place-items: center;
    transition:
      border-color var(--dur-micro) var(--ease-out),
      color var(--dur-micro) var(--ease-out),
      transform var(--dur-micro) var(--ease-out);
  }

  .trigger :global(span) {
    width: 1.125rem;
    height: 1.125rem;
  }

  @media (hover: hover) {
    .trigger:hover {
      border-color: var(--header-ink);
      color: var(--color-accent);
    }
  }

  .trigger:active {
    transform: translateY(1px);
  }

  .menu {
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
    color: var(--color-ink);
    background-color: color-mix(
      in oklab,
      var(--color-paper) 88%,
      transparent
    );
    backdrop-filter: blur(5px);
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
    opacity: 0.15;
    background-image: var(--noise-tile);
    background-size: 96px;
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

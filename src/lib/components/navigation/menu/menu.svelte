<script lang="ts">
  import { lock_page_scroll } from '$lib/browser/page-lock'
  import { flushSync as flush_sync } from 'svelte'

  import { get_menu_controller } from './controller'
  import MenuPanel from './panel.svelte'

  interface Props {
    id?: string
  }

  const { id = 'site-menu' }: Props = $props()
  const controller = get_menu_controller()
  let dialog: HTMLDialogElement | undefined
  let closing = $state(false)
  let close_timer: number | undefined
  let dismiss_pointer_type: string | undefined
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
    controller.is_open = true
    dialog.showModal()
  }

  controller.open = open_menu

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
    controller.is_open = false
  }

  function track_dismiss_pointer(event: PointerEvent) {
    dismiss_pointer_type = event.pointerType
  }

  function dismiss_with_mouse() {
    if (dismiss_pointer_type === 'mouse') request_close()
    dismiss_pointer_type = undefined
  }

  // Keep the page fixed for the full modal lifecycle, including its exit.
  $effect(() => {
    if (!controller.is_open) return
    return lock_page_scroll()
  })
</script>

<dialog
  {@attach manage_dialog}
  {id}
  class="menu"
  class:is-closing={closing}
  aria-label="站点菜单"
  oncancel={handle_cancel}
  onclose={handle_close}
>
  <div aria-hidden="true" class="menu-veil"></div>
  <button
    type="button"
    class="dismiss"
    aria-label="关闭菜单"
    tabindex="-1"
    onpointerdown={track_dismiss_pointer}
    onclick={dismiss_with_mouse}
  ></button>

  <MenuPanel
    is_closing={closing}
    is_open={controller.is_open}
    on_close={request_close}
    on_navigate={request_close}
  />
</dialog>

<style>
  .menu {
    --menu-highlight: var(--color-text-link-dark);
    --slip-surface: var(--color-ink);
    --slip-ink: var(--color-paper);
    --slip-texture-opacity: 0.24;
    --drift-ink: var(--color-ink);
    position: fixed;
    inset: 0;
    box-sizing: border-box;
    width: 100vw;
    min-width: 100vw;
    max-width: 100vw;
    height: var(--stable-viewport-block);
    min-height: var(--stable-viewport-block);
    max-height: var(--stable-viewport-block);
    margin: 0;
    padding: 0;
    overflow: hidden;
    border: 0;
    color: var(--color-text);
    background: transparent;
  }

  :global(.dark) .menu {
    --menu-highlight: var(--color-text-link-light);
  }

  .menu::before,
  .menu::after {
    position: absolute;
    inset: 0;
    z-index: 1;
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
    background: transparent;
  }

  .menu :global(.slip),
  .menu :global(.theme-slip) {
    isolation: isolate;
    overflow: hidden;
  }

  .menu :global(.slip)::before,
  .menu :global(.theme-slip)::before {
    position: absolute;
    inset: 0;
    z-index: -1;
    pointer-events: none;
    content: '';
    opacity: var(--slip-texture-opacity);
    background-image: var(--noise-tile);
    background-size: var(--noise-size);
  }

  .menu.is-closing::backdrop {
    background: transparent;
  }

  .menu-veil {
    position: absolute;
    inset: 0;
    z-index: 0;
    background: color-mix(in oklab, var(--color-paper) 88%, transparent);
    -webkit-backdrop-filter: blur(5px);
    backdrop-filter: blur(5px);
    transition: opacity var(--dur-long) var(--ease-out);
  }

  .menu.is-closing .menu-veil {
    opacity: 0;
  }

  @media (width < 40rem) {
    .menu-veil {
      background: var(--color-paper);
      -webkit-backdrop-filter: none;
      backdrop-filter: none;
    }
  }

  .dismiss {
    position: absolute;
    inset: 0;
    z-index: 2;
    width: 100%;
    height: 100%;
    padding: 0;
    cursor: default;
    border: 0;
    background: transparent;
  }

  @media (prefers-reduced-motion: reduce) {
    .menu-veil {
      -webkit-backdrop-filter: none;
      backdrop-filter: none;
      transition: none;
    }
  }
</style>

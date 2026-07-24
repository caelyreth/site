<script lang="ts">
  import ThemeToggle from '$lib/theme-toggle.svelte'

  const menuItems = [
    { code: 'OBS / 001', title: 'Observation', detail: 'Window retained' },
    { code: 'DIR / 044', title: 'Directory', detail: 'Archive pending' },
    { code: 'SIG / 007', title: 'Transmission', detail: 'Carrier available' },
  ]

  let dialog = $state<HTMLDialogElement>()
  let trigger = $state<HTMLButtonElement>()
  let menuOpen = $state(false)
  let closing = $state(false)
  let closeTimer: number | undefined
  let previousBodyOverflow = ''
  const MENU_CLOSE_DELAY = 420

  function lockPageScroll() {
    previousBodyOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
  }

  function restorePageScroll() {
    document.body.style.overflow = previousBodyOverflow
  }

  function openMenu() {
    if (!dialog || dialog.open) return

    closing = false
    menuOpen = true
    lockPageScroll()
    dialog.showModal()

    requestAnimationFrame(() => {
      dialog.querySelector<HTMLButtonElement>('[data-menu-primary]')?.focus()
    })
  }

  function requestClose() {
    if (!dialog?.open || closing) return

    closing = true
    closeTimer = window.setTimeout(() => dialog.close(), MENU_CLOSE_DELAY)
  }

  function handleCancel(event: Event) {
    event.preventDefault()
    requestClose()
  }

  function handleClose() {
    if (closeTimer !== undefined) window.clearTimeout(closeTimer)
    closeTimer = undefined
    closing = false
    menuOpen = false
    restorePageScroll()
    requestAnimationFrame(() => trigger?.focus())
  }
</script>

<button
  bind:this={trigger}
  type="button"
  class="hdr-menu-trigger"
  aria-controls="station-menu"
  aria-expanded={menuOpen}
  aria-haspopup="dialog"
  aria-label={menuOpen ? 'Close station menu' : 'Open station menu'}
  title={menuOpen ? 'Close menu' : 'Open menu'}
  onclick={openMenu}
>
  <span class="i-ri-menu-4-line" text-lg aria-hidden="true"></span>
</button>

<dialog
  bind:this={dialog}
  id="station-menu"
  class="station-menu"
  class:is-closing={closing}
  aria-label="Station menu"
  oncancel={handleCancel}
  onclose={handleClose}
>
  <button
    type="button"
    class="station-menu-dismiss"
    aria-label="Close station menu"
    tabindex="-1"
    onclick={requestClose}
  ></button>

  <div class="station-menu-stage">
    <svg
      aria-hidden="true"
      class="station-menu-orbits"
      viewBox="0 0 1600 900"
      preserveAspectRatio="none"
      fill="none"
    >
      <g vector-effect="non-scaling-stroke">
        <ellipse
          class="menu-orbit menu-orbit-wide"
          cx="796"
          cy="454"
          rx="456"
          ry="204"
          transform="rotate(-14 796 454)"
        />
        <path
          class="menu-orbit menu-orbit-arc"
          d="M178 566C462 730 1055 743 1438 459"
        />
      </g>
    </svg>

    <span aria-hidden="true" class="menu-drift menu-drift-back">RBK // 044</span>
    <span aria-hidden="true" class="menu-drift menu-drift-left-back">FIELD / 044</span>
    <span aria-hidden="true" class="menu-drift menu-drift-top-left">FIELD NOTES / 001</span>
    <span aria-hidden="true" class="menu-drift menu-drift-mid">CAELYRETH</span>
    <span aria-hidden="true" class="menu-drift menu-drift-left-mid">ORBIT / 001</span>
    <span aria-hidden="true" class="menu-drift menu-drift-front">TRANSMISSION / RETURN / 001</span>
    <span aria-hidden="true" class="menu-drift menu-drift-line">SIGNAL / HOLD</span>
    <span aria-hidden="true" class="menu-drift menu-drift-right-low">RELAY / ACTIVE</span>
    <span aria-hidden="true" class="menu-drift menu-drift-bottom-right">ARCHIVE / HELD</span>
    <span aria-hidden="true" class="menu-drift menu-drift-core-one">OBSERVATION / RETAINED</span>
    <span aria-hidden="true" class="menu-drift menu-drift-core-two">VIEWING PLANE / 01</span>
    <span aria-hidden="true" class="menu-drift menu-drift-core-three">CAELYRETH / IN ORBIT</span>

    <nav class="station-menu-primary" aria-label="Station menu options">
      {#each menuItems as item, index}
        <button
          type="button"
          class={`menu-slip menu-slip-${index + 1}`}
          data-menu-primary={index === 0 ? '' : undefined}
          onclick={requestClose}
        >
          <span class="menu-slip-code">{item.code}</span>
          <span class="menu-slip-title">{item.title}</span>
          <span class="menu-slip-detail">{item.detail}</span>
        </button>
      {/each}
    </nav>

    <section class="menu-theme-slip" aria-label="Display mode">
      <span class="menu-slip-code">SHIFT / 002</span>
      <span class="menu-theme-label">Light relay</span>
      <ThemeToggle />
    </section>

    <button
      type="button"
      class="station-menu-close"
      aria-label="Close station menu"
      title="Close menu"
      onclick={requestClose}
    >
      <span class="i-ri-close-line" text-lg aria-hidden="true"></span>
    </button>

    <p class="menu-field-note">Caelyreth relay / viewing plane 01</p>
  </div>
</dialog>

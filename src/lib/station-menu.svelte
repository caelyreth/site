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

<style>
.hdr-menu-trigger {
  display: grid;
  width: 2.25rem;
  height: 2.25rem;
  flex: none;
  place-items: center;
  padding: 0;
  cursor: pointer;
  border: 1px solid color-mix(in oklab, var(--hdr-ink) 35%, transparent);
  color: var(--hdr-ink);
  background: transparent;
  transition:
    border-color var(--dur-micro) var(--ease-out),
    color var(--dur-micro) var(--ease-out),
    transform var(--dur-micro) var(--ease-out);
}
@media (hover: hover) {
  .hdr-menu-trigger:hover {
    border-color: var(--hdr-ink);
    color: var(--color-accent);
  }
}
.hdr-menu-trigger:active {
  transform: translateY(1px);
}


/* The menu uses fixed, layered slips: crisp choices sit on the viewing plane,
   while blurred strips stay decorative and never intercept input. */
.station-menu {
  --menu-slip-surface: var(--color-ink);
  --menu-slip-ink: var(--color-paper);
  --menu-drift-ink: var(--color-ink);

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
.station-menu::before {
  content: '';
  position: absolute;
  inset: 0;
  z-index: 0;
  pointer-events: none;
  opacity: 0.15;
  background-image: var(--noise-tile);
  background-size: 96px;
}
.station-menu::after {
  content: '';
  position: absolute;
  inset: 0;
  z-index: 0;
  pointer-events: none;
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
.station-menu::backdrop {
  background: color-mix(in oklab, var(--color-ink) 20%, transparent);
  transition: background-color var(--dur-long) var(--ease-in);
}
.station-menu.is-closing::backdrop {
  background: transparent;
}
.station-menu-dismiss {
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
.station-menu-stage {
  position: relative;
  z-index: 2;
  width: 100%;
  height: 100%;
  overflow: hidden;
  pointer-events: none;
}
.station-menu-orbits {
  position: absolute;
  inset: -6% -8%;
  z-index: 1;
  width: 116%;
  height: 112%;
  overflow: visible;
  color: var(--menu-drift-ink);
  opacity: 0.14;
  pointer-events: none;
}
.menu-orbit {
  fill: none;
  stroke: currentColor;
  stroke-linecap: round;
  stroke-linejoin: round;
}
.menu-orbit-wide {
  stroke-width: 0.9;
  opacity: 0.52;
}
.menu-orbit-arc {
  stroke-width: 0.7;
  opacity: 0.44;
}
.station-menu-primary {
  position: absolute;
  inset: 0;
  z-index: 3;
  pointer-events: auto;
}
.menu-theme-slip,
.station-menu-close {
  z-index: 3;
  pointer-events: auto;
}
.menu-slip,
.menu-theme-slip {
  position: absolute;
  display: flex;
  width: max-content;
  max-width: calc(100vw - 2rem);
  min-width: 0;
  flex-direction: column;
  align-items: flex-start;
  gap: 0.5rem;
  padding: 0.9rem 1rem 1rem;
  border: 1px solid transparent;
  color: var(--menu-slip-ink);
  background-color: var(--menu-slip-surface);
  white-space: nowrap;
}
.menu-slip {
  cursor: pointer;
  transform: rotate(var(--slip-rotate));
  transition:
    color var(--dur-micro) var(--ease-out),
    transform var(--dur-micro) var(--ease-out);
}
.menu-slip-code {
  font-size: 0.625rem;
  font-weight: 500;
  line-height: 1.2;
  letter-spacing: 0.11em;
  opacity: 0.7;
}
.menu-slip-title {
  min-width: 0;
  font-family: var(--font-stack-serif);
  font-size: clamp(1.45rem, 3vw, 2.5rem);
  font-style: normal;
  font-weight: 700;
  letter-spacing: 0;
  line-height: 0.9;
}
.menu-slip-detail,
.menu-theme-label,
.menu-field-note {
  font-size: 0.625rem;
  line-height: 1.3;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}
.menu-slip-detail {
  opacity: 0.65;
}
.menu-slip-1 {
  top: 22%;
  left: 25%;
  --slip-rotate: -13deg;
  --slip-enter-x: -2rem;
  --slip-enter-y: 1rem;
}
.menu-slip-2 {
  top: 29%;
  left: 57%;
  --slip-rotate: 11deg;
  --slip-enter-x: 1.75rem;
  --slip-enter-y: -1rem;
}
.menu-slip-3 {
  top: 56%;
  left: 34%;
  --slip-rotate: -7deg;
  --slip-enter-x: -1.5rem;
  --slip-enter-y: 1.25rem;
}
.menu-theme-slip {
  right: 22%;
  bottom: 15%;
  min-width: 9.5rem;
  min-height: 7.5rem;
  justify-content: space-between;
  --slip-rotate: 16deg;
  --slip-enter-x: 1.5rem;
  --slip-enter-y: 1rem;
  transform: rotate(var(--slip-rotate));
}
.menu-theme-slip :global(.theme-toggle) {
  --toggle-line: color-mix(in oklab, var(--menu-slip-ink) 45%, transparent);
  --toggle-ink: var(--menu-slip-ink);

  width: 2.5rem;
  height: 2.5rem;
}
@media (hover: hover) {
  .menu-slip:hover {
    color: var(--color-accent);
    transform: translateY(-2px) rotate(calc(var(--slip-rotate) + 1deg));
  }
  .menu-theme-slip:hover :global(.theme-toggle) {
    color: var(--color-accent);
  }
}
.menu-slip:active {
  transform: translateY(1px) rotate(var(--slip-rotate));
}
.menu-drift {
  position: absolute;
  z-index: 2;
  display: grid;
  width: max-content;
  max-width: calc(100vw - 1.5rem);
  padding: 0.5rem 0.7rem;
  overflow: hidden;
  text-overflow: ellipsis;
  color: var(--menu-slip-ink);
  background: var(--menu-slip-surface);
  font-family: var(--font-stack-sans);
  font-size: clamp(0.75rem, 1.4vw, 1.1rem);
  font-style: normal;
  font-weight: 500;
  letter-spacing: 0.1em;
  line-height: 1.1;
  text-transform: uppercase;
  white-space: nowrap;
  pointer-events: none;
  user-select: none;
}
.menu-drift-back {
  top: 12%;
  right: 14%;
  opacity: 0.26;
  filter: blur(11px);
  transform: rotate(-42deg);
}
.menu-drift-left-back {
  top: 19%;
  left: -3%;
  opacity: 0.3;
  filter: blur(9px);
  transform: rotate(34deg);
}
.menu-drift-top-left {
  top: 10%;
  left: 16%;
  opacity: 0.23;
  filter: blur(12px);
  transform: rotate(-18deg);
}
.menu-drift-mid {
  top: 45%;
  right: 1%;
  opacity: 0.36;
  filter: blur(5px);
  transform: rotate(-38deg);
}
.menu-drift-left-mid {
  bottom: 25%;
  left: 9%;
  opacity: 0.42;
  filter: blur(3px);
  transform: rotate(-55deg);
}
.menu-drift-front {
  bottom: 11%;
  left: -2%;
  opacity: 0.35;
  filter: blur(13px);
  transform: rotate(14deg);
}
.menu-drift-line {
  bottom: 17%;
  left: 27%;
  opacity: 0.4;
  filter: blur(4px);
  transform: rotate(61deg);
}
.menu-drift-right-low {
  right: -1%;
  bottom: 26%;
  opacity: 0.25;
  filter: blur(10px);
  transform: rotate(27deg);
}
.menu-drift-bottom-right {
  right: 7%;
  bottom: 8%;
  opacity: 0.3;
  filter: blur(9px);
  transform: rotate(-18deg);
}
.menu-drift-core-one {
  top: 38%;
  left: 19%;
  opacity: 0.24;
  filter: blur(8px);
  transform: rotate(6deg);
}
.menu-drift-core-two {
  top: 50%;
  left: 29%;
  opacity: 0.29;
  filter: blur(6px);
  transform: rotate(-10deg);
}
.menu-drift-core-three {
  top: 61%;
  left: 42%;
  opacity: 0.2;
  filter: blur(10px);
  transform: rotate(8deg);
}
.station-menu-close {
  position: absolute;
  top: 0.5rem;
  right: 1.5rem;
  display: grid;
  width: 2.25rem;
  height: 2.25rem;
  place-items: center;
  padding: 0;
  cursor: pointer;
  border: 1px solid var(--color-rule);
  color: var(--color-ink);
  background: transparent;
  transition:
    border-color var(--dur-micro) var(--ease-out),
    color var(--dur-micro) var(--ease-out),
    transform var(--dur-micro) var(--ease-out);
}
@media (hover: hover) {
  .station-menu-close:hover {
    border-color: var(--color-ink);
    color: var(--color-accent);
  }
}
.station-menu-close:active {
  transform: translateY(1px);
}
.menu-field-note {
  position: absolute;
  z-index: 3;
  right: 1.5rem;
  bottom: 1.5rem;
  margin: 0;
  color: var(--color-muted);
  pointer-events: none;
}
@keyframes menu-slip-enter {
  from {
    opacity: 0;
    transform: translate3d(var(--slip-enter-x), var(--slip-enter-y), 0)
      rotate(var(--slip-rotate));
  }
  to {
    opacity: 1;
    transform: translate3d(0, 0, 0) rotate(var(--slip-rotate));
  }
}
@keyframes menu-slip-leave {
  to {
    opacity: 0;
    transform: translate3d(var(--slip-enter-x), var(--slip-enter-y), 0)
      rotate(var(--slip-rotate));
  }
}
@keyframes menu-drift-enter {
  from {
    opacity: 0;
  }
}
@keyframes menu-drift-leave {
  to {
    opacity: 0;
  }
}
@keyframes station-menu-enter {
  from {
    opacity: 0;
  }
}
@keyframes station-menu-leave {
  to {
    opacity: 0;
  }
}
.station-menu[open]:not(.is-closing) {
  animation: station-menu-enter var(--dur-long) var(--ease-out) both;
}
.station-menu.is-closing {
  animation: station-menu-leave var(--dur-long) var(--ease-in) both;
}
.station-menu[open]:not(.is-closing) .menu-slip,
.station-menu[open]:not(.is-closing) .menu-theme-slip {
  animation: menu-slip-enter var(--dur-long) var(--ease-out) backwards;
}
.station-menu[open]:not(.is-closing) .menu-slip-1 {
  animation-delay: 80ms;
}
.station-menu[open]:not(.is-closing) .menu-slip-2 {
  animation-delay: 140ms;
}
.station-menu[open]:not(.is-closing) .menu-slip-3 {
  animation-delay: 200ms;
}
.station-menu[open]:not(.is-closing) .menu-theme-slip {
  animation-delay: 240ms;
}
.station-menu[open]:not(.is-closing) .menu-drift {
  animation: menu-drift-enter var(--dur-long) var(--ease-out) backwards;
}
.station-menu[open]:not(.is-closing) .station-menu-orbits {
  animation: menu-drift-enter var(--dur-long) var(--ease-out) 70ms backwards;
}
.station-menu[open]:not(.is-closing) .menu-drift-back {
  animation-delay: 30ms;
}
.station-menu[open]:not(.is-closing) .menu-drift-mid {
  animation-delay: 100ms;
}
.station-menu[open]:not(.is-closing) .menu-drift-front {
  animation-delay: 160ms;
}
.station-menu[open]:not(.is-closing) .menu-drift-line {
  animation-delay: 220ms;
}
.station-menu.is-closing .menu-slip,
.station-menu.is-closing .menu-theme-slip {
  animation: menu-slip-leave var(--dur-long) var(--ease-in) both;
}
.station-menu.is-closing .menu-drift {
  animation: menu-drift-leave var(--dur-long) var(--ease-in) both;
}
.station-menu.is-closing .station-menu-orbits {
  animation: menu-drift-leave var(--dur-long) var(--ease-in) both;
}
@media (max-width: 40rem) {
  .menu-slip-1 {
    top: 22%;
    left: 8%;
  }
  .menu-slip-2 {
    top: 32%;
    left: 38%;
  }
  .menu-slip-3 {
    top: 58%;
    left: 10%;
  }
  .menu-theme-slip {
    right: 10%;
    bottom: 8%;
  }
  .menu-drift-core-one {
    top: 35%;
    left: -11%;
  }
  .menu-drift-core-two {
    top: 50%;
    left: 8%;
  }
  .menu-drift-core-three {
    top: 64%;
    left: 0;
  }
  .station-menu-close {
    top: 0.5rem;
    right: 0.75rem;
  }
  .menu-field-note {
    right: 0.75rem;
    bottom: 0.75rem;
  }
}
@media (prefers-reduced-motion: reduce) {
  .station-menu {
    backdrop-filter: none;
  }
  .station-menu[open] .menu-slip,
  .station-menu[open] .menu-theme-slip,
  .station-menu[open] .menu-drift,
  .station-menu[open] .station-menu-orbits {
    animation: none;
  }
}
</style>

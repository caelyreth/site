<script lang="ts">
  import { flushSync } from 'svelte'
  import { useTheme } from 'svelte-themes'

  import ThemeToggle from './theme-toggle.svelte'

  const menuItems = [
    { code: 'OBS / 001', title: 'Observation', detail: 'Window retained' },
    { code: 'DIR / 044', title: 'Directory', detail: 'Archive pending' },
    {
      code: 'SIG / 007',
      title: 'Transmission',
      detail: 'Carrier available',
    },
  ] as const

  const drifts = [
    { position: 'back', text: 'RBK // 044' },
    { position: 'left-back', text: 'FIELD / 044' },
    { position: 'top-left', text: 'FIELD NOTES / 001' },
    { position: 'mid', text: 'CAELYRETH' },
    { position: 'left-mid', text: 'ORBIT / 001' },
    { position: 'front', text: 'TRANSMISSION / RETURN / 001' },
    { position: 'line', text: 'SIGNAL / HOLD' },
    { position: 'right-low', text: 'RELAY / ACTIVE' },
    { position: 'bottom-right', text: 'ARCHIVE / HELD' },
    { position: 'core-one', text: 'OBSERVATION / RETAINED' },
    { position: 'core-two', text: 'VIEWING PLANE / 01' },
    { position: 'core-three', text: 'CAELYRETH / IN ORBIT' },
  ] as const

  let dialog: HTMLDialogElement | undefined
  let menuOpen = $state(false)
  let closing = $state(false)
  let closeTimer: number | undefined
  const closeFallback = 500
  const theme = useTheme()
  const themeLabel = $derived(
    theme.theme === 'system'
      ? `System relay / ${theme.resolvedTheme}`
      : `${theme.resolvedTheme} relay`,
  )

  function clearCloseTimer() {
    if (closeTimer !== undefined) window.clearTimeout(closeTimer)
    closeTimer = undefined
  }

  function manageDialog(node: HTMLDialogElement) {
    dialog = node

    return () => {
      if (dialog === node) dialog = undefined
      clearCloseTimer()
    }
  }

  function open() {
    if (!dialog || dialog.open) return

    closing = false
    menuOpen = true
    dialog.showModal()
  }

  function requestClose() {
    if (!dialog?.open || closing) return

    flushSync(() => {
      closing = true
    })
    closeTimer = window.setTimeout(() => {
      if (dialog?.open) dialog.close()
    }, closeFallback)
  }

  function handleCancel(event: Event) {
    event.preventDefault()
    requestClose()
  }

  function handleClose() {
    clearCloseTimer()
    closing = false
    menuOpen = false
  }

  function handleAnimationEnd(event: AnimationEvent) {
    if (
      event.target !== dialog ||
      event.animationName !== 'menu-leave' ||
      !closing
    ) {
      return
    }

    dialog?.close()
  }

  $effect(() => {
    if (!menuOpen) return

    const root = document.documentElement
    const previousPaddingRight = root.style.paddingRight
    const scrollbarWidth = window.innerWidth - root.clientWidth
    if (scrollbarWidth > 0) root.style.paddingRight = `${scrollbarWidth}px`
    root.classList.add('station-scroll-locked')

    return () => {
      root.classList.remove('station-scroll-locked')
      root.style.paddingRight = previousPaddingRight
    }
  })
</script>

<button
  type="button"
  class="trigger"
  aria-controls="station-menu"
  aria-expanded={menuOpen}
  aria-haspopup="dialog"
  aria-label={menuOpen ? 'Close station menu' : 'Open station menu'}
  title={menuOpen ? 'Close menu' : 'Open menu'}
  onclick={open}
>
  <span class="i-ri-menu-4-line" aria-hidden="true"></span>
</button>

<dialog
  {@attach manageDialog}
  id="station-menu"
  class="menu"
  class:is-closing={closing}
  aria-label="Station menu"
  oncancel={handleCancel}
  onclose={handleClose}
  onanimationend={handleAnimationEnd}
>
  <button
    type="button"
    class="dismiss"
    aria-label="Close station menu"
    tabindex="-1"
    onpointerdown={requestClose}
    onclick={requestClose}
  ></button>

  <div class="stage">
    <svg
      aria-hidden="true"
      class="orbits"
      viewBox="0 0 1600 900"
      preserveAspectRatio="none"
      fill="none"
    >
      <g vector-effect="non-scaling-stroke">
        <ellipse
          class="orbit orbit-wide"
          cx="796"
          cy="454"
          rx="456"
          ry="204"
          transform="rotate(-14 796 454)"
        />
        <path
          class="orbit orbit-arc"
          d="M178 566C462 730 1055 743 1438 459"
        />
      </g>
    </svg>

    {#each drifts as drift (drift.position)}
      <span aria-hidden="true" class={`drift drift-${drift.position}`}
        >{drift.text}</span
      >
    {/each}

    <nav class="primary" aria-label="Station menu options">
      {#each menuItems as item, index}
        <!-- svelte-ignore a11y_autofocus: The first choice receives focus only when the dialog opens. -->
        <button
          type="button"
          class={`slip slip-${index + 1}`}
          autofocus={index === 0}
          onpointerdown={requestClose}
          onclick={requestClose}
        >
          <span class="slip-code">{item.code}</span>
          <span class="slip-title font-serif">{item.title}</span>
          <span class="slip-detail">{item.detail}</span>
        </button>
      {/each}
    </nav>

    <section class="theme-slip" aria-label="Display mode">
      <span class="slip-code">SHIFT / 002</span>
      <span class="theme-label">{themeLabel}</span>
      <ThemeToggle />
    </section>

    <p class="field-note">Caelyreth relay / viewing plane 01</p>
  </div>
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

  .stage {
    position: relative;
    z-index: 2;
    width: 100%;
    height: 100%;
    overflow: hidden;
    pointer-events: none;
  }

  .orbits {
    position: absolute;
    inset: -6% -8%;
    z-index: 1;
    width: 116%;
    height: 112%;
    overflow: visible;
    color: var(--drift-ink);
    opacity: 0.14;
    pointer-events: none;
  }

  .orbit {
    fill: none;
    stroke: currentColor;
    stroke-linecap: round;
    stroke-linejoin: round;
  }

  .orbit-wide {
    stroke-width: 0.9;
    opacity: 0.52;
  }

  .orbit-arc {
    stroke-width: 0.7;
    opacity: 0.44;
  }

  .primary {
    position: absolute;
    inset: 0;
    z-index: 3;
    pointer-events: none;
  }

  .theme-slip {
    z-index: 3;
    pointer-events: auto;
  }

  .slip,
  .theme-slip {
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
    color: var(--slip-ink);
    background-color: var(--slip-surface);
    white-space: nowrap;
  }

  .slip {
    cursor: pointer;
    pointer-events: auto;
    transform: rotate(var(--slip-rotate));
    transition:
      color var(--dur-micro) var(--ease-out),
      transform var(--dur-micro) var(--ease-out);
  }

  .slip-code {
    font-size: 0.625rem;
    font-weight: 500;
    line-height: 1.2;
    letter-spacing: 0.11em;
    opacity: 0.7;
  }

  .slip-title {
    min-width: 0;
    font-size: clamp(1.45rem, 3vw, 2.5rem);
    font-style: normal;
    font-weight: 700;
    letter-spacing: 0;
    line-height: 0.9;
  }

  .slip-detail,
  .theme-label,
  .field-note {
    font-size: 0.625rem;
    line-height: 1.3;
    letter-spacing: 0.08em;
    text-transform: uppercase;
  }

  .slip-detail {
    opacity: 0.65;
  }

  .slip-1 {
    top: 22%;
    left: 25%;
    --slip-rotate: -13deg;
    --slip-enter-x: -2rem;
    --slip-enter-y: 1rem;
  }

  .slip-2 {
    top: 29%;
    left: 57%;
    --slip-rotate: 11deg;
    --slip-enter-x: 1.75rem;
    --slip-enter-y: -1rem;
  }

  .slip-3 {
    top: 56%;
    left: 34%;
    --slip-rotate: -7deg;
    --slip-enter-x: -1.5rem;
    --slip-enter-y: 1.25rem;
  }

  .theme-slip {
    box-sizing: border-box;
    right: 22%;
    bottom: 15%;
    width: 10.5rem;
    min-height: 7.5rem;
    justify-content: space-between;
    --slip-rotate: 16deg;
    --slip-enter-x: 1.5rem;
    --slip-enter-y: 1rem;
    transform: rotate(var(--slip-rotate));
  }

  .theme-label {
    width: 100%;
  }

  .theme-slip :global(.theme-toggle) {
    --toggle-rule: color-mix(in oklab, var(--slip-ink) 45%, transparent);
    --toggle-ink: var(--slip-ink);
    --toggle-active-ink: var(--slip-surface);

    height: 2.5rem;
    grid-auto-columns: 2.5rem;
  }

  @media (hover: hover) {
    .slip:hover {
      color: var(--color-accent);
      transform: translateY(-2px) rotate(calc(var(--slip-rotate) + 1deg));
    }
  }

  .slip:active {
    transform: translateY(1px) rotate(var(--slip-rotate));
  }

  .drift {
    position: absolute;
    z-index: 2;
    display: grid;
    width: max-content;
    max-width: calc(100vw - 1.5rem);
    padding: 0.5rem 0.7rem;
    overflow: hidden;
    color: var(--slip-ink);
    background: var(--slip-surface);
    font-family: ui-sans-serif, system-ui, sans-serif;
    font-size: clamp(0.75rem, 1.4vw, 1.1rem);
    font-style: normal;
    font-weight: 500;
    letter-spacing: 0.1em;
    line-height: 1.1;
    text-overflow: ellipsis;
    text-transform: uppercase;
    white-space: nowrap;
    pointer-events: none;
    user-select: none;
  }

  .drift-back {
    top: 12%;
    right: 14%;
    opacity: 0.26;
    filter: blur(11px);
    transform: rotate(-42deg);
  }
  .drift-left-back {
    top: 19%;
    left: -3%;
    opacity: 0.3;
    filter: blur(9px);
    transform: rotate(34deg);
  }
  .drift-top-left {
    top: 10%;
    left: 16%;
    opacity: 0.23;
    filter: blur(12px);
    transform: rotate(-18deg);
  }
  .drift-mid {
    top: 45%;
    right: 1%;
    opacity: 0.36;
    filter: blur(5px);
    transform: rotate(-38deg);
  }
  .drift-left-mid {
    bottom: 25%;
    left: 9%;
    opacity: 0.42;
    filter: blur(3px);
    transform: rotate(-55deg);
  }
  .drift-front {
    bottom: 11%;
    left: -2%;
    opacity: 0.35;
    filter: blur(13px);
    transform: rotate(14deg);
  }
  .drift-line {
    bottom: 17%;
    left: 27%;
    opacity: 0.4;
    filter: blur(4px);
    transform: rotate(61deg);
  }
  .drift-right-low {
    right: -1%;
    bottom: 26%;
    opacity: 0.25;
    filter: blur(10px);
    transform: rotate(27deg);
  }
  .drift-bottom-right {
    right: 7%;
    bottom: 8%;
    opacity: 0.3;
    filter: blur(9px);
    transform: rotate(-18deg);
  }
  .drift-core-one {
    top: 38%;
    left: 19%;
    opacity: 0.24;
    filter: blur(8px);
    transform: rotate(6deg);
  }
  .drift-core-two {
    top: 50%;
    left: 29%;
    opacity: 0.29;
    filter: blur(6px);
    transform: rotate(-10deg);
  }
  .drift-core-three {
    top: 61%;
    left: 42%;
    opacity: 0.2;
    filter: blur(10px);
    transform: rotate(8deg);
  }

  .field-note {
    position: absolute;
    z-index: 3;
    right: 1.5rem;
    bottom: 1.5rem;
    margin: 0;
    color: var(--color-muted);
    pointer-events: none;
  }

  @keyframes slip-enter {
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

  @keyframes slip-leave {
    to {
      opacity: 0;
      transform: translate3d(var(--slip-enter-x), var(--slip-enter-y), 0)
        rotate(var(--slip-rotate));
    }
  }

  @keyframes drift-enter {
    from {
      opacity: 0;
    }
  }

  @keyframes drift-leave {
    to {
      opacity: 0;
    }
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

  .menu[open]:not(.is-closing) .slip,
  .menu[open]:not(.is-closing) .theme-slip {
    animation: slip-enter var(--dur-long) var(--ease-out) backwards;
  }

  .menu[open]:not(.is-closing) .slip-1 {
    animation-delay: 80ms;
  }
  .menu[open]:not(.is-closing) .slip-2 {
    animation-delay: 140ms;
  }
  .menu[open]:not(.is-closing) .slip-3 {
    animation-delay: 200ms;
  }
  .menu[open]:not(.is-closing) .theme-slip {
    animation-delay: 240ms;
  }
  .menu[open]:not(.is-closing) .drift {
    animation: drift-enter var(--dur-long) var(--ease-out) backwards;
  }
  .menu[open]:not(.is-closing) .orbits {
    animation: drift-enter var(--dur-long) var(--ease-out) 70ms backwards;
  }
  .menu[open]:not(.is-closing) .drift-back {
    animation-delay: 30ms;
  }
  .menu[open]:not(.is-closing) .drift-mid {
    animation-delay: 100ms;
  }
  .menu[open]:not(.is-closing) .drift-front {
    animation-delay: 160ms;
  }
  .menu[open]:not(.is-closing) .drift-line {
    animation-delay: 220ms;
  }
  .menu.is-closing .slip,
  .menu.is-closing .theme-slip {
    animation: slip-leave var(--dur-long) var(--ease-out) both;
  }
  .menu.is-closing .drift,
  .menu.is-closing .orbits {
    animation: drift-leave var(--dur-long) var(--ease-out) both;
  }

  @media (max-width: 40rem) {
    .slip-1 {
      top: 22%;
      left: 8%;
    }
    .slip-2 {
      top: 32%;
      left: 38%;
    }
    .slip-3 {
      top: 58%;
      left: 10%;
    }
    .theme-slip {
      right: 10%;
      bottom: 8%;
    }
    .drift-core-one {
      top: 35%;
      left: -11%;
    }
    .drift-core-two {
      top: 50%;
      left: 8%;
    }
    .drift-core-three {
      top: 64%;
      left: 0;
    }
    .field-note {
      right: 0.75rem;
      bottom: 0.75rem;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .menu {
      backdrop-filter: none;
    }
    .menu[open]:not(.is-closing),
    .menu[open] .slip,
    .menu[open] .theme-slip,
    .menu[open] .drift,
    .menu[open] .orbits {
      animation: none;
    }
  }
</style>

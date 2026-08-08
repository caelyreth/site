<script lang="ts">
  import { useTheme as use_theme } from 'svelte-themes'

  import ThemeToggle from './theme-toggle.svelte'

  interface Props {
    on_select: () => void
  }

  const { on_select }: Props = $props()

  const menu_items = [
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

  const theme = use_theme()
  const theme_label = $derived(
    theme.theme === 'system'
      ? `System relay / ${theme.resolvedTheme}`
      : `${theme.resolvedTheme} relay`,
  )
</script>

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
      <path class="orbit orbit-arc" d="M178 566C462 730 1055 743 1438 459" />
    </g>
  </svg>

  {#each drifts as drift (drift.position)}
    <span aria-hidden="true" class={`drift drift-${drift.position}`}
      >{drift.text}</span
    >
  {/each}

  <nav class="primary" aria-label="Station menu options">
    {#each menu_items as item, index}
      <!-- svelte-ignore a11y_autofocus: The first choice receives focus only when the dialog opens. -->
      <button
        type="button"
        class={`slip slip-${index + 1}`}
        autofocus={index === 0}
        onpointerdown={on_select}
        onclick={on_select}
      >
        <span class="slip-code">{item.code}</span>
        <span class="slip-title font-serif">{item.title}</span>
        <span class="slip-detail">{item.detail}</span>
      </button>
    {/each}
  </nav>

  <section class="theme-slip" aria-label="Display mode">
    <span class="slip-code">SHIFT / 002</span>
    <span class="theme-label">{theme_label}</span>
    <ThemeToggle />
  </section>

  <p class="field-note">Caelyreth relay / viewing plane 01</p>
</div>

<style>
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

  :global(.menu[open]:not(.is-closing)) .slip,
  :global(.menu[open]:not(.is-closing)) .theme-slip {
    animation: slip-enter var(--dur-long) var(--ease-out) backwards;
  }

  :global(.menu[open]:not(.is-closing)) .slip-1 {
    animation-delay: 80ms;
  }
  :global(.menu[open]:not(.is-closing)) .slip-2 {
    animation-delay: 140ms;
  }
  :global(.menu[open]:not(.is-closing)) .slip-3 {
    animation-delay: 200ms;
  }
  :global(.menu[open]:not(.is-closing)) .theme-slip {
    animation-delay: 240ms;
  }
  :global(.menu[open]:not(.is-closing)) .drift {
    animation: drift-enter var(--dur-long) var(--ease-out) backwards;
  }
  :global(.menu[open]:not(.is-closing)) .orbits {
    animation: drift-enter var(--dur-long) var(--ease-out) 70ms backwards;
  }
  :global(.menu[open]:not(.is-closing)) .drift-back {
    animation-delay: 30ms;
  }
  :global(.menu[open]:not(.is-closing)) .drift-mid {
    animation-delay: 100ms;
  }
  :global(.menu[open]:not(.is-closing)) .drift-front {
    animation-delay: 160ms;
  }
  :global(.menu[open]:not(.is-closing)) .drift-line {
    animation-delay: 220ms;
  }
  :global(.menu.is-closing) .slip,
  :global(.menu.is-closing) .theme-slip {
    animation: slip-leave var(--dur-long) var(--ease-out) both;
  }
  :global(.menu.is-closing) .drift,
  :global(.menu.is-closing) .orbits {
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
    :global(.menu[open]) .slip,
    :global(.menu[open]) .theme-slip,
    :global(.menu[open]) .drift,
    :global(.menu[open]) .orbits {
      animation: none;
    }
  }
</style>

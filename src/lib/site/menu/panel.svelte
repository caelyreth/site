<script lang="ts">
  import { useTheme as use_theme } from 'svelte-themes'

  import { drifts, menu_items, theme_slip_layout } from './layout'
  import ThemeToggle from './theme-toggle.svelte'

  interface Props {
    is_closing: boolean
    is_open: boolean
    on_close: () => void
    on_select: () => void
  }

  const { is_closing, is_open, on_close, on_select }: Props = $props()

  const theme = use_theme()
  const theme_label = $derived(
    theme.theme === 'system'
      ? `System relay / ${theme.resolvedTheme}`
      : `${theme.resolvedTheme} relay`,
  )
</script>

<div class:is-closing={is_closing} class:is-open={is_open} class="stage">
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

  {#each drifts as drift (drift.text)}
    <span
      aria-hidden="true"
      class="drift"
      style:--drift-bottom={drift.layout.bottom}
      style:--drift-blur={drift.layout.blur}
      style:--drift-enter-delay={drift.layout.enter_delay}
      style:--drift-left={drift.layout.left}
      style:--drift-opacity={drift.layout.opacity}
      style:--drift-right={drift.layout.right}
      style:--drift-rotation={drift.layout.rotation}
      style:--drift-top={drift.layout.top}
      style:--drift-bottom-compact={drift.layout.compact?.bottom}
      style:--drift-left-compact={drift.layout.compact?.left}
      style:--drift-right-compact={drift.layout.compact?.right}
      style:--drift-top-compact={drift.layout.compact?.top}
      >{drift.text}</span
    >
  {/each}

  <nav class="primary" aria-label="Station menu options">
    {#each menu_items as item}
      <!-- svelte-ignore a11y_autofocus: The first choice receives focus only when the dialog opens. -->
      <button
        type="button"
        class="slip"
        class:directory={item.id === 'directory'}
        class:observation={item.id === 'observation'}
        class:transmission={item.id === 'transmission'}
        autofocus={item === menu_items[0]}
        onpointerdown={on_select}
        onclick={on_select}
        style:--slip-bottom={item.layout.bottom}
        style:--slip-enter-delay={item.layout.enter_delay}
        style:--slip-enter-x={item.layout.enter_x}
        style:--slip-enter-y={item.layout.enter_y}
        style:--slip-left={item.layout.left}
        style:--slip-right={item.layout.right}
        style:--slip-rotation={item.layout.rotation}
        style:--slip-top={item.layout.top}
      >
        <span class="micro-label slip-code">{item.code}</span>
        <span class="slip-title font-serif">{item.title}</span>
        <span class="micro-label slip-detail">{item.detail}</span>
      </button>
    {/each}
  </nav>

  <section
    class="theme-slip"
    aria-label="Display mode"
    style:--slip-bottom={theme_slip_layout.bottom}
    style:--slip-enter-delay={theme_slip_layout.enter_delay}
    style:--slip-enter-x={theme_slip_layout.enter_x}
    style:--slip-enter-y={theme_slip_layout.enter_y}
    style:--slip-right={theme_slip_layout.right}
    style:--slip-rotation={theme_slip_layout.rotation}
  >
    <div class="theme-heading">
      <span class="micro-label slip-code">SHIFT / 002</span>
      <button
        type="button"
        class="close"
        aria-label="Close menu"
        title="Close menu"
        onclick={on_close}
        ><span class="i-ri-close-line" aria-hidden="true"></span></button
      >
    </div>
    <span class="micro-label theme-label">{theme_label}</span>
    <ThemeToggle />
  </section>

  <p class="micro-label field-note">Caelyreth relay / viewing plane 01</p>
</div>

<style>
  .stage {
    --menu-gutter: clamp(0.75rem, 4vw, 2rem);
    --menu-inset-left: max(var(--menu-gutter), env(safe-area-inset-left));
    --menu-inset-right: max(var(--menu-gutter), env(safe-area-inset-right));
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
    top: var(--slip-top);
    right: var(--slip-right);
    bottom: var(--slip-bottom);
    left: var(--slip-left);
    display: flex;
    width: max-content;
    max-width: calc(
      100vw - var(--menu-inset-left) - var(--menu-inset-right)
    );
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
    transform: rotate(var(--slip-effective-rotation, var(--slip-rotation)));
    transition:
      color var(--dur-micro) var(--ease-out),
      transform var(--dur-micro) var(--ease-out);
  }

  .slip-code {
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
    line-height: 1.3;
  }

  .slip-detail {
    opacity: 0.65;
  }

  .theme-slip {
    --theme-toggle-size: 2.5rem;
    --toggle-rule: color-mix(in oklab, var(--slip-ink) 45%, transparent);
    --toggle-ink: var(--slip-ink);
    --toggle-active-ink: var(--slip-surface);
    --toggle-hover-ink: var(--menu-highlight);

    box-sizing: border-box;
    width: 10.5rem;
    min-height: 7.5rem;
    justify-content: space-between;
    transform: rotate(var(--slip-effective-rotation, var(--slip-rotation)));
  }

  .theme-heading {
    display: flex;
    width: 100%;
    align-items: center;
    justify-content: space-between;
    gap: 0.75rem;
  }

  .close {
    display: grid;
    width: 1.5rem;
    height: 1.5rem;
    flex: none;
    padding: 0;
    cursor: pointer;
    border: 1px solid var(--toggle-rule);
    color: var(--toggle-ink);
    background: transparent;
    place-items: center;
    transition:
      background-color var(--dur-micro) var(--ease-out),
      color var(--dur-micro) var(--ease-out);
  }

  .close span {
    width: 0.875rem;
    height: 0.875rem;
  }

  @media (hover: hover) {
    .close:hover {
      color: var(--toggle-active-ink);
      background-color: var(--toggle-ink);
    }
  }

  .close:focus-visible {
    outline: 2px solid var(--color-focus);
    outline-offset: 2px;
  }

  .theme-label {
    width: 100%;
  }

  @media (hover: hover) {
    .slip:hover {
      color: var(--menu-highlight);
      transform: translateY(-2px)
        rotate(
          calc(var(--slip-effective-rotation, var(--slip-rotation)) + 1deg)
        );
    }
  }

  .slip:active {
    transform: translateY(1px)
      rotate(var(--slip-effective-rotation, var(--slip-rotation)));
  }

  .drift {
    position: absolute;
    top: var(--drift-top);
    right: var(--drift-right);
    bottom: var(--drift-bottom);
    left: var(--drift-left);
    z-index: 2;
    display: grid;
    width: max-content;
    max-width: calc(100vw - 1.5rem);
    padding: 0.5rem 0.7rem;
    overflow: hidden;
    color: var(--slip-ink);
    background: var(--slip-surface);
    filter: blur(var(--drift-blur));
    font-family: var(--font-stack-sans);
    font-size: clamp(0.75rem, 1.4vw, 1.1rem);
    font-style: normal;
    font-weight: 500;
    letter-spacing: 0.1em;
    line-height: 1.1;
    text-overflow: ellipsis;
    text-transform: uppercase;
    white-space: nowrap;
    opacity: var(--drift-opacity);
    pointer-events: none;
    transform: rotate(var(--drift-rotation));
    user-select: none;
  }

  .field-note {
    position: absolute;
    z-index: 3;
    right: var(--menu-gutter);
    bottom: var(--menu-gutter);
    margin: 0;
    color: var(--color-text-secondary);
    pointer-events: none;
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

  .stage.is-open:not(.is-closing) .slip,
  .stage.is-open:not(.is-closing) .theme-slip {
    animation: slip-enter var(--dur-long) var(--ease-out)
      var(--slip-enter-delay) backwards;
  }
  .stage.is-open:not(.is-closing) .drift {
    animation: drift-enter var(--dur-long) var(--ease-out)
      var(--drift-enter-delay, 0ms) backwards;
  }
  .stage.is-open:not(.is-closing) .orbits {
    animation: drift-enter var(--dur-long) var(--ease-out) 70ms backwards;
  }
  .stage.is-closing .slip,
  .stage.is-closing .theme-slip {
    animation: slip-leave var(--dur-long) var(--ease-out) both;
  }
  .stage.is-closing .drift,
  .stage.is-closing .orbits {
    animation: drift-leave var(--dur-long) var(--ease-out) both;
  }

  @media (max-width: 40rem) {
    .orbits {
      inset: -14% -48%;
      width: 196%;
      height: 128%;
      opacity: 0.1;
    }

    .slip {
      --slip-effective-rotation: 0deg;

      right: var(--menu-inset-right);
      left: var(--menu-inset-left);
      width: auto;
      max-width: none;
      min-height: 4.875rem;
      padding: 0.75rem 0.875rem 0.875rem;
      gap: 0.3rem;
    }

    .slip.observation {
      top: max(18%, 5.5rem);
      bottom: auto;
    }

    .slip.directory {
      top: calc(max(18%, 5.5rem) + 5.625rem);
      bottom: auto;
    }

    .slip.transmission {
      top: calc(max(18%, 5.5rem) + 11.25rem);
      bottom: auto;
    }

    .slip-title {
      font-size: clamp(1.5rem, 7.5vw, 2.125rem);
    }

    .theme-slip {
      --slip-effective-rotation: 0deg;
      --theme-toggle-size: 2.25rem;

      top: auto;
      right: var(--menu-inset-right);
      bottom: max(var(--menu-gutter), env(safe-area-inset-bottom));
      left: var(--menu-inset-left);
      width: auto;
      min-height: 5.625rem;
      padding: 0.75rem 0.875rem;
    }

    .close {
      width: 2.25rem;
      height: 2.25rem;
    }

    .close span {
      width: 1rem;
      height: 1rem;
    }

    .drift {
      top: var(--drift-top-compact, var(--drift-top));
      right: var(--drift-right-compact, var(--drift-right));
      bottom: var(--drift-bottom-compact, var(--drift-bottom));
      left: var(--drift-left-compact, var(--drift-left));
    }
    .field-note {
      display: none;
    }
  }

  @media (max-height: 42rem) and (max-width: 40rem) {
    .slip {
      min-height: 0;
      padding-block: 0.55rem 0.625rem;
    }

    .slip-detail {
      display: none;
    }

    .slip.directory {
      top: calc(max(15%, 4rem) + 4.5rem);
    }

    .slip.transmission {
      top: calc(max(15%, 4rem) + 9rem);
    }

    .theme-slip {
      min-height: 4.875rem;
      gap: 0.35rem;
    }

    .theme-label {
      display: none;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .stage.is-open .slip,
    .stage.is-open .theme-slip,
    .stage.is-open .drift,
    .stage.is-open .orbits {
      animation: none;
    }
  }
</style>

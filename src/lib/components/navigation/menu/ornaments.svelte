<script lang="ts">
  import { drifts } from './content'

  interface Props {
    is_closing: boolean
    is_open: boolean
  }

  const { is_closing, is_open }: Props = $props()
</script>

<div
  class:is-closing={is_closing}
  class:is-open={is_open}
  class="ornaments"
>
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
      class="drift-layer"
      style:--drift-enter-delay={drift.layout.enter_delay}
    >
      <span
        class="drift"
        style:--drift-bottom={drift.layout.bottom}
        style:--drift-blur={drift.layout.blur}
        style:--drift-left={drift.layout.left}
        style:--drift-right={drift.layout.right}
        style:--drift-rotation={drift.layout.rotation}
        style:--drift-tone={drift.layout.tone}
        style:--drift-top={drift.layout.top}
        style:--drift-bottom-compact={drift.layout.compact?.bottom}
        style:--drift-left-compact={drift.layout.compact?.left}
        style:--drift-right-compact={drift.layout.compact?.right}
        style:--drift-top-compact={drift.layout.compact?.top}
        >{drift.text}</span
      >
    </span>
  {/each}
</div>

<style>
  .ornaments {
    position: absolute;
    inset: 0;
    z-index: 1;
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
    background: color-mix(
      in oklab,
      var(--slip-surface) calc(var(--drift-tone) * 100%),
      var(--color-paper)
    );
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
    transform: rotate(var(--drift-rotation));
    user-select: none;
  }

  .drift-layer {
    position: absolute;
    inset: 0;
    z-index: 2;
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

  .ornaments.is-open:not(.is-closing) .drift-layer {
    animation: drift-enter var(--dur-long) var(--ease-out)
      var(--drift-enter-delay, 0ms) backwards;
  }

  .ornaments.is-open:not(.is-closing) .orbits {
    animation: drift-enter var(--dur-long) var(--ease-out) 70ms backwards;
  }

  .ornaments.is-closing .drift-layer,
  .ornaments.is-closing .orbits {
    animation: drift-leave var(--dur-long) var(--ease-out) both;
  }

  @media (width < 40rem) {
    .orbits {
      inset: -14% -48%;
      width: 196%;
      height: 128%;
      opacity: 0.1;
    }

    .drift {
      top: var(--drift-top-compact, var(--drift-top));
      right: var(--drift-right-compact, var(--drift-right));
      bottom: var(--drift-bottom-compact, var(--drift-bottom));
      left: var(--drift-left-compact, var(--drift-left));
    }

    .drift-layer {
      display: none;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .ornaments.is-open .drift-layer,
    .ornaments.is-open .orbits {
      animation: none;
    }
  }
</style>

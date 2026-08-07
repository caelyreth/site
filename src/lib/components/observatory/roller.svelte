<script lang="ts">
  import type { SkyMapRollerMotionStatus } from '$lib/graphics/observatory/sky-map-field'

  type IndexRollerProps = {
    active: boolean
    motion: SkyMapRollerMotionStatus
    rollerVisible: boolean
    signalColor: string
  }

  const indexPerforations = Array.from({ length: 28 })

  /* oxlint-disable prefer-const -- props react to live roller state. */
  let {
    active,
    motion,
    rollerVisible,
    signalColor,
  }: IndexRollerProps = $props()
</script>

<section
  class:active
  class:rollerDown={motion.direction > 0}
  class:rollerUp={motion.direction < 0}
  class:rollerVisible
  class="strip strip-index"
  style:--aperture-signal={signalColor}
  style:--roller-duration={`${motion.duration}ms`}
  style:--roller-cycle={motion.direction > 0 ? '3.19rem' : '-3.19rem'}
>
  <div class="material" aria-hidden="true">
    <span class="index-perforation-track">
      {#each indexPerforations as _}
        <i></i>
      {/each}
    </span>
    <span class="index-roller">
      {#key motion.sequence}
        <span
          class:is-moving={motion.sequence > 0}
          class="index-roller-track"
        ></span>
      {/key}
    </span>
    <span class="material-exposure"></span>
  </div>

  <span class="continuity-line" aria-hidden="true"></span>
  <span class="signal-swatch" aria-hidden="true"></span>
</section>

<style>
  .strip {
    --aperture-fill: var(--strip-fill);
    --aperture-line: color-mix(
      in oklab,
      var(--color-rule) 76%,
      transparent
    );
    --aperture-print: color-mix(
      in oklab,
      var(--color-ink) 72%,
      transparent
    );
    --plate-delay: 360ms;
    --signal-delay: 150ms;
    position: relative;
    min-width: 0;
    overflow: hidden;
    contain: paint;
    border-inline: 1px solid var(--aperture-line);
    clip-path: inset(0 100% 0 0);
    background-color: var(--aperture-fill);
    animation: strip-reveal 640ms var(--ease-in-out) var(--plate-delay) both;
    transition:
      border-color 600ms cubic-bezier(0.4, 0, 0.2, 1),
      background-color 600ms cubic-bezier(0.4, 0, 0.2, 1);
  }

  .strip::before,
  .strip::after {
    position: absolute;
    z-index: 3;
    pointer-events: none;
    content: '';
  }

  .strip::before {
    inset: 0.75rem 0.4rem;
    border-block: 1px solid var(--aperture-line);
  }

  .strip::after {
    top: 0.75rem;
    bottom: 0.75rem;
    left: 0.4rem;
    width: 0.28rem;
    border-inline: 1px solid var(--aperture-line);
    opacity: 0.68;
  }

  .material,
  .material span {
    position: absolute;
    inset: 0;
    pointer-events: none;
  }

  .material {
    z-index: 0;
    overflow: hidden;
  }

  .material-exposure {
    transform-origin: center;
    transition:
      opacity 720ms var(--ease-out),
      transform 960ms var(--ease-in-out);
  }

  .continuity-line {
    position: absolute;
    z-index: 2;
    top: 67%;
    right: 0;
    left: 0;
    height: 1px;
    background: var(--aperture-line);
    transition:
      background-color 520ms var(--ease-out),
      opacity 520ms var(--ease-out);
  }

  .continuity-line::after {
    position: absolute;
    top: -0.16rem;
    right: 11%;
    width: 0.32rem;
    height: 0.32rem;
    border: 1px solid var(--aperture-line);
    content: '';
    transform: rotate(45deg);
    transition:
      border-color 520ms var(--ease-out),
      transform 720ms var(--ease-out);
  }

  .continuity-line::before {
    position: absolute;
    inset: 0 auto auto 0;
    width: 30%;
    height: 1px;
    background: var(--aperture-signal);
    content: '';
    opacity: 0;
    transform: translateX(-140%) scaleX(0.35);
    transform-origin: left;
  }

  .material .index-perforation-track {
    position: absolute;
    top: -7rem;
    bottom: -7rem;
    left: 0.4rem;
    display: grid;
    width: 0.42rem;
    grid-template-rows: repeat(28, 1fr);
    place-items: center;
    opacity: 0;
    transition: opacity 1000ms var(--ease-out);
  }

  .index-perforation-track i {
    display: block;
    width: 0.15rem;
    height: 0.15rem;
    border-radius: 50%;
    background: var(--aperture-print);
    opacity: 0.5;
  }

  .material .index-roller {
    position: absolute;
    inset: 9% 16% 9% 46%;
    overflow: hidden;
    opacity: 0;
    transition: opacity 1000ms var(--ease-out);
    mask-image: linear-gradient(
      to bottom,
      rgb(0 0 0 / 0.1),
      rgb(0 0 0 / 0.2) 10%,
      rgb(0 0 0 / 0.56) 28%,
      #000 46%,
      #000 54%,
      rgb(0 0 0 / 0.56) 72%,
      rgb(0 0 0 / 0.2) 90%,
      rgb(0 0 0 / 0.1)
    );
    mask-mode: alpha;
    mask-repeat: no-repeat;
    mask-size: 100% 100%;
    -webkit-mask-image: linear-gradient(
      to bottom,
      rgb(0 0 0 / 0.1),
      rgb(0 0 0 / 0.2) 10%,
      rgb(0 0 0 / 0.56) 28%,
      #000 46%,
      #000 54%,
      rgb(0 0 0 / 0.56) 72%,
      rgb(0 0 0 / 0.2) 90%,
      rgb(0 0 0 / 0.1)
    );
    -webkit-mask-repeat: no-repeat;
    -webkit-mask-size: 100% 100%;
  }

  .material .index-roller-track {
    position: absolute;
    inset: -3.19rem 0;
    background-image: repeating-linear-gradient(
      to bottom,
      var(--aperture-print) 0 0.04rem,
      transparent 0.04rem 0.29rem
    );
    opacity: 0.34;
    pointer-events: none;
  }

  .index-roller-track.is-moving {
    animation: roller-cycle var(--roller-duration) var(--ease-in-out) both;
  }

  .strip.rollerVisible .index-perforation-track,
  .strip.rollerVisible .index-roller {
    opacity: 1;
  }

  .strip-index .material-exposure {
    top: auto;
    right: 0.5rem;
    bottom: 15%;
    left: 0.82rem;
    height: 24%;
    opacity: 0;
    background: var(--aperture-signal);
    transform: scaleY(0.22);
    transform-origin: bottom;
  }

  .strip.rollerDown .material-exposure {
    transform-origin: top;
  }

  .strip.rollerUp .material-exposure {
    transform-origin: bottom;
  }

  .signal-swatch {
    position: absolute;
    z-index: 4;
    right: 0.6rem;
    bottom: 1.1rem;
    width: 0.42rem;
    height: 0.42rem;
    border: 1px solid var(--aperture-line);
    background: transparent;
    transition:
      background-color 520ms var(--ease-out),
      border-color 520ms var(--ease-out),
      transform 720ms var(--ease-out);
  }

  .strip.active {
    border-color: color-mix(
      in oklab,
      var(--aperture-signal) 56%,
      var(--color-rule)
    );
    background-color: color-mix(
      in oklab,
      var(--aperture-signal) 5%,
      var(--aperture-fill)
    );
  }

  .strip.active .continuity-line {
    background: color-mix(
      in oklab,
      var(--aperture-signal) 64%,
      var(--color-rule)
    );
  }

  .strip.active .continuity-line::after {
    border-color: var(--aperture-signal);
    transform: translateX(-0.38rem) rotate(135deg);
    transition-delay: var(--signal-delay);
  }

  .strip.active .continuity-line::before {
    animation: signal-traverse 1.28s cubic-bezier(0.46, 0, 0.22, 1)
      var(--signal-delay) both;
  }

  .strip.active .material-exposure {
    opacity: 0.18;
    transform: scaleY(1);
  }

  .strip.active .signal-swatch {
    border-color: var(--aperture-signal);
    background: var(--aperture-signal);
    transform: rotate(45deg);
  }

  @media (max-width: 38rem) {
    .strip::before {
      inset: 0.4rem 0.2rem;
    }

    .strip::after {
      top: 0.4rem;
      bottom: 0.4rem;
      left: 0.2rem;
      width: 0.2rem;
    }

    .signal-swatch {
      right: 0.3rem;
      bottom: 0.58rem;
      width: 0.3rem;
      height: 0.3rem;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .strip,
    .strip.active .continuity-line::before,
    .index-roller-track.is-moving {
      animation: none;
    }

    .strip {
      clip-path: none;
    }

    .strip,
    .material-exposure,
    .continuity-line,
    .continuity-line::before,
    .continuity-line::after,
    .index-perforation-track,
    .index-roller,
    .signal-swatch {
      transition-duration: 0ms;
    }

  }

  @keyframes strip-reveal {
    to {
      clip-path: inset(0);
    }
  }

  @keyframes signal-traverse {
    0% {
      opacity: 0;
      transform: translateX(-140%) scaleX(0.35);
    }
    18% {
      opacity: 0.92;
    }
    70% {
      opacity: 0.76;
      transform: translateX(250%) scaleX(1);
    }
    100% {
      opacity: 0;
      transform: translateX(380%) scaleX(0.42);
    }
  }

  @keyframes roller-cycle {
    to {
      transform: translateY(var(--roller-cycle));
    }
  }
</style>

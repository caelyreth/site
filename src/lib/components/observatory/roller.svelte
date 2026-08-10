<script lang="ts">
  import type { SkyMapRollerMotionStatus } from '$lib/graphics/observatory/types'
  import { fly } from 'svelte/transition'

  import './aperture-strip.css'

  type IndexRollerProps = {
    active: boolean
    motion: SkyMapRollerMotionStatus
    roller_visible: boolean
  }

  const index_perforations = Array.from({ length: 44 })

  /* oxlint-disable prefer-const -- props react to live roller state. */
  let { active, motion, roller_visible }: IndexRollerProps = $props()
  let continuity_position = $state(67)
  let was_active = false

  $effect.pre(() => {
    if (active && !was_active) {
      continuity_position = 16 + Math.floor(Math.random() * 69)
    }
    was_active = active
  })
</script>

<section
  class:active
  class:rollerDown={motion.direction > 0}
  class:rollerUp={motion.direction < 0}
  class:rollerVisible={roller_visible}
  class="observatory-strip roller-strip"
  style:--continuity-position={`${continuity_position}%`}
  style:--roller-duration={`${motion.duration}ms`}
  style:--roller-cycle={motion.direction > 0 ? '3.19rem' : '-3.19rem'}
>
  <div class="material" aria-hidden="true">
    <span class="index-perforation-track">
      {#each index_perforations as _}
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

  <span class="observatory-strip__meta roller-meta">AP-04</span>
  <span class="observatory-strip__readout roller-readout">
    {#if motion.direction > 0}
      <span
        class="roller-readout-value"
        in:fly={{ y: -4, duration: 240 }}
        out:fly={{ y: 4, duration: 180 }}>DEC DN</span
      >
    {:else}
      <span
        class="roller-readout-value"
        in:fly={{ y: 4, duration: 240 }}
        out:fly={{ y: -4, duration: 180 }}>DEC UP</span
      >
    {/if}
  </span>
  <span class="continuity-line" aria-hidden="true"></span>
  <span class="signal-swatch" aria-hidden="true"></span>
</section>

<style>
  .roller-strip {
    --observatory-strip-fill: var(--strip-fill);
    --observatory-strip-line: color-mix(
      in oklab,
      var(--color-rule) 76%,
      transparent
    );
    --observatory-strip-frame-line: var(--observatory-strip-line);
    --observatory-strip-frame-inset: 0.75rem 0.4rem;
    --observatory-strip-frame-z-index: 3;
    --observatory-strip-label-z-index: 4;
    --observatory-strip-reveal-delay: 360ms;
    --observatory-strip-active-line-mix: 56%;
    --aperture-print: color-mix(
      in oklab,
      var(--color-ink) 72%,
      transparent
    );
    --signal-delay: 150ms;
  }

  .roller-strip::after {
    top: 0.75rem;
    bottom: 0.75rem;
    left: 0.4rem;
    width: 0.28rem;
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
      opacity var(--dur-observatory-travel) var(--ease-out),
      transform var(--dur-observatory-fade) var(--ease-in-out);
  }

  .roller-readout {
    width: 3rem;
    height: 0.5rem;
  }

  .roller-readout-value {
    position: absolute;
    top: 0;
    right: 0;
    white-space: nowrap;
  }

  .continuity-line {
    position: absolute;
    z-index: 2;
    top: var(--continuity-position);
    right: 0;
    left: 0;
    height: 1px;
    opacity: 0;
    background: var(--observatory-strip-line);
    transform: scaleX(0.72);
    transform-origin: left;
    transition:
      background-color var(--dur-observatory-surface) var(--ease-out),
      opacity var(--dur-observatory-surface) var(--ease-out);
  }

  .continuity-line::after {
    position: absolute;
    top: -0.16rem;
    right: 11%;
    width: 0.32rem;
    height: 0.32rem;
    border: 1px solid var(--observatory-strip-line);
    content: '';
    transform: rotate(45deg);
    transition:
      border-color var(--dur-observatory-surface) var(--ease-out),
      transform var(--dur-observatory-travel) var(--ease-out);
  }

  .continuity-line::before {
    position: absolute;
    inset: 0 auto auto 0;
    width: 30%;
    height: 1px;
    background: var(--observatory-signal);
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
    grid-template-rows: repeat(44, 1fr);
    place-items: center;
    opacity: 0;
    transition: opacity var(--dur-observatory-fade) var(--ease-out);
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
    transition: opacity var(--dur-observatory-fade) var(--ease-out);
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

  .roller-strip.rollerVisible .index-perforation-track,
  .roller-strip.rollerVisible .index-roller {
    opacity: 1;
  }

  .roller-strip .material-exposure {
    top: auto;
    right: 0.5rem;
    bottom: 15%;
    left: 0.82rem;
    height: 24%;
    opacity: 0;
    background: var(--observatory-signal);
    transform: scaleY(0.22);
    transform-origin: bottom;
  }

  .roller-strip.rollerDown .material-exposure {
    transform-origin: top;
  }

  .roller-strip.rollerUp .material-exposure {
    transform-origin: bottom;
  }

  .signal-swatch {
    position: absolute;
    z-index: 4;
    right: 0.6rem;
    bottom: 1.1rem;
    width: 0.42rem;
    height: 0.42rem;
    border: 1px solid var(--observatory-strip-line);
    background: transparent;
    transition:
      background-color var(--dur-observatory-surface) var(--ease-out),
      border-color var(--dur-observatory-surface) var(--ease-out),
      transform var(--dur-observatory-travel) var(--ease-out);
  }

  .roller-strip.active .continuity-line {
    background: color-mix(
      in oklab,
      var(--observatory-signal) 64%,
      var(--observatory-strip-line)
    );
    animation: continuity-lightup 1.04s var(--ease-out) both;
  }

  .roller-strip.active .continuity-line::after {
    border-color: var(--observatory-signal);
    transform: translateX(-0.38rem) rotate(135deg);
    transition-delay: var(--signal-delay);
  }

  .roller-strip.active .continuity-line::before {
    animation: signal-traverse 1.28s var(--ease-observatory-traverse)
      var(--signal-delay) both;
  }

  .roller-strip.active .material-exposure {
    opacity: 0.18;
    transform: scaleY(1);
  }

  .roller-strip.active .signal-swatch {
    border-color: var(--observatory-signal);
    background: var(--observatory-signal);
    transform: rotate(45deg);
  }

  @media (max-width: 38rem) {
    .roller-strip {
      --observatory-strip-frame-inset: 0.4rem 0.2rem;
    }

    .roller-strip::after {
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
    .roller-strip.active .continuity-line::before,
    .index-roller-track.is-moving {
      animation: none;
    }

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

  @keyframes continuity-lightup {
    0% {
      opacity: 0;
      transform: scaleX(0.72);
    }
    24% {
      opacity: 0.96;
    }
    100% {
      opacity: 0.72;
      transform: scaleX(1);
    }
  }
</style>
